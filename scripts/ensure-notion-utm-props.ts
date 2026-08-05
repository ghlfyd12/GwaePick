/*
 * 표준폼 리드용 UTM Notion 속성 6개를 보장한다(멱등).
 *
 * 실행: npx tsx scripts/ensure-notion-utm-props.ts
 *
 * 추가 대상(모두 rich_text): utm_source / utm_medium / utm_campaign / utm_term / utm_content / referrer
 *
 * 원칙:
 *   - 기존 속성은 절대 건드리지 않는다 — 이 6개만 없으면 추가.
 *   - 이미 있으나 타입이 rich_text 가 아니면 중단하고 보고(자동 변경하지 않음).
 *   - DB 재생성·삭제 금지.
 */
import { Client } from "@notionhq/client";
import { readFileSync } from "node:fs";
import { join } from "node:path";

try {
  const raw = readFileSync(join(process.cwd(), ".env.local"), "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"]*)"?\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2];
  }
} catch {
  /* .env.local 없으면 실제 env 사용 */
}

const PROPS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "referrer",
];

const apiKey = process.env.NOTION_API_KEY;
const databaseId = process.env.NOTION_DATABASE_ID;
if (!apiKey || !databaseId) {
  console.error("NOTION_API_KEY / NOTION_DATABASE_ID 누락 — .env.local 확인.");
  process.exit(1);
}

const notion = new Client({ auth: apiKey });

async function main() {
  const db = (await notion.databases.retrieve({ database_id: databaseId as string })) as {
    properties: Record<string, { type: string }>;
  };

  const toWrite: Record<string, { rich_text: Record<string, never> }> = {};
  const report: string[] = [];

  for (const name of PROPS) {
    const existing = db.properties[name];
    if (existing) {
      if (existing.type !== "rich_text") {
        console.error(
          `중단: "${name}" 이(가) 이미 있으나 타입이 ${existing.type}(기대: rich_text). 기존 속성을 바꾸지 않기 위해 종료합니다.`,
        );
        process.exit(1);
      }
      report.push(`이미 존재: "${name}" (rich_text) — 변경 없음`);
    } else {
      toWrite[name] = { rich_text: {} };
      report.push(`생성: "${name}" (rich_text)`);
    }
  }

  if (Object.keys(toWrite).length > 0) {
    await notion.databases.update({
      database_id: databaseId as string,
      properties: toWrite as Parameters<Client["databases"]["update"]>[0]["properties"],
    });
  }

  console.log("=== UTM Notion 속성 보장 결과 ===");
  for (const line of report) console.log("  " + line);

  const after = (await notion.databases.retrieve({ database_id: databaseId as string })) as {
    properties: Record<string, { type: string }>;
  };
  console.log("\n=== 확인(추가 후) ===");
  for (const name of PROPS) {
    const p = after.properties[name];
    console.log(`  "${name}"  →  ${p ? p.type : "(없음!)"}`);
  }
}

main().catch((err: unknown) => {
  const e = err as { code?: string; status?: number; message?: string };
  console.error("[ensure-utm-props] 실패:", e?.code, e?.status, e?.message);
  process.exit(1);
});
