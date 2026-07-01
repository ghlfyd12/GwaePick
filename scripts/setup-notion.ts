/*
 * 1회성 셋업 스크립트 — 노션에 상담 리드 수집용 데이터베이스를 자동 생성한다.
 *
 * 실행:  node --env-file=.env.local scripts/setup-notion.ts
 *   (Node 24는 .ts 를 그대로 실행하고 --env-file 로 .env.local 을 로드한다.)
 *
 * 성공 시: 생성된 database id 를 콘솔에 출력하고 .env.local 의 NOTION_DATABASE_ID 에 기록한다.
 *
 * 스키마 메모: 학년·과목은 신청폼이 "복수 선택(배열)"으로 보내므로 multi_select 로 만든다
 *   (단일 select 면 여러 값이 "국어, 영어" 같은 한 덩어리 옵션으로 뭉개진다).
 *   상담 상태는 리드당 하나이므로 select 로 둔다.
 */
const { Client } = require("@notionhq/client");
const fs = require("node:fs");
const path = require("node:path");

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_PARENT_PAGE_ID = process.env.NOTION_PARENT_PAGE_ID;

if (!NOTION_API_KEY || !NOTION_PARENT_PAGE_ID) {
  console.error(
    "NOTION_API_KEY / NOTION_PARENT_PAGE_ID 가 없습니다.\n" +
      "→ node --env-file=.env.local scripts/setup-notion.ts 로 실행하세요.",
  );
  process.exit(1);
}

const notion = new Client({ auth: NOTION_API_KEY });
const DB_TITLE = "지식의 참견 - 실시간 과외 상담 접수 현황";

/** .env.local 에 key 를 기록(있으면 값 교체, 없으면 끝에 추가). */
function writeEnv(key: string, value: string) {
  const envPath = path.join(process.cwd(), ".env.local");
  let content = fs.existsSync(envPath)
    ? fs.readFileSync(envPath, "utf8")
    : "";
  const line = `${key}="${value}"`;
  const re = new RegExp(`^${key}=.*$`, "m");
  content = re.test(content)
    ? content.replace(re, line)
    : content.replace(/\s*$/, "\n") + line + "\n";
  fs.writeFileSync(envPath, content);
}

async function main() {
  const db = await notion.databases.create({
    parent: { type: "page_id", page_id: NOTION_PARENT_PAGE_ID },
    title: [{ type: "text", text: { content: DB_TITLE } }],
    properties: {
      이름: { title: {} },
      연락처: { phone_number: {} },
      지역: { rich_text: {} },
      학년: {
        multi_select: {
          options: [
            { name: "초등" },
            { name: "중등" },
            { name: "고등" },
            { name: "성인" },
          ],
        },
      },
      과목: {
        multi_select: {
          options: [
            { name: "국어" },
            { name: "영어" },
            { name: "수학" },
            { name: "사회" },
            { name: "과학" },
            { name: "영어회화" },
            { name: "역사" },
            { name: "논술" },
            { name: "코딩" },
          ],
        },
      },
      문의내용: { rich_text: {} },
      유입페이지: { rich_text: {} },
      "상담 상태": {
        select: {
          options: [
            { name: "신규", color: "red" },
            { name: "연락완료", color: "yellow" },
            { name: "매칭중", color: "orange" },
            { name: "수업시작", color: "green" },
            { name: "보류", color: "gray" },
          ],
        },
      },
      신청일시: { created_time: {} },
    },
  });

  console.log("[setup-notion] 데이터베이스 생성 완료");
  console.log("[setup-notion] database id:", db.id);
  writeEnv("NOTION_DATABASE_ID", db.id);
  console.log("[setup-notion] .env.local 에 NOTION_DATABASE_ID 저장 완료");
}

main().catch((err: unknown) => {
  const e = err as { body?: unknown; message?: string };
  console.error("[setup-notion] 실패:", e?.body ?? e?.message ?? err);
  process.exit(1);
});
