// scripts/indexnow-submit.mjs
//
// ── 남용 방지 (반드시 준수) ──────────────────────────────────────────────
// IndexNow 는 "실제로 변경/추가/삭제된 URL"만 통지한다. 내용 변경이 없는데
// 같은 URL 목록을 반복 전송하는 것은 검색엔진 남용이며 rate limit·신뢰도
// 하락을 부른다. 이 스크립트는 배포로 페이지가 실제 변경된 직후 1회만 실행한다.
// 상주/폴링/데몬/크론 금지 — 포그라운드에서 한 번 실행하고 종료한다.
// ────────────────────────────────────────────────────────────────────────
//
// 네이버 IndexNow 배치 전송 (POST). 요청당 최대 10,000 URL(표준) 이지만
// 보수적으로 500/chunk + chunk 간 5초 대기로 rate limit 을 피한다.
//
// 사용법:
//   node scripts/indexnow-submit.mjs <urlListFile> [--start-chunk N] [--dry-run]
//     <urlListFile>   : 한 줄 1 URL 텍스트 파일(예: scripts/indexnow/school-subject-urls.txt)
//     --start-chunk N : N 번 chunk 부터 재개(1-based). 중단 후 이어서 전송할 때.
//     --dry-run       : 전송하지 않고 chunk 계획만 출력(사전 점검용).
//
// 중단 정책:
//   429(rate limit) / 403(키 검증 실패) / 422(host·key 불일치) → 즉시 중단.
//   그 외 비-2xx 도 중단(안전). 마지막 성공 chunk 번호를 콘솔+파일에 기록해
//   `--start-chunk (N+1)` 로 재개할 수 있게 한다. 당일 재전송 금지.

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

// ── 설정(공개 값) ─────────────────────────────────────────────────────────
const HOST = "xn--l89av43blfdm0cm7d.com"; // 호스트명(스킴 없이, 퓨니코드)
const KEY = "75b4059cc381321cf85b1e2e1a8532a9"; // 공개 검증 키(시크릿 아님)
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const ENDPOINT = "https://api.searchadvisor.naver.com/indexnow";
const CHUNK_SIZE = 500;
const DELAY_MS = 5000; // chunk 간 대기(5초)
const STOP_CODES = new Set([429, 403, 422]); // 즉시 중단 코드(그 외 비-2xx 도 중단)

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PROGRESS_FILE = join(ROOT, "scripts/indexnow/last-success-chunk.txt");

// ── 인자 파싱 ─────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const listPath = args.find((a) => !a.startsWith("--"));
const dryRun = args.includes("--dry-run");
const startIdx = args.indexOf("--start-chunk");
const startChunk = startIdx >= 0 ? parseInt(args[startIdx + 1], 10) : 1;

if (!listPath) {
  console.error("사용법: node scripts/indexnow-submit.mjs <urlListFile> [--start-chunk N] [--dry-run]");
  process.exit(1);
}
if (!Number.isInteger(startChunk) || startChunk < 1) {
  console.error(`--start-chunk 값이 올바르지 않음: ${args[startIdx + 1]}`);
  process.exit(1);
}

// ── URL 목록 로드 + chunk 분할 ─────────────────────────────────────────────
const urls = readFileSync(join(ROOT, listPath.replace(/^\.\//, "")), "utf8")
  .split(/\r?\n/)
  .map((l) => l.trim())
  .filter(Boolean);

const chunks = [];
for (let i = 0; i < urls.length; i += CHUNK_SIZE) chunks.push(urls.slice(i, i + CHUNK_SIZE));

console.log(`URL 총수: ${urls.length}`);
console.log(`chunk 크기: ${CHUNK_SIZE} → 총 chunk: ${chunks.length}`);
console.log(`엔드포인트: ${ENDPOINT}`);
console.log(`host=${HOST}  keyLocation=${KEY_LOCATION}`);
console.log(`시작 chunk: ${startChunk}${dryRun ? "  (DRY-RUN — 전송 안 함)" : ""}`);
console.log("");

if (dryRun) {
  console.log("dry-run 종료. 실제 전송하려면 --dry-run 제거.");
  process.exit(0);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── 전송 루프(포그라운드, 1회) ─────────────────────────────────────────────
let lastSuccess = startChunk - 1;
for (let c = startChunk; c <= chunks.length; c++) {
  const urlList = chunks[c - 1];
  const body = JSON.stringify({ host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList });

  let status = 0;
  let text = "";
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body,
    });
    status = res.status;
    text = await res.text();
  } catch (err) {
    console.error(`[chunk ${c}/${chunks.length}] 네트워크 오류: ${err?.message ?? err}`);
    console.error(`마지막 성공 chunk: ${lastSuccess}. 재개: --start-chunk ${lastSuccess + 1}`);
    writeFileSync(PROGRESS_FILE, String(lastSuccess) + "\n", "utf8");
    process.exit(1);
  }

  const ok = status >= 200 && status < 300;
  const bodyOut = text ? ` body=${JSON.stringify(text.slice(0, 300))}` : "";
  console.log(`[chunk ${c}/${chunks.length}] URL ${urlList.length}개 → HTTP ${status}${ok ? "" : bodyOut}`);

  if (!ok) {
    const reason = STOP_CODES.has(status) ? `중단 코드 ${status}` : `비-2xx ${status}`;
    console.error(`\n>>> ${reason} — 즉시 중단. 당일 재전송 금지.`);
    console.error(`응답 본문 원문:\n${text}`);
    console.error(`\n마지막 성공 chunk: ${lastSuccess}. 재개: node scripts/indexnow-submit.mjs ${listPath} --start-chunk ${lastSuccess + 1}`);
    writeFileSync(PROGRESS_FILE, String(lastSuccess) + "\n", "utf8");
    process.exit(1);
  }

  lastSuccess = c;
  writeFileSync(PROGRESS_FILE, String(lastSuccess) + "\n", "utf8");

  if (c < chunks.length) await sleep(DELAY_MS);
}

console.log(`\n완료 — 전 chunk 성공(1..${chunks.length}). 전송 URL 총수: ${urls.length}`);
console.log(`진행 기록: ${PROGRESS_FILE}`);
