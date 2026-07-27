import { NextResponse } from "next/server";
import { supabaseServer, isSupabaseConfigured } from "@/lib/supabase/server";
import {
  NAME_MAX,
  MEMO_MAX,
  isGrade,
  isLessonType,
  isSchoolFallback,
  normalizePhone,
} from "@/data/applyFormOptions";

/*
 * 신청폼 제출 — POST /api/inquiries
 *
 * 저장: inquiries 1건 + inquiry_subjects N건.
 * PostgREST 에는 트랜잭션이 없으므로, 과목 삽입이 실패하면 방금 만든 inquiries 행을 지운다(정리 로직).
 *
 * 개인정보 취급:
 *   - 이름·연락처·상담내용은 어떤 경우에도 로그에 남기지 않는다(필드명·오류코드만 기록).
 *   - 응답은 성공 시 { ok: true } 만 — inquiry_id 등 내부 값은 노출하지 않는다.
 *   - consent_at 은 클라이언트 값을 믿지 않고 서버 시각으로 기록한다.
 *
 * 남용 방지: 같은 IP 가 1분 안에 3회를 넘겨 제출하면 429.
 *   ⚠️ 인메모리 카운터라 서버리스 인스턴스마다 따로 센다(완전한 차단이 아닌 1차 방어).
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ── 남용 방지(인메모리) ─────────────────────────────────────────────── */
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 3;
const hits = new Map<string, number[]>();

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

/**
 * 창(1분) 안에 저장된 신청이 한도를 넘었는지.
 * 세는 대상은 "실제로 저장된 건"뿐이다 — 연락처를 몇 번 잘못 입력한 정상 사용자가
 * 막히지 않도록, 검증 실패(400)는 횟수에 넣지 않는다.
 */
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  hits.set(ip, recent);
  return recent.length >= RATE_MAX;
}

/** 저장에 성공했을 때만 호출 — 이때 한 건으로 센다. */
function recordSubmission(ip: string) {
  const now = Date.now();
  hits.set(ip, [...(hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS), now]);

  // 오래된 IP 정리(메모리 누수 방지).
  if (hits.size > 5_000) {
    for (const [key, times] of hits) {
      if (times.every((t) => now - t >= RATE_WINDOW_MS)) hits.delete(key);
    }
  }
}

/* ── 요청 본문 ───────────────────────────────────────────────────────── */
type InquiryPayload = {
  name?: string;
  phone?: string;
  sidoCode?: string;
  sigunguCode?: string;
  /** 자동완성으로 고른 학교. 미선택이면 생략. */
  schoolCode?: string | null;
  /** 학교를 못 고른 사유("목록에 없음" 등). schoolCode 가 없을 때만 의미가 있다. */
  schoolFallback?: string | null;
  grade?: string;
  lessonType?: string;
  subjectIds?: number[];
  memo?: string;
  agree?: boolean;
  /** 유입 파라미터 — memo 끝에 [utm:...] 형태로 덧붙인다(Phase 3 에서 컬럼 분리 예정). */
  utmSource?: string;
  utmCampaign?: string;
};

const bad = (fields: string[]) =>
  NextResponse.json({ ok: false, error: "VALIDATION_FAILED", fields }, { status: 400 });

export async function POST(request: Request) {
  if (!isSupabaseConfigured()) {
    console.error("[inquiries] Supabase 환경변수 누락");
    return NextResponse.json({ ok: false, error: "SERVER_NOT_CONFIGURED" }, { status: 500 });
  }

  const ip = clientIp(request);
  if (isRateLimited(ip)) {
    return NextResponse.json({ ok: false, error: "TOO_MANY_REQUESTS" }, { status: 429 });
  }

  let data: InquiryPayload;
  try {
    data = (await request.json()) as InquiryPayload;
  } catch {
    return NextResponse.json({ ok: false, error: "INVALID_REQUEST" }, { status: 400 });
  }

  /* ── 1) 형식 검증(DB 를 보지 않고 판단 가능한 것) ──────────────────── */
  const invalid: string[] = [];

  const name = (data.name ?? "").trim();
  if (name.length < 1 || name.length > NAME_MAX) invalid.push("name");

  const phone = normalizePhone(data.phone ?? "");
  if (!phone) invalid.push("phone");

  const sidoCode = (data.sidoCode ?? "").trim();
  const sigunguCode = (data.sigunguCode ?? "").trim();
  if (!sidoCode) invalid.push("sidoCode");
  if (!sigunguCode) invalid.push("sigunguCode");

  if (!isGrade(data.grade)) invalid.push("grade");
  if (!isLessonType(data.lessonType)) invalid.push("lessonType");

  const subjectIds = Array.isArray(data.subjectIds)
    ? [...new Set(data.subjectIds.filter((v) => Number.isInteger(v) && v > 0))]
    : [];
  if (subjectIds.length === 0) invalid.push("subjectIds");

  if (data.agree !== true) invalid.push("agree");

  const schoolCode = (data.schoolCode ?? "").trim();
  const schoolFallback = (data.schoolFallback ?? "").trim();
  if (schoolFallback && !isSchoolFallback(schoolFallback)) invalid.push("schoolFallback");
  if (!schoolCode && !schoolFallback) invalid.push("school");

  if (invalid.length) return bad(invalid);

  /* ── 2) 참조 검증(DB 조회) ────────────────────────────────────────── */
  const supabase = supabaseServer();

  // 지역 코드 — 별도 지역 테이블이 없으므로 schools 캐시에 실재하는 조합인지 확인한다.
  const region = await supabase
    .from("schools")
    .select("school_code", { head: true, count: "exact" })
    .eq("sido_code", sidoCode)
    .eq("sigungu_code", sigunguCode);
  if (region.error) {
    console.error("[inquiries] 지역 검증 실패:", region.error.message);
    return NextResponse.json({ ok: false, error: "LOOKUP_FAILED" }, { status: 502 });
  }
  if (!region.count) return bad(["sidoCode", "sigunguCode"]);

  // 과목 — 전부 subjects 테이블에 있어야 한다.
  const subjects = await supabase
    .from("subjects")
    .select("subject_id")
    .in("subject_id", subjectIds);
  if (subjects.error) {
    console.error("[inquiries] 과목 검증 실패:", subjects.error.message);
    return NextResponse.json({ ok: false, error: "LOOKUP_FAILED" }, { status: 502 });
  }
  if ((subjects.data?.length ?? 0) !== subjectIds.length) return bad(["subjectIds"]);

  // 학교 — 고른 경우에만 실재 확인(FK 위반을 400 으로 먼저 걸러낸다).
  if (schoolCode) {
    const school = await supabase
      .from("schools")
      .select("school_code", { head: true, count: "exact" })
      .eq("school_code", schoolCode);
    if (school.error) {
      console.error("[inquiries] 학교 검증 실패:", school.error.message);
      return NextResponse.json({ ok: false, error: "LOOKUP_FAILED" }, { status: 502 });
    }
    if (!school.count) return bad(["schoolCode"]);
  }

  /* ── 3) memo 조립 — 본문 + [학교:...] + [utm:...] ─────────────────── */
  const tags: string[] = [];
  if (!schoolCode && schoolFallback) tags.push(`[학교:${schoolFallback}]`);
  const utm = [
    data.utmSource ? `source=${String(data.utmSource).slice(0, 50)}` : "",
    data.utmCampaign ? `campaign=${String(data.utmCampaign).slice(0, 50)}` : "",
  ].filter(Boolean);
  if (utm.length) tags.push(`[utm:${utm.join(",")}]`);

  const memoBody = (data.memo ?? "").trim().slice(0, MEMO_MAX);
  const memo = [memoBody, ...tags].filter(Boolean).join(" ").trim() || null;

  /* ── 4) 저장 — inquiries → inquiry_subjects(실패 시 되돌린다) ─────── */
  const inserted = await supabase
    .from("inquiries")
    .insert({
      student_name: name,
      phone,
      memo,
      consent_at: new Date().toISOString(), // 클라이언트 값 미신뢰 — 서버 시각.
      sido_code: sidoCode,
      sigungu_code: sigunguCode,
      school_code: schoolCode || null,
      grade: data.grade,
      lesson_type: data.lessonType,
    })
    .select("inquiry_id")
    .single();

  if (inserted.error || !inserted.data) {
    console.error("[inquiries] 저장 실패:", inserted.error?.message);
    return NextResponse.json({ ok: false, error: "INSERT_FAILED" }, { status: 502 });
  }

  const inquiryId = inserted.data.inquiry_id as number;
  const linked = await supabase
    .from("inquiry_subjects")
    .insert(subjectIds.map((subject_id) => ({ inquiry_id: inquiryId, subject_id })));

  if (linked.error) {
    // 과목 없는 신청은 집계에서 의미가 없으므로 방금 만든 행을 지운다(정리 로직).
    console.error("[inquiries] 과목 연결 실패 — 신청 행을 되돌립니다:", linked.error.message);
    const rollback = await supabase.from("inquiries").delete().eq("inquiry_id", inquiryId);
    if (rollback.error) {
      console.error("[inquiries] 되돌리기 실패(수동 정리 필요) inquiry_id:", inquiryId);
    }
    return NextResponse.json({ ok: false, error: "INSERT_FAILED" }, { status: 502 });
  }

  // 저장에 성공한 건만 남용 방지 카운터에 반영한다.
  recordSubmission(ip);

  // 내부 식별자는 응답에 담지 않는다.
  return NextResponse.json({ ok: true });
}
