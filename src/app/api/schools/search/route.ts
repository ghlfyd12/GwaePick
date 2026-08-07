import { NextResponse } from "next/server";
import { supabaseServer, isSupabaseConfigured } from "@/lib/supabase/server";
import { expandSchoolName } from "@/lib/schoolName";

/*
 * 학교명 자동완성 — GET /api/schools/search?q=검색어
 *
 * 신청폼(/apply)의 학교 입력에서만 호출한다. 브라우저는 Supabase 를 직접 호출하지 않고
 * 반드시 이 라우트를 경유한다(schools 는 RLS 로 anon 접근이 차단돼 있다).
 *
 * 규칙: 2글자 미만이면 빈 배열, school_name ILIKE 부분일치, 최대 10건.
 * 약칭 지원: schools 는 NEIS 정식명("숭의여자고등학교")만 담으므로 약칭("숭의여고")은
 *   substring 으로 안 걸린다. expandSchoolName 으로 약칭→정식명을 만들어 원본 q 와 함께
 *   OR ILIKE 로 검색하고(중복 제거) 정식명 검색·부분 입력은 기존대로 유지한다.
 */

// Edge 런타임 — 유저 근처 PoP 에서 실행해 미국 우회(iad1) 없이 아시아 Supabase 와 짧은 홉.
// supabase-js v2 는 PostgREST REST(fetch 기반)만 사용하므로 Edge 호환. 모듈 스코프 클라 싱글턴은
// supabaseServer() 가 이미 캐시하므로 웜 아이솔레이트에서 그대로 재사용된다. 검색 로직은 불변.
export const runtime = "edge";
/** 검색어마다 결과가 달라지므로 캐시하지 않는다. */
export const dynamic = "force-dynamic";

const MIN_QUERY_LENGTH = 2;
const LIMIT = 10;

/** ILIKE 와일드카드(%, _)와 이스케이프 문자를 무력화한다. */
function sanitize(q: string): string {
  return q.replace(/[\\%_]/g, " ").trim().slice(0, 40);
}

export async function GET(request: Request) {
  const raw = new URL(request.url).searchParams.get("q") ?? "";
  const q = sanitize(raw);

  // 2글자 미만은 조회하지 않는다(전체 스캔 방지).
  if (q.length < MIN_QUERY_LENGTH) {
    return NextResponse.json({ schools: [] });
  }

  if (!isSupabaseConfigured()) {
    console.error("[schools/search] Supabase 환경변수 누락");
    return NextResponse.json({ error: "SERVER_NOT_CONFIGURED" }, { status: 500 });
  }

  // 약칭이면 정식명을 만들어 함께 검색(예: "숭의여고"→"숭의여자고등학교"). 규칙 밖이면 null.
  // 부분 입력("숭의여")은 expandSchoolName 이 null 을 반환하므로 원본 q 부분일치만 쓰인다.
  // q 는 sanitize 로 콤마·괄호·와일드카드가 제거돼 있어 or() 필터 인젝션이 없다.
  const expanded = expandSchoolName(q);
  const terms = expanded && expanded !== q ? [q, expanded] : [q];
  const orFilter = terms.map((v) => `school_name.ilike.%${v}%`).join(",");

  const { data, error } = await supabaseServer()
    .from("schools")
    .select("school_code, school_name, school_level, sido_name, sigungu_name")
    .or(orFilter)
    .order("school_name")
    .limit(LIMIT);

  if (error) {
    // 검색어는 개인정보가 아니지만, 로그에는 오류 메시지만 남긴다.
    console.error("[schools/search] 조회 실패:", error.message);
    return NextResponse.json({ error: "SEARCH_FAILED" }, { status: 502 });
  }

  // OR 는 행을 중복 반환하지 않지만, 방어적으로 school_code 기준 dedupe 후 최대 LIMIT 건.
  const seen = new Set<string>();
  const schools = (data ?? [])
    .filter((s) => (seen.has(s.school_code) ? false : (seen.add(s.school_code), true)))
    .slice(0, LIMIT);

  return NextResponse.json({ schools });
}
