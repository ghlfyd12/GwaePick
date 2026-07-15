import { Client } from "@notionhq/client";
import type { CreatePageParameters } from "@notionhq/client/build/src/api-endpoints";
import type { ServiceName } from "@/data/service";

/*
 * 노션 연동 단일 소스 — 상담 리드 삽입.
 *
 * 속성명은 아래 NOTION_PROP 한 곳에서만 관리한다(라우트 하드코딩 금지).
 * 실제 DB 스키마와 글자 단위로 일치해야 한다 — `npx tsx scripts/inspect-notion.ts` 로 검증.
 * 실측(2026-07-09): 이름=title / 연락처=phone_number / 지역=rich_text /
 *   학년·과목=multi_select / 문의내용·유입페이지=rich_text / 상담 상태=select / 신청일시=created_time.
 *
 * ⚠️ Notion DB 에 "서비스" Select 속성(옵션: 지식의참견 / 어학의참견)이 있어야 한다.
 *    없으면 `npx tsx scripts/ensure-notion-service-property.ts` 로 1회 생성(멱등).
 *    주소·상세주소는 폼에서 결합되어 기존 "지역"(rich_text)에 저장한다(별도 속성 추가 불필요).
 */

/** 노션 실제 속성명(공백 포함) 단일 소스. */
export const NOTION_PROP = {
  name: "이름", // title
  phone: "연락처", // phone_number
  region: "지역", // rich_text (주소 + 상세주소 결합)
  grade: "학년", // multi_select
  subject: "과목", // multi_select
  message: "문의내용", // rich_text
  source: "유입페이지", // rich_text (Referer)
  status: "상담 상태", // select — 공백 포함(글자 단위 일치 필수)
  service: "서비스", // select — 지식의참견 / 어학의참견
  // 신청일시(created_time)는 노션이 자동 기록 → 코드에서 전송하지 않는다.
} as const;

/** 상담 상태는 클라이언트 입력과 무관하게 서버에서 항상 이 값으로 강제한다. */
export const CONSULT_STATUS_NEW = "신규";

let _client: Client | null = null;
export function notionClient(): Client {
  if (!_client) _client = new Client({ auth: process.env.NOTION_API_KEY });
  return _client;
}

/** 값이 undefined/null 인 속성은 아예 제외(존재하지 않는 값을 노션에 보내지 않음). */
function pruneUndefined<T extends Record<string, unknown>>(obj: T): T {
  const out = {} as T;
  for (const [k, v] of Object.entries(obj))
    if (v !== undefined && v !== null) (out as Record<string, unknown>)[k] = v;
  return out;
}

/** 문자열 → rich_text 값(빈 값이면 undefined → 속성 자체 제외). 2000자 제한 대비 자름. */
function richTextValue(content: string) {
  const s = (content ?? "").trim();
  return s ? [{ type: "text" as const, text: { content: s.slice(0, 2000) } }] : undefined;
}

/** 문자열 배열 → multi_select 값(빈 값 제거). 비면 undefined → 속성 제외. */
function multiSelectValue(values: unknown) {
  const opts = (Array.isArray(values) ? values : [])
    .filter((v): v is string => typeof v === "string" && v.trim().length > 0)
    .map((name) => ({ name: name.trim() }));
  return opts.length ? opts : undefined;
}

export type ConsultLead = {
  name: string;
  phone: string;
  /** 주소 + 상세주소 결합("지역"에 저장). 어학의참견 폼도 주소를 받으므로 채워진다. */
  region: string;
  grades: string[];
  subjects: string[];
  message: string;
  source: string;
  /** 어느 서비스에서 온 리드인지(지식의참견 / 어학의참견). */
  service: ServiceName;
};

/** 리드 → 노션 properties(빈 값 속성 제외, 상담 상태는 항상 "신규"). */
export function buildConsultProperties(
  lead: ConsultLead,
): CreatePageParameters["properties"] {
  const P = NOTION_PROP;
  const region = richTextValue(lead.region);
  const message = richTextValue(lead.message);
  const source = richTextValue(lead.source);
  const grade = multiSelectValue(lead.grades);
  const subject = multiSelectValue(lead.subjects);
  const phone = lead.phone.trim();

  const properties = pruneUndefined({
    // 이름(title)은 항상 포함 — 빈 값이면 대체 문구.
    [P.name]: {
      title: [
        {
          type: "text" as const,
          text: { content: (lead.name.trim() || "(이름 미입력)").slice(0, 2000) },
        },
      ],
    },
    [P.phone]: phone ? { phone_number: phone } : undefined,
    [P.region]: region ? { rich_text: region } : undefined,
    [P.grade]: grade ? { multi_select: grade } : undefined,
    [P.subject]: subject ? { multi_select: subject } : undefined,
    [P.message]: message ? { rich_text: message } : undefined,
    [P.source]: source ? { rich_text: source } : undefined,
    // 서비스 구분(select) — 지식의참견 / 어학의참견.
    [P.service]: { select: { name: lead.service } },
    // 상담 상태 — 서버에서 항상 "신규" 강제(select).
    [P.status]: { select: { name: CONSULT_STATUS_NEW } },
    // 신청일시(created_time)는 전송하지 않음.
  });

  return properties as CreatePageParameters["properties"];
}

/**
 * 노션 rate limit(초당 3회) 고려 — 일시적 오류만 1회 재시도.
 * (rate_limited / 429 / 502 / 503 만 재시도, 그 외는 즉시 throw)
 */
async function withOneRetry<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    const code = (e as { code?: string })?.code;
    const status = (e as { status?: number })?.status;
    const retryable = code === "rate_limited" || status === 429 || status === 502 || status === 503;
    if (!retryable) throw e;
    await new Promise((r) => setTimeout(r, 400));
    return await fn();
  }
}

/** 상담 리드를 노션 DB 한 행으로 삽입. 실패 시 예외를 그대로 던진다(라우트가 로깅·응답 처리). */
export async function insertConsultLead(databaseId: string, lead: ConsultLead) {
  const properties = buildConsultProperties(lead);

  // 실제 전송 properties 를 개발 환경에서만 로깅(프로덕션 로그에 PII 방지).
  if (process.env.NODE_ENV !== "production") {
    console.log("[consult] Notion properties:", JSON.stringify(properties));
  } else {
    console.log("[consult] Notion properties keys:", Object.keys(properties ?? {}));
  }

  return withOneRetry(() =>
    notionClient().pages.create({
      parent: { database_id: databaseId },
      properties,
    }),
  );
}
