/*
 * subjects 테이블에 "코딩"(group 기타) 1행을 멱등 추가한다.
 *
 * 실행: node scripts/add-coding-subject.mjs
 * 배경: 신청폼(표준폼) 대표 과목 드롭다운에 "코딩"을 넣기 위해, 폼 제출 검증의
 *       기준인 subjects 테이블에 실재 행이 있어야 한다(subject_id 매핑 대상).
 *
 * 원칙:
 *   - 이미 있으면 아무것도 하지 않는다(subject_name UNIQUE 기준 멱등).
 *   - 스키마(컬럼)는 건드리지 않는다 — 데이터 1행만 추가.
 *   - 추가 후 Notion "표준과목" 옵션은 scripts/ensure-notion-inquiry-props.ts 재실행으로 보강한다.
 *   - 키 값은 절대 출력하지 않는다.
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

try {
  const raw = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (m && process.env[m[1]] === undefined) {
      process.env[m[1]] = m[2].trim().replace(/^"(.*)"$/, "$1");
    }
  }
} catch {
  /* .env.local 없으면 실제 env 사용 */
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("환경변수 누락(NEXT_PUBLIC_SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY) — .env.local 확인.");
  process.exit(1);
}

const NAME = "코딩";
const GROUP = "기타";

const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

const existing = await sb.from("subjects").select("subject_id").eq("subject_name", NAME).maybeSingle();
if (existing.error) {
  console.error("조회 실패 —", existing.error.message);
  process.exit(1);
}
if (existing.data) {
  console.log(`이미 존재: "${NAME}" (subject_id=${existing.data.subject_id}) — 변경 없음`);
  process.exit(0);
}

const inserted = await sb
  .from("subjects")
  .insert({ subject_name: NAME, subject_group: GROUP, is_remote_fit: false })
  .select("subject_id")
  .single();
if (inserted.error) {
  console.error("추가 실패 —", inserted.error.message);
  process.exit(1);
}
console.log(`추가 완료: "${NAME}" (group=${GROUP}, subject_id=${inserted.data.subject_id})`);
