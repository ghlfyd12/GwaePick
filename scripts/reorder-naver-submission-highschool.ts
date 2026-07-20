/**
 * 네이버 수집요청 배치 재정렬 — 고등학교×과목 우선순위로 재편성(day2-*.txt).
 *
 * 실행: npx tsx scripts/reorder-naver-submission-highschool.ts
 *
 * 배경: 7월 말 기말 후 2학기 대비 수요기에 맞춰, 전환 의도가 강한 고등학교×과목
 *       페이지를 배치 앞으로 당긴다. URL 은 추가·삭제 없이 순서만 바꾼다(재정렬 전용).
 *
 * 원칙:
 *  - 풀(pool)의 원천은 기존 배치 파일(day-*.txt) 그 자체다 — 새 URL 을 만들지 않으므로
 *    총량·집합이 보존된다. schools.ts 는 "어떤 slug 가 고등학교인가" 분류에만 쓴다.
 *  - day-001.txt 는 7/15 사이트 정상 상태에서 정상 제출 완료 → 풀에서 제외(보존).
 *  - day-002.txt 는 7/20 사이트 정지 중 제출되어 수집 실패 → URL 을 풀에 되돌림(다른 미제출과 동일 취급).
 *  - 결정론적(실행마다 동일). 시간·난수 의존 없음. 감시 루프 없음(실행→생성→즉시 종료).
 *
 * 우선순위:
 *  0) 허브 페이지(풀에 남아 있다면 최상단) — 실제로는 day-001 에 있어 풀에 없음(방어적 처리).
 *  1) 서울 강남·양천·송파 고등학교 × 과목
 *  2) 그 외 서울 고등학교 × 과목
 *  3) 전국 나머지 고등학교 × 과목
 *  4) 그 밖은 기존 배치 등장 순서 유지(= 기존 Tier 순서)
 *  같은 순위 내 정렬은 기존 배치 등장 순서를 그대로 따른다.
 */
import {
  writeFileSync,
  readFileSync,
  readdirSync,
  renameSync,
  mkdirSync,
  rmSync,
  existsSync,
} from "node:fs";
import { join } from "node:path";
import { SCHOOLS } from "../src/data/schools";
import { getSido } from "../src/data/sidoRegions";

/* ───────── 설정값 ───────── */
const OUT_DIR = join(process.cwd(), "naver-submission");
const ARCHIVE_DIR = join(OUT_DIR, "archived");
const BATCH_SIZE = 50;
const NEW_PREFIX = "day2"; // 새 배치 접두사(기존 day-*.txt 와 혼동 방지)
const SEOUL_SLUG = "seoul";
const PRIORITY_GU = ["gangnamgu", "yangcheongu", "songpagu"] as const;

/** 정상 제출 완료 → 풀에서 제외(파일은 삭제하지 않고 그대로 둠). */
const SUBMITTED = new Set(["day-001.txt"]);
/** 오늘(7/20) 정지 중 제출된 실패분 → 풀에 되돌림(메모만 남김). */
const FAILED_TODAY = "day-002.txt";

/* ───────── 학교 분류 맵(schools.ts 기준) ───────── */
// 고등학교 slug → 시도 slug (전국). 학교 slug 는 전역 dedup 되어 유일.
const highSlugToSido = new Map<string, string>();
// 학교 slug → 학교급, 학교 slug → 시군구 표시명(요약용).
const slugToLevel = new Map<string, string>();
const slugToGuName = new Map<string, string>();
for (const sido of SCHOOLS)
  for (const sg of sido.sigungu)
    for (const sc of sg.schools) {
      slugToLevel.set(sc.slug, sc.level);
      slugToGuName.set(sc.slug, sg.name);
      if (sc.level === "high") highSlugToSido.set(sc.slug, sido.slug);
    }

// 강남·양천·송파 고등학교 slug 집합.
const prioHighSlugs = new Set<string>();
{
  const seoulSchools = SCHOOLS.find((s) => s.slug === SEOUL_SLUG);
  for (const guSlug of PRIORITY_GU) {
    const sg = seoulSchools?.sigungu.find((s) => s.slug === guSlug);
    if (!sg) continue;
    for (const sc of sg.schools) if (sc.level === "high") prioHighSlugs.add(sc.slug);
  }
}

// 서울 시군구 slug → 표시명(지역 URL 요약용).
const seoulGuSlugToName = new Map<string, string>();
{
  const seoul = getSido(SEOUL_SLUG);
  for (const sg of seoul?.sigungu ?? []) seoulGuSlugToName.set(sg.slug, sg.name);
}

/* ───────── URL 파서 ───────── */
const schoolDetailRe = /\/tutoring\/by-school\/([^/]+)\/([^/]+)$/;
const regionDetailRe = /\/tutoring\/by-region\/([^/]+)\/([^/]+)\/([^/]+)\/([^/]+)$/;

function schoolSlugOf(url: string): string | null {
  const m = url.match(schoolDetailRe);
  return m ? decodeURIComponent(m[1]) : null;
}

/** 0=허브, 1~3=고등학교 우선순위, 4=그 외. */
function rankOf(url: string): 0 | 1 | 2 | 3 | 4 {
  const slug = schoolSlugOf(url);
  if (slug && highSlugToSido.has(slug)) {
    if (prioHighSlugs.has(slug)) return 1;
    if (highSlugToSido.get(slug) === SEOUL_SLUG) return 2;
    return 3;
  }
  // 상세 페이지(학교×과목·동×과목)가 아니면 허브류로 간주.
  if (!schoolDetailRe.test(url) && !regionDetailRe.test(url)) return 0;
  return 4;
}

/* ───────── 풀 구성: 기존 배치 파일에서 URL 을 등장 순서대로 읽음 ───────── */
// 루트와 archived/ 모두에서 day-*.txt 를 모아 재실행에도 안전하게(루트 우선).
function gatherDayFiles(): { name: string; path: string }[] {
  const map = new Map<string, string>();
  for (const dir of [ARCHIVE_DIR, OUT_DIR]) {
    if (!existsSync(dir)) continue;
    for (const f of readdirSync(dir))
      if (/^day-\d+\.txt$/.test(f)) map.set(f, join(dir, f));
  }
  return [...map.entries()]
    .filter(([name]) => !SUBMITTED.has(name))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, path]) => ({ name, path }));
}

const dayFiles = gatherDayFiles();
const pool: string[] = [];
const poolSeen = new Set<string>();
for (const { path } of dayFiles) {
  const lines = readFileSync(path, "utf8")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  for (const url of lines)
    if (!poolSeen.has(url)) {
      poolSeen.add(url);
      pool.push(url);
    }
}

// 제외된 제출 완료분 규모(보고용).
let submittedUrlCount = 0;
for (const dir of [OUT_DIR, ARCHIVE_DIR]) {
  if (!existsSync(dir)) continue;
  for (const f of readdirSync(dir))
    if (SUBMITTED.has(f)) {
      submittedUrlCount += readFileSync(join(dir, f), "utf8")
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean).length;
    }
}

/* ───────── 재정렬(안정 정렬: 같은 순위는 기존 순서 유지) ───────── */
const buckets: Record<0 | 1 | 2 | 3 | 4, string[]> = { 0: [], 1: [], 2: [], 3: [], 4: [] };
for (const url of pool) buckets[rankOf(url)].push(url);
const ordered = [
  ...buckets[0],
  ...buckets[1],
  ...buckets[2],
  ...buckets[3],
  ...buckets[4],
];

/* ───────── 검증 ───────── */
const problems: string[] = [];
if (ordered.length !== pool.length)
  problems.push(`재정렬 전후 URL 총수 불일치: pool=${pool.length}, ordered=${ordered.length}`);
const orderedSet = new Set(ordered);
if (orderedSet.size !== ordered.length)
  problems.push(`중복 URL 발견: ${ordered.length - orderedSet.size}건`);
// 집합 동등성(양방향).
for (const u of pool) if (!orderedSet.has(u)) problems.push(`풀 URL 누락: ${u}`);
for (const u of ordered) if (!poolSeen.has(u)) problems.push(`풀에 없던 URL 추가: ${u}`);
if (problems.length > 0) {
  console.error("[검증 실패]");
  for (const p of problems.slice(0, 10)) console.error("  - " + p);
  process.exit(1);
}

/* ───────── 파일 요약(INDEX 한 줄 병기용) ───────── */
function summarize(slice: string[]): string {
  const types = new Set<string>();
  const gus = new Set<string>();
  for (const url of slice) {
    const sm = url.match(schoolDetailRe);
    if (sm) {
      const slug = decodeURIComponent(sm[1]);
      const lvl = slugToLevel.get(slug);
      types.add(lvl === "high" ? "고등학교×과목" : lvl === "middle" ? "중학교×과목" : "학교×과목");
      const gu = slugToGuName.get(slug);
      if (gu) gus.add(gu);
      continue;
    }
    const rm = url.match(regionDetailRe);
    if (rm) {
      types.add("동×과목");
      const sido = rm[1];
      const guSlug = rm[2];
      const gu = sido === SEOUL_SLUG ? seoulGuSlugToName.get(guSlug) ?? guSlug : guSlug;
      gus.add(gu);
      continue;
    }
    types.add("허브");
  }
  const guList = [...gus].slice(0, 3).join("·");
  const typeList = [...types].join(", ");
  return `${guList ? guList + " " : ""}${typeList}`.trim();
}

/* ───────── 기존 미제출 day-*.txt → archived/ 이동, 이전 day2-*.txt 정리 ───────── */
mkdirSync(ARCHIVE_DIR, { recursive: true });
for (const f of readdirSync(OUT_DIR)) {
  if (/^day-\d+\.txt$/.test(f) && !SUBMITTED.has(f))
    renameSync(join(OUT_DIR, f), join(ARCHIVE_DIR, f));
  if (new RegExp(`^${NEW_PREFIX}-\\d+\\.txt$`).test(f)) rmSync(join(OUT_DIR, f));
}

/* ───────── 새 배치 파일 출력 ───────── */
const pad = (n: number) => String(n).padStart(3, "0");
const totalDays = Math.ceil(ordered.length / BATCH_SIZE);
const fileSummaries: { name: string; summary: string; count: number }[] = [];
for (let i = 0; i < totalDays; i++) {
  const slice = ordered.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE);
  const name = `${NEW_PREFIX}-${pad(i + 1)}.txt`;
  writeFileSync(join(OUT_DIR, name), slice.join("\n") + "\n", "utf8");
  fileSummaries.push({ name, summary: summarize(slice), count: slice.length });
}

/* ───────── INDEX.md 갱신 ───────── */
const rankCounts = {
  hub: buckets[0].length,
  p1: buckets[1].length,
  p2: buckets[2].length,
  p3: buckets[3].length,
  rest: buckets[4].length,
};
const domain = "https://xn--l89av43blfdm0cm7d.com";
const checklist = fileSummaries
  .map((f) => `- [ ] ${f.name} — ${f.summary} (${f.count}개)`)
  .join("\n");

const index = `# 네이버 수집 요청 배치 (고등학교×과목 우선 재정렬)

- **재정렬 풀 URL 수**: ${ordered.length.toLocaleString()}개
- **배치 파일 수**: ${totalDays}개 (배치당 ${BATCH_SIZE}개, 접두사 \`${NEW_PREFIX}-\`)
- **도메인**: ${domain}
- **재정렬 기준일**: 2026-07-20 (2학기 대비 수요기 — 고등 학교명 검색 대응)
- **제외(정상 제출 완료)**: day-001.txt ${submittedUrlCount}개 URL — 아래 기록 보존
- **원칙**: 기존 배치 URL 을 순서만 바꾼 재정렬(추가·삭제 없음). 기존 day-*.txt 는 \`archived/\` 로 이동.

## 새 우선순위별 URL 수
| 순위 | 구분 | URL 수 |
|---|---|---:|
| 0 | 허브(풀 잔존분) | ${rankCounts.hub.toLocaleString()} |
| 1 | 강남·양천·송파 고등학교×과목 | ${rankCounts.p1.toLocaleString()} |
| 2 | 그 외 서울 고등학교×과목 | ${rankCounts.p2.toLocaleString()} |
| 3 | 전국 나머지 고등학교×과목 | ${rankCounts.p3.toLocaleString()} |
| 4 | 그 외(기존 Tier 순서 유지) | ${rankCounts.rest.toLocaleString()} |
| **합계** | | **${ordered.length.toLocaleString()}** |

> 2·3순위가 0인 이유: 기존 풀에는 강남·양천·송파 외 고등학교×과목 URL 이 포함돼 있지 않다(생성 시 상한으로 미편입). 상한을 늘려 재생성하면 순위 2·3 에 편입된다.

## 운영 방법
1. 매일 배치 파일 하나(예: \`${NEW_PREFIX}-001.txt\`)를 엽니다.
2. 네이버 서치어드바이저 → **요청 → 웹 페이지 수집** 에 파일 안의 URL 을 **한 줄씩** 붙여넣어 제출합니다.
3. 파일 하나(50개)를 모두 제출했으면, 아래 체크리스트에서 해당 파일에 체크합니다.
4. 다음 날 다음 번호 파일로 이어서 진행합니다. (재정렬 스크립트: \`npx tsx scripts/reorder-naver-submission-highschool.ts\`)

## 기존 제출 기록(보존)
- [x] day-001.txt — 2026-07-15 제출, 사이트 정상 상태에서 정상 수집 완료(재정렬 풀에서 제외)
- [ ] ${FAILED_TODAY} — 7/20 제출 — 사이트 정지로 수집 실패, 재정렬 풀에 반환

## 제출 체크리스트 (재정렬본)
${checklist}
`;
writeFileSync(join(OUT_DIR, "INDEX.md"), index, "utf8");

/* ───────── 콘솔 요약 후 즉시 종료 ───────── */
console.log("[네이버 배치 재정렬 완료]");
console.log(`  제외(정상 제출 완료 day-001): ${submittedUrlCount} URL`);
console.log(`  재정렬 풀: ${pool.length} URL / 검증 통과(총수 일치·중복 0·집합 동등)`);
console.log(`  순위별 — 허브:${rankCounts.hub} / 1:${rankCounts.p1} / 2:${rankCounts.p2} / 3:${rankCounts.p3} / 4:${rankCounts.rest}`);
console.log(`  출력: ${NEW_PREFIX}-001.txt ~ ${NEW_PREFIX}-${pad(totalDays)}.txt (${totalDays}개) + INDEX.md`);
console.log(`  이동: 기존 미제출 day-*.txt → archived/`);
