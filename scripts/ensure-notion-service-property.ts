/*
 * Notion DB 에 "서비스" Select 속성(옵션: 지식의참견 / 어학의참견)을 보장한다(멱등).
 *
 * 실행: npx tsx scripts/ensure-notion-service-property.ts
 *   (또는 node --env-file=.env.local scripts/ensure-notion-service-property.ts)
 *
 * - 이미 있으면 아무것도 하지 않는다(옵션은 부족하면 채워 넣는다).
 * - 상담 폼(어학의참견/지식의참견)이 lead.service 를 이 속성에 기록하므로, 없으면 삽입이 실패한다.
 * - 기존 컬럼·데이터는 건드리지 않는다(순수 추가). DB 재생성 금지.
 */
import { Client } from "@notionhq/client";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// .env.local 자가 로딩(npx tsx 는 .env 를 자동 로드하지 않으므로).
try {
  const raw = readFileSync(join(process.cwd(), ".env.local"), "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"]*)"?\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2];
  }
} catch {
  /* .env.local 없으면 실제 env 사용 */
}

const PROP = "서비스";
const OPTIONS = ["지식의참견", "어학의참견"];

const apiKey = process.env.NOTION_API_KEY;
const databaseId = process.env.NOTION_DATABASE_ID;
if (!apiKey || !databaseId) {
  console.error("NOTION_API_KEY / NOTION_DATABASE_ID 누락 — .env.local 확인.");
  process.exit(1);
}

const notion = new Client({ auth: apiKey });

async function main() {
  const db = (await notion.databases.retrieve({ database_id: databaseId as string })) as {
    properties: Record<string, { type: string; select?: { options?: { name: string }[] } }>;
  };
  const existing = db.properties[PROP];

  if (existing) {
    if (existing.type !== "select") {
      console.error(`"${PROP}" 속성이 이미 있으나 타입이 select 가 아닙니다(${existing.type}). 노션 UI 에서 확인 필요.`);
      process.exit(1);
    }
    const have = new Set((existing.select?.options ?? []).map((o) => o.name));
    const missing = OPTIONS.filter((o) => !have.has(o));
    if (missing.length === 0) {
      console.log(`이미 존재: "${PROP}" (옵션 ${[...have].join(", ")}) — 변경 없음.`);
      return;
    }
    await notion.databases.update({
      database_id: databaseId as string,
      properties: {
        [PROP]: { select: { options: OPTIONS.map((name) => ({ name })) } },
      },
    });
    console.log(`옵션 보강: "${PROP}" ← ${missing.join(", ")}`);
    return;
  }

  await notion.databases.update({
    database_id: databaseId as string,
    properties: {
      [PROP]: { select: { options: OPTIONS.map((name) => ({ name })) } },
    },
  });
  console.log(`생성 완료: "${PROP}" (옵션: ${OPTIONS.join(", ")})`);
}

main().catch((err: unknown) => {
  const e = err as { code?: string; status?: number; message?: string };
  console.error("[ensure-service-property] 실패:", e?.code, e?.status, e?.message);
  process.exit(1);
});
