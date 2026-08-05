/*
 * 표준폼(/apply) 리드용 Notion 속성 4개를 보장한다(멱등).
 *
 * 실행: npx tsx scripts/ensure-notion-inquiry-props.ts
 *
 * 추가 대상(기존 "학년"·"과목" multi_select 와 이름이 겹치지 않도록 "표준" 접두 사용):
 *   "학교"       — rich_text
 *   "표준학년"    — select      (옵션 = 신청폼 grade 표시명: 초1~N수)
 *   "표준과목"    — multi_select (옵션 = subjects 테이블 과목명 22개)
 *   "수업 형태"   — select      (방문 / 비대면 / 무관)
 *
 * 원칙:
 *   - 기존 속성(이름·타입·옵션)은 절대 건드리지 않는다 — 이 4개만 추가/옵션 보강.
 *   - 이미 있으나 타입이 기대와 다르면 중단하고 보고(자동 변경하지 않음).
 *   - 옵션은 부족분만 채운다. DB 재생성·삭제 금지.
 *   - 표준과목 옵션명은 Supabase subjects 테이블에서 읽어 데이터와 일치시킨다.
 */
import { Client } from "@notionhq/client";
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// .env.local 자가 로딩.
try {
  const raw = readFileSync(join(process.cwd(), ".env.local"), "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"]*)"?\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2];
  }
} catch {
  /* .env.local 없으면 실제 env 사용 */
}

// 신청폼 grade 표시명 — src/data/applyFormOptions.ts 의 GRADES 와 동일해야 한다.
// (옵션은 부족분만 추가 — 기존 "N수" 옵션은 과거 리드 보존을 위해 남겨 둔다.)
const GRADE_OPTIONS = [
  "초1", "초2", "초3", "초4", "초5", "초6",
  "예비중1", "중1", "중2", "중3", "예비고1", "고1", "고2", "고3", "성인",
];
const LESSON_OPTIONS = ["방문", "비대면", "무관"];

const apiKey = process.env.NOTION_API_KEY;
const databaseId = process.env.NOTION_DATABASE_ID;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!apiKey || !databaseId || !supabaseUrl || !serviceRoleKey) {
  console.error("환경변수 누락(NOTION_API_KEY/NOTION_DATABASE_ID/SUPABASE_*) — .env.local 확인.");
  process.exit(1);
}

const notion = new Client({ auth: apiKey });

type PropDef =
  | { type: "rich_text" }
  | { type: "select"; options: string[] }
  | { type: "multi_select"; options: string[] };

function bodyFor(def: PropDef) {
  if (def.type === "rich_text") return { rich_text: {} };
  const options = def.options.map((name) => ({ name }));
  return def.type === "select" ? { select: { options } } : { multi_select: { options } };
}

async function main() {
  // 표준과목 옵션 = subjects 22개(데이터 기준).
  const supabase = createClient(supabaseUrl as string, serviceRoleKey as string, {
    auth: { persistSession: false },
  });
  const { data: subjects, error } = await supabase
    .from("subjects")
    .select("subject_name")
    .order("subject_id");
  if (error) {
    console.error("subjects 조회 실패 —", error.message);
    process.exit(1);
  }
  const subjectNames = (subjects ?? []).map((s) => s.subject_name as string);

  const PROPS: Record<string, PropDef> = {
    "학교": { type: "rich_text" },
    "표준학년": { type: "select", options: GRADE_OPTIONS },
    "표준과목": { type: "multi_select", options: subjectNames },
    "수업 형태": { type: "select", options: LESSON_OPTIONS },
  };

  const db = (await notion.databases.retrieve({ database_id: databaseId as string })) as {
    properties: Record<
      string,
      { type: string; select?: { options?: { name: string }[] }; multi_select?: { options?: { name: string }[] } }
    >;
  };

  const toWrite: Record<string, unknown> = {};
  const report: string[] = [];

  for (const [name, def] of Object.entries(PROPS)) {
    const existing = db.properties[name];
    if (existing) {
      if (existing.type !== def.type) {
        console.error(
          `중단: "${name}" 이(가) 이미 있으나 타입이 ${existing.type}(기대: ${def.type}). 기존 속성을 바꾸지 않기 위해 종료합니다.`,
        );
        process.exit(1);
      }
      if (def.type === "rich_text") {
        report.push(`이미 존재: "${name}" (rich_text) — 변경 없음`);
        continue;
      }
      const have = new Set(
        (existing[def.type]?.options ?? []).map((o) => o.name),
      );
      const missing = def.options.filter((o) => !have.has(o));
      if (missing.length === 0) {
        report.push(`이미 존재: "${name}" — 옵션 충분, 변경 없음`);
        continue;
      }
      toWrite[name] = bodyFor(def);
      report.push(`옵션 보강: "${name}" ← ${missing.join(", ")}`);
    } else {
      toWrite[name] = bodyFor(def);
      report.push(`생성: "${name}" (${def.type}${def.type !== "rich_text" ? `, 옵션 ${def.options.length}개` : ""})`);
    }
  }

  if (Object.keys(toWrite).length > 0) {
    await notion.databases.update({
      database_id: databaseId as string,
      properties: toWrite as Parameters<Client["databases"]["update"]>[0]["properties"],
    });
  }

  console.log("=== 표준폼 Notion 속성 보장 결과 ===");
  for (const line of report) console.log("  " + line);

  // 최종 확인 — 4개 속성 존재/타입 재조회.
  const after = (await notion.databases.retrieve({ database_id: databaseId as string })) as {
    properties: Record<string, { type: string }>;
  };
  console.log("\n=== 확인(추가 후) ===");
  for (const name of Object.keys(PROPS)) {
    const p = after.properties[name];
    console.log(`  "${name}"  →  ${p ? p.type : "(없음!)"}`);
  }
}

main().catch((err: unknown) => {
  const e = err as { code?: string; status?: number; message?: string };
  console.error("[ensure-inquiry-props] 실패:", e?.code, e?.status, e?.message);
  process.exit(1);
});
