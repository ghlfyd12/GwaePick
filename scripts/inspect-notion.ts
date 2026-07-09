/*
 * 노션 DB 실제 스키마 점검(읽기 전용) — 코드 매핑과 대조용.
 *
 * 실행: npx tsx scripts/inspect-notion.ts
 *   (또는 node --env-file=.env.local scripts/inspect-notion.ts)
 *
 * 출력: DB 제목 / 실제 속성명(있는 그대로) / 각 속성 타입 /
 *       select·multi_select 옵션 목록 / data_sources 배열 유무.
 * DB 를 새로 만들거나 수정하지 않는다. 키 전문은 출력하지 않는다.
 */
import { Client } from "@notionhq/client";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// .env.local 자가 로딩(npx tsx 는 .env 를 자동 로드하지 않으므로).
function loadEnvLocal() {
  try {
    const raw = readFileSync(join(process.cwd(), ".env.local"), "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"]*)"?\s*$/);
      if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2];
    }
  } catch {
    /* .env.local 없으면 무시 — 실제 env 사용 */
  }
}
loadEnvLocal();

const apiKey = process.env.NOTION_API_KEY;
const databaseId = process.env.NOTION_DATABASE_ID;

const mask = (v?: string) => (v ? `${v.slice(0, 4)}…(len ${v.length})` : "(없음)");
console.log("NOTION_API_KEY:", mask(apiKey));
console.log("NOTION_DATABASE_ID:", databaseId ?? "(없음)");

if (!apiKey || !databaseId) {
  console.error("환경변수 누락 — NOTION_API_KEY / NOTION_DATABASE_ID 확인 필요.");
  process.exit(1);
}

const notion = new Client({ auth: apiKey });

async function main() {
  const db: Record<string, unknown> = await notion.databases.retrieve({
    database_id: databaseId as string,
  });

  const title = Array.isArray(db.title)
    ? (db.title as { plain_text: string }[]).map((t) => t.plain_text).join("")
    : "(제목 없음)";
  console.log("\n=== DB ===");
  console.log("title:", title);
  console.log("id:", db.id);

  // data_sources 배열(신 API 2025-09-03) 유무 — pages.create parent 판단용.
  const dataSources = (db as { data_sources?: { id: string; name?: string }[] }).data_sources;
  console.log(
    "\n=== data_sources ===",
    dataSources
      ? JSON.stringify(dataSources)
      : "(응답에 data_sources 없음 — parent: { database_id } 사용)",
  );

  console.log("\n=== properties (실제 속성명 · 타입 · 옵션) ===");
  const props = db.properties as Record<string, { type: string; [k: string]: unknown }>;
  for (const [name, def] of Object.entries(props)) {
    let extra = "";
    if (def.type === "select" || def.type === "multi_select") {
      const options =
        (def[def.type] as { options?: { name: string }[] })?.options ?? [];
      extra = ` options=[${options.map((o) => o.name).join(", ")}]`;
    }
    // 속성명을 따옴표로 감싸 공백 유무를 눈으로 확인 가능하게.
    console.log(`  "${name}"  →  ${def.type}${extra}`);
  }
}

main().catch((err: unknown) => {
  const e = err as { code?: string; status?: number; message?: string; body?: unknown };
  console.error("\n[inspect-notion] 실패");
  console.error("  code:", e?.code, "status:", e?.status);
  console.error("  message:", e?.message);
  if (e?.body) console.error("  body:", JSON.stringify(e.body));
  process.exit(1);
});
