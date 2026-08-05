/**
 * 표준폼(/apply) 리드 → Notion 듀얼 라이트(서버 전용).
 *
 * 정식 저장소는 Supabase 이고, Notion 은 운영자의 리드 확인 창구다.
 * Supabase 저장이 성공한 뒤 같은 리드를 이 모듈로 Notion 에 1건 더 기록한다.
 *
 * 설계 원칙:
 *   - 기존 홈 폼의 Notion 로직(lib/notion.ts · api/consult)은 건드리지 않는다.
 *     속성명 단일 소스인 NOTION_PROP·CONSULT_STATUS_NEW 만 읽어 재사용한다.
 *   - Notion DB 스키마를 바꾸지 않는다. 기존 옵션에 없는 값을 multi_select(학년·과목)로
 *     보내면 옵션이 자동 생성돼 스키마가 바뀌므로, 세분값은 "문의내용"(rich_text) 본문에 넣는다.
 *     깔끔히 매핑되는 속성만 기록: 이름·연락처·지역·유입페이지·서비스·상담 상태.
 *   - 호출 타임아웃 5초, 실패 시 1회 재시도. 실패해도 예외를 던지지 않고 {ok:false} 를 돌려준다
 *     (라우트가 사용자에겐 성공 응답을 주고 memo 에 실패 표기를 남긴다).
 *   - 로그·반환값에 이름·연락처 등 개인정보를 담지 않는다(에러 유형만).
 */
import "server-only";
import { Client } from "@notionhq/client";
import { NOTION_PROP, CONSULT_STATUS_NEW } from "./notion";
import { SERVICE } from "@/data/service";

/** 표준폼 유입임을 기존 폼과 구분하는 출처 표시. */
export const INQUIRY_SOURCE_LABEL = "표준폼";

/**
 * 표준폼 전용으로 추가된 Notion 속성명(scripts/ensure-notion-inquiry-props.ts 로 생성).
 * 기존 "학년"·"과목" multi_select(홈 폼용)와 겹치지 않도록 "표준" 접두를 쓴다.
 * 오타 시 기록이 통째로 실패하므로 상수 한 곳에서만 관리한다.
 */
export const STANDARD_PROP = {
  school: "학교", // rich_text
  grade: "표준학년", // select
  subject: "표준과목", // multi_select
  lessonType: "수업 형태", // select
} as const;

/** 수업 형태 코드 → Notion "수업 형태" select 옵션명. */
const LESSON_NOTION_OPTION: Record<string, string> = {
  visit: "방문",
  remote: "비대면",
  any: "무관",
};

const NOTION_TIMEOUT_MS = 5000;

export type InquiryNotionInput = {
  name: string;
  phone: string;
  /** "서울특별시 송파구" 형태의 지역 표시명. */
  regionName: string;
  /** 학교명 또는 대체 선택지("학교 미정" 등). 없으면 "(미입력)". */
  schoolLabel: string;
  /** 신청폼 grade 표시명(초1~N수) — "표준학년" select 값. */
  grade: string;
  /** 과목명 목록 — "표준과목" multi_select 값. */
  subjectNames: string[];
  /** 수업 형태 코드(visit/remote/any) — "수업 형태" select 로 매핑. */
  lessonType: string;
  /** 상담 내용 원문(태그 제외). 비면 빈 문자열. */
  memo: string;
  /** 유입 UTM 5종 + referrer — 각 rich_text 속성으로 기록(빈 값은 속성 생략). */
  utm?: {
    utm_source?: string | null;
    utm_medium?: string | null;
    utm_campaign?: string | null;
    utm_term?: string | null;
    utm_content?: string | null;
    referrer?: string | null;
  };
};

/** UTM 속성명 — Notion DB 속성명과 동일(scripts/ensure-notion-utm-props.ts 로 생성). */
const UTM_PROP_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "referrer",
] as const;

let _client: Client | null = null;
function inquiryNotionClient(): Client {
  if (!_client) {
    // 기존 홈 폼 클라이언트(notion.ts)와 별도로, 타임아웃을 건 클라이언트를 쓴다.
    _client = new Client({
      auth: process.env.NOTION_API_KEY,
      timeoutMs: NOTION_TIMEOUT_MS,
    });
  }
  return _client;
}

/** rich_text 값(2000자 제한). 빈 값이면 "(없음)". */
function richText(content: string) {
  const s = (content ?? "").trim() || "(없음)";
  return [{ type: "text" as const, text: { content: s.slice(0, 2000) } }];
}

/** 일시적 오류만 1회 재시도(rate_limit / 5xx / 타임아웃). 그 외는 즉시 throw. */
async function withOneRetry<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    const code = (e as { code?: string })?.code;
    const status = (e as { status?: number })?.status;
    const retryable =
      code === "rate_limited" ||
      code === "notionhq_client_request_timeout" ||
      status === 429 ||
      status === 502 ||
      status === 503;
    if (!retryable) throw e;
    await new Promise((r) => setTimeout(r, 400));
    return await fn();
  }
}

/**
 * 리드 1건을 Notion DB 에 기록. 성공/실패를 boolean 으로 돌려준다(던지지 않는다).
 * DB id 는 호출 시점에 읽는다(운영자의 실패 테스트에서 일시 변경이 반영되도록).
 */
export async function recordInquiryToNotion(
  input: InquiryNotionInput,
): Promise<{ ok: true; pageId?: string } | { ok: false; error: string }> {
  const databaseId = process.env.NOTION_DATABASE_ID;
  if (!process.env.NOTION_API_KEY || !databaseId) {
    return { ok: false, error: "not_configured" };
  }

  const P = NOTION_PROP;
  const S = STANDARD_PROP;
  const lessonOption = LESSON_NOTION_OPTION[input.lessonType] ?? input.lessonType;

  // UTM 5종 + referrer — 값이 있는 것만 rich_text 속성으로 추가(빈 값은 생략).
  const utmProps: Record<string, { rich_text: { type: "text"; text: { content: string } }[] }> = {};
  for (const key of UTM_PROP_KEYS) {
    const value = (input.utm?.[key] ?? "").trim();
    if (value) utmProps[key] = { rich_text: richText(value) };
  }

  const properties = {
    [P.name]: {
      title: [
        {
          type: "text" as const,
          text: { content: (input.name.trim() || "(이름 미입력)").slice(0, 2000) },
        },
      ],
    },
    ...(input.phone.trim() ? { [P.phone]: { phone_number: input.phone.trim() } } : {}),
    [P.region]: { rich_text: richText(input.regionName) },
    // 문의내용 본문에는 상담 내용(사용자 입력)만 남긴다 — 나머지는 아래 전용 속성으로.
    [P.message]: { rich_text: richText(input.memo) },
    // 표준폼 유입 표시 — 기존 폼(Referer 기록)과 구분.
    [P.source]: { rich_text: richText(`${INQUIRY_SOURCE_LABEL} (/apply)`) },
    // 서비스·상담 상태는 기존 옵션에 이미 존재하는 값만 쓴다(스키마 변경 없음).
    [P.service]: { select: { name: SERVICE.main } },
    [P.status]: { select: { name: CONSULT_STATUS_NEW } },
    // 표준폼 전용 속성(2-A 보강) — 학교·학년·과목·수업형태를 본문 대신 속성으로 기록.
    [S.school]: { rich_text: richText(input.schoolLabel) },
    [S.grade]: { select: { name: input.grade } },
    [S.subject]: {
      multi_select: input.subjectNames
        .filter((n) => n.trim())
        .map((name) => ({ name: name.trim() })),
    },
    [S.lessonType]: { select: { name: lessonOption } },
    // 유입 UTM 5종 + referrer(값 있는 것만).
    ...utmProps,
  };

  try {
    const page = await withOneRetry(() =>
      inquiryNotionClient().pages.create({
        parent: { database_id: databaseId },
        // 위에서 조립한 속성만 전송(존재하는 속성/옵션만 사용).
        properties: properties as Parameters<Client["pages"]["create"]>[0]["properties"],
      }),
    );
    return { ok: true, pageId: page.id };
  } catch (e) {
    // 개인정보 없이 에러 유형만 반환한다(라우트가 로깅·memo 표기).
    const err = e as { code?: string; status?: number; name?: string };
    return { ok: false, error: err.code ?? err.name ?? `status_${err.status ?? "unknown"}` };
  }
}
