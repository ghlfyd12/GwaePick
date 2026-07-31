/**
 * 어학시험(지역×시험) 네이버 수집요청 배치 생성 — exam-001.txt ~ (50 URL/일).
 *
 * 실행: npx tsx scripts/generate-exam-naver-batches.ts
 * 로컬 1회 실행 후 결과 파일만 커밋한다(빌드 파이프라인에 넣지 않음 — 빌드 무게 증가 금지).
 *
 * 대상: 253 시군구 × 13 시험 = 3,289 URL. 추가·삭제 없이 전량 포함, front-load 순서만 조정.
 * front-load(고전환 우선):
 *   1) 서울 강남·서초·송파·양천·마포·강동구
 *   2) 서울 나머지 구 + 경기 주요시(성남 분당·고양·수원·용인·부천·안양)
 *   3) 광역시(부산·대구·인천·광주·대전·울산) 각 구
 *   4) 나머지 시군구
 *   같은 지역 안 시험 순서: toeic→opic→toeic-speaking→jlpt→hsk→toefl→ielts→teps→gtelp→jpt→sjpt→hskk→tsc
 *
 * 결정론적(실행마다 동일). 시간·난수 의존 없음. 감시 루프 없음(생성→INDEX 갱신→즉시 종료).
 * 기존 day/day2 시리즈·archived 는 건드리지 않는다. INDEX.md 는 EXAM 센티넬 이후만 재작성.
 */
import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { examRegions } from "../src/data/byRegionExam";

const OUT_DIR = join(process.cwd(), "naver-submission");
const INDEX = join(OUT_DIR, "INDEX.md");
const DOMAIN = "https://xn--l89av43blfdm0cm7d.com";
const BATCH_SIZE = 50;
const PREFIX = "exam";
const EXAM_SENTINEL = "<!-- EXAM-SECTIONS (자동 생성 — 이 줄 아래는 스크립트가 재작성) -->";

/** 검색 수요 큰 시험 우선 순서(13종). */
const EXAM_ORDER = [
  "toeic", "opic", "toeic-speaking", "jlpt", "hsk", "toefl",
  "ielts", "teps", "gtelp", "jpt", "sjpt", "hskk", "tsc",
] as const;

/* ── 지역 front-load 순위 ── */
const SEOUL = "서울특별시";
const TIER1_GU = ["강남구", "서초구", "송파구", "양천구", "마포구", "강동구"];
const METRO = [
  "부산광역시", "대구광역시", "인천광역시", "광주광역시", "대전광역시", "울산광역시",
];
/** 경기 주요시 — "성남시 분당구"는 정확 일치, 나머지는 시 접두 일치. 나열 순서가 우선순위. */
const GG_MAJOR = ["성남시 분당구", "고양시", "수원시", "용인시", "부천시", "안양시"];

function ggMajorRank(sidoLabel: string, sigunguName: string): number {
  if (sidoLabel !== "경기도") return -1;
  for (let i = 0; i < GG_MAJOR.length; i++) {
    const k = GG_MAJOR[i];
    const hit = k === "성남시 분당구" ? sigunguName === k : sigunguName.startsWith(k);
    if (hit) return i;
  }
  return -1;
}

/** [tier, sub] — tier 오름차순, 같은 tier 안 sub 오름차순, 그다음 원본(가나다) 순서. */
function rankOf(sidoLabel: string, sigunguName: string): [number, number] {
  if (sidoLabel === SEOUL) {
    const i = TIER1_GU.indexOf(sigunguName);
    if (i >= 0) return [1, i]; // 1순위: 지정 gu 순서
    return [2, 0]; // 2순위 서울 나머지 — 원본 순서 유지
  }
  const g = ggMajorRank(sidoLabel, sigunguName);
  if (g >= 0) return [2, 100 + g]; // 2순위 경기 주요시 — 서울 나머지(sub 0) 뒤, 나열 순서
  if (METRO.includes(sidoLabel)) return [3, 0]; // 3순위 광역시
  return [4, 0]; // 4순위 나머지
}

/* ── 정렬(안정): (tier, sub, 원본 index) ── */
const ordered = examRegions
  .map((r, idx) => ({ r, idx, rank: rankOf(r.sidoLabel, r.sigunguName) }))
  .sort((a, b) => a.rank[0] - b.rank[0] || a.rank[1] - b.rank[1] || a.idx - b.idx)
  .map((x) => x.r);

/* ── URL 평탄화(지역 순서 × 시험 순서) ── */
const urls: string[] = [];
for (const region of ordered) {
  const enc = encodeURIComponent(region.slug);
  for (const exam of EXAM_ORDER) urls.push(`${DOMAIN}/power/by-region/${enc}/${exam}`);
}

/* ── 검증 ── */
const problems: string[] = [];
const expected = examRegions.length * EXAM_ORDER.length;
if (urls.length !== expected)
  problems.push(`URL 총수 불일치: ${urls.length} != ${expected}`);
if (new Set(urls).size !== urls.length)
  problems.push(`중복 URL: ${urls.length - new Set(urls).size}건`);
if (problems.length) {
  for (const p of problems) console.error("[검증 실패] " + p);
  process.exit(1);
}

/* ── 배치 파일 출력 ── */
const pad = (n: number) => String(n).padStart(3, "0");
const totalFiles = Math.ceil(urls.length / BATCH_SIZE);
const summaries: { name: string; summary: string; count: number }[] = [];
// 지역명(요약용) — slug → 표시명.
const nameBySlug = new Map(examRegions.map((r) => [r.slug, r.name]));
function summarize(slice: string[]): string {
  const gus = new Set<string>();
  for (const u of slice) {
    const m = u.match(/\/power\/by-region\/([^/]+)\//);
    if (m) {
      const slug = decodeURIComponent(m[1]);
      gus.add(nameBySlug.get(slug) ?? slug);
    }
  }
  return [...gus].slice(0, 3).join("·");
}

for (let i = 0; i < totalFiles; i++) {
  const slice = urls.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE);
  const name = `${PREFIX}-${pad(i + 1)}.txt`;
  writeFileSync(join(OUT_DIR, name), slice.join("\n") + "\n", "utf8");
  summaries.push({ name, summary: summarize(slice), count: slice.length });
}

/* ── INDEX.md — EXAM 센티넬 이후만 재작성(day/day2 섹션 보존) ── */
const prev = existsSync(INDEX) ? readFileSync(INDEX, "utf8") : "";
const head = prev.includes(EXAM_SENTINEL)
  ? prev.slice(0, prev.indexOf(EXAM_SENTINEL)).replace(/\s+$/, "") + "\n"
  : prev.replace(/\s+$/, "") + "\n";

const checklist = summaries
  .map((f) => `- [ ] ${f.name} — ${f.summary} (${f.count}개)`)
  .join("\n");

const examSection = `${EXAM_SENTINEL}

## 어학시험 배치 개요 (exam 시리즈)

- **총 URL 수**: ${urls.length.toLocaleString()}개 (253 시군구 × 13 시험)
- **배치 파일 수**: ${totalFiles}개 (배치당 ${BATCH_SIZE}개, 마지막 ${summaries[summaries.length - 1].count}개, 접두사 \`${PREFIX}-\`)
- **도메인**: ${DOMAIN}
- **front-load**: 1) 강남·서초·송파·양천·마포·강동 → 2) 서울 나머지+경기 주요시 → 3) 광역시 → 4) 나머지. 지역 내 시험 순서 toeic→opic→toeic-speaking→jlpt→hsk→toefl→ielts→teps→gtelp→jpt→sjpt→hskk→tsc.
- **생성 스크립트**: \`npx tsx scripts/generate-exam-naver-batches.ts\` (로컬 1회 실행 후 결과 파일만 커밋)

## 제출 체크리스트 (exam 시리즈)

제출을 마치면 \`[ ]\` → \`[x]\` 로 바꾸고 항목 끝에 제출일을 \`(YYYY-MM-DD)\` 형식으로 적습니다.
${checklist}
`;

writeFileSync(INDEX, head + "\n" + examSection, "utf8");

/* ── 콘솔 요약 후 즉시 종료 ── */
console.log("[어학시험 네이버 배치 생성 완료]");
console.log(`  총 URL: ${urls.length} / 검증 통과(총수 일치·중복 0)`);
console.log(`  파일: ${PREFIX}-001.txt ~ ${PREFIX}-${pad(totalFiles)}.txt (${totalFiles}개, 마지막 ${summaries[summaries.length - 1].count}개)`);
console.log(`  INDEX.md exam 섹션 갱신(day/day2 보존).`);
