/**
 * 네이버 서치어드바이저 "웹 페이지 수집 요청" 루틴용 — 우선순위 정렬 URL 배치 생성 스크립트.
 *
 * 실행: npx tsx scripts/generate-naver-submission-batches.ts
 * 출력: naver-submission/day-001.txt, day-002.txt … + INDEX.md  (운영자가 매일 50개씩 수동 제출)
 *
 * 원칙:
 *  - 사이트 코드는 읽기 전용. URL 규칙은 추측하지 않고 src/app/sitemap.ts 의 실제 템플릿을 그대로 재현한다.
 *      · 지역 랜딩:  /{encodeURIComponent(r.id)}                         (sitemap.ts regionPages)
 *      · 동×과목:    /tutoring/by-region/{sido}/{시군구}/{동}/{과목}      (sitemap.ts pilotDetail · dongHref)
 *      · 학교×과목:  /tutoring/by-school/{encodeURIComponent(slug)}/{과목}(sitemap.ts schoolSitemap · schoolDetailHref)
 *      · 과목 단독:  /tutoring/by-subject/{과목}                          (sitemap.ts subjectDetailPages)
 *  - 학교명·지역명 하드코딩 금지 → data 파일 import. 우선순위 설정값만 아래 상수로 분리(수정 용이).
 *  - 결정론적 정렬(실행마다 동일). Math.random / 시간 의존 없음. 감시 루프 없음(실행→생성→즉시 종료).
 *
 * 데이터는 @/ alias 를 쓰지 않는 자체 완결 data 파일만 상대경로로 import(tsx 호환).
 */
import { writeFileSync, mkdirSync, readdirSync, rmSync, existsSync } from "node:fs";
import { join } from "node:path";
import { SCHOOLS, type SchoolLevel } from "../src/data/schools";
import { getSido } from "../src/data/sidoRegions";
import { subjects } from "../src/data/subjects";
import { regions } from "../src/data/regions";

/* ───────── 우선순위 설정값(여기만 고치면 됨) ───────── */
const DOMAIN = "https://xn--l89av43blfdm0cm7d.com"; // 네이버 등록 도메인(퓨니코드)과 일치
const BATCH_SIZE = 50; // 네이버 일일 수집요청 한도
const OUT_DIR = join(process.cwd(), "naver-submission");
const CHECKLIST_ALL_DAYS = true; // INDEX 체크박스: 전체 일수(day-001~). false 면 30일까지만.

/** Tier 1·2 우선 구(강남·양천·송파) — schools.ts·sidoRegions.ts 공통 시군구 slug. */
const PRIORITY_GU = ["gangnamgu", "yangcheongu", "songpagu"] as const;
const SEOUL_SLUG = "seoul";
/** 과목 우선순위: 수학→영어→국어→과학→사회→(나머지). 값은 subjects.ts 영문 slug. */
const SUBJECT_ORDER = ["math", "english", "korean", "science", "social", "history", "essay", "coding"];
/** /power 언어별 페이지 slug (= data/languageDetail.ts LANGUAGE_SLUGS). */
const LANGUAGE_SLUGS = ["english", "japanese", "chinese"];
/** Tier 3~4 합산 상위 N개까지만(초기 루틴 검증용 — 이후 상수만 늘려 확장). */
const TIER34_CAP = 5000;

/* ───────── URL 빌더(sitemap.ts 템플릿 재현) ───────── */
const abs = (path: string) => `${DOMAIN}${path}`;
const dongSubjectUrl = (sido: string, sg: string, dong: string, subj: string) =>
  abs(`/tutoring/by-region/${sido}/${sg}/${dong}/${subj}`);
const schoolSubjectUrl = (slug: string, subj: string) =>
  abs(`/tutoring/by-school/${encodeURIComponent(slug)}/${subj}`);
const regionLandingUrl = (id: string) => abs(`/${encodeURIComponent(id)}`);
const subjectUrl = (subj: string) => abs(`/tutoring/by-subject/${subj}`);

/* ───────── 정렬 헬퍼(결정론적) ───────── */
const byNameKo = <T extends { name: string }>(a: T, b: T) => a.name.localeCompare(b.name, "ko");
const orderedSubjectSlugs = SUBJECT_ORDER.filter((s) => subjects.some((x) => x.slug === s));

/* 전역 중복 제거 — 먼저 등장한 Tier 를 유지. */
const seen = new Set<string>();
const push = (list: string[], url: string) => {
  if (!seen.has(url)) {
    seen.add(url);
    list.push(url);
  }
};

/* ───────── Tier 0: 허브/상위 탐색 페이지 ───────── */
function buildTier0(): string[] {
  const out: string[] = [];
  for (const u of [
    abs("/"),
    abs("/tutoring/by-region"),
    abs("/tutoring/by-school"),
    abs("/tutoring/by-subject"),
    abs("/power"),
    ...LANGUAGE_SLUGS.map((s) => abs(`/power/${s}`)),
    ...orderedSubjectSlugs.map(subjectUrl), // 과목별 커리큘럼 허브 8개
  ])
    push(out, u);
  return out;
}

/* ───────── Tier 1: 강남·양천·송파 동×과목 ───────── */
function buildTier1(): string[] {
  const out: string[] = [];
  const seoul = getSido(SEOUL_SLUG);
  for (const guSlug of PRIORITY_GU) {
    const sg = seoul?.sigungu.find((s) => s.slug === guSlug);
    if (!sg) continue;
    for (const dong of sg.dong) // 데이터 원본 순서(결정론적)
      for (const subj of orderedSubjectSlugs)
        push(out, dongSubjectUrl(SEOUL_SLUG, guSlug, dong.slug, subj));
  }
  return out;
}

/* ───────── Tier 2: 강남·양천·송파 학교×과목 (고→중, 과목 우선순위) ───────── */
function buildTier2(): string[] {
  const out: string[] = [];
  const seoulSchools = SCHOOLS.find((s) => s.slug === SEOUL_SLUG);
  const levelOrder: SchoolLevel[] = ["high", "middle"]; // 고 → 중 (초등은 Tier 4)
  for (const level of levelOrder) {
    for (const guSlug of PRIORITY_GU) {
      const sg = seoulSchools?.sigungu.find((s) => s.slug === guSlug);
      if (!sg) continue;
      const schools = sg.schools.filter((s) => s.level === level).sort(byNameKo);
      for (const school of schools)
        for (const subj of orderedSubjectSlugs)
          push(out, schoolSubjectUrl(school.slug, subj));
    }
  }
  return out;
}

/* ───────── Tier 3: 그 외 서울 동×과목 (구 가나다순) ───────── */
function buildTier3(): string[] {
  const out: string[] = [];
  const seoul = getSido(SEOUL_SLUG);
  if (!seoul) return out;
  const otherGus = seoul.sigungu
    .filter((sg) => !PRIORITY_GU.includes(sg.slug as (typeof PRIORITY_GU)[number]))
    .sort(byNameKo); // 구 단위 가나다순
  for (const sg of otherGus)
    for (const dong of sg.dong)
      for (const subj of orderedSubjectSlugs)
        push(out, dongSubjectUrl(SEOUL_SLUG, sg.slug, dong.slug, subj));
  return out;
}

/* ───────── Tier 4: 그 외 학교 및 나머지(지역 랜딩 → 전국 학교) ───────── */
// cap 만큼만 채우면 조기 종료(전국 96k 학교 전부 생성 방지 — 메모리·시간 절약).
function buildTier4(limit: number): string[] {
  const out: string[] = [];
  if (limit <= 0) return out;
  const take = (url: string) => {
    push(out, url);
    return out.length >= limit;
  };
  // (a) 지역 랜딩 /{r.id} 122개 — 유한·고가치(허브 인접). id 순서 결정론적.
  for (const r of regions) if (take(regionLandingUrl(r.id))) return out;
  // (b) 전국 학교×과목 — SCHOOLS 원본 순서(시도→시군구→학교) × 과목 우선순위. Tier2 중복은 자동 제외.
  for (const sido of SCHOOLS)
    for (const sg of sido.sigungu)
      for (const school of sg.schools)
        for (const subj of orderedSubjectSlugs)
          if (take(schoolSubjectUrl(school.slug, subj))) return out;
  return out;
}

/* ───────── 조립 ───────── */
const t0 = buildTier0();
const t1 = buildTier1();
const t2 = buildTier2();
const t3 = buildTier3();
const remaining = Math.max(0, TIER34_CAP - t3.length);
const t4 = buildTier4(remaining);
const tier34 = [...t3, ...t4].slice(0, TIER34_CAP);
const all = [...t0, ...t1, ...t2, ...tier34];

// 중복 검증(안전망) — seen 로 이미 제거되지만 이중 확인.
const dupCheck = new Set<string>();
const dups: string[] = [];
for (const u of all) {
  if (dupCheck.has(u)) dups.push(u);
  dupCheck.add(u);
}
if (dups.length > 0) {
  console.error(`[오류] 중복 URL ${dups.length}건 발견 — 예:`, dups.slice(0, 3));
  process.exit(1);
}

/* ───────── 파일 출력 ───────── */
mkdirSync(OUT_DIR, { recursive: true });
// 이전 실행의 day-*.txt 제거(잔여 배치로 인한 불일치 방지) → 결정론적 재생성.
if (existsSync(OUT_DIR))
  for (const f of readdirSync(OUT_DIR))
    if (/^day-\d+\.txt$/.test(f)) rmSync(join(OUT_DIR, f));

const pad = (n: number) => String(n).padStart(3, "0");
const totalDays = Math.ceil(all.length / BATCH_SIZE);
const batchFiles: string[] = [];
for (let i = 0; i < totalDays; i++) {
  const slice = all.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE);
  const name = `day-${pad(i + 1)}.txt`;
  writeFileSync(join(OUT_DIR, name), slice.join("\n") + "\n", "utf8");
  batchFiles.push(name);
}

/* ───────── INDEX.md ───────── */
// Tier 3~4 는 TIER34_CAP 로 잘리므로, 실제 리스트에 '포함된' 개수로 보고(표 합계 = 전체 일치).
const includedT3 = Math.min(t3.length, tier34.length);
const includedT4 = tier34.length - includedT3;
const t3Cut = t3.length - includedT3; // 컷오프로 제외된 Tier3 수(있으면 안내)
const tierRows: readonly [string, number][] = [
  ["Tier 0 — 허브/상위 탐색", t0.length],
  ["Tier 1 — 강남·양천·송파 지역×과목", t1.length],
  ["Tier 2 — 위 3구 학교×과목(고→중)", t2.length],
  ["Tier 3 — 그 외 서울 지역×과목", includedT3],
  ["Tier 4 — 지역 랜딩 + 전국 학교(상위)", includedT4],
];

const checklistDays = CHECKLIST_ALL_DAYS ? totalDays : Math.min(30, totalDays);
const checklist = Array.from({ length: checklistDays }, (_, i) => `- [ ] day-${pad(i + 1)}.txt`).join("\n");

const index = `# 네이버 수집 요청 배치 (우선순위 정렬)

- **전체 URL 수**: ${all.length.toLocaleString()}개
- **배치 파일 수**: ${totalDays}개 (배치당 ${BATCH_SIZE}개)
- **예상 소요일수**: 약 ${totalDays}일 (하루 1파일)
- **도메인**: ${DOMAIN}
- **범위(초기)**: Tier 0~2 전량 + Tier 3~4 상위 ${TIER34_CAP.toLocaleString()}개 (이후 \`TIER34_CAP\` 상수만 늘려 확장)
${includedT4 === 0 ? `- **이번 컷오프에서 제외(확장 예정)**: 지역 랜딩 ${regions.length}개 + 전국 학교×과목 등 — Tier 3(그 외 서울)이 상한을 채워 Tier 4는 이번 회차 미포함. \`TIER34_CAP\`을 늘리면 순서대로 편입됩니다.` : ""}

## Tier별 URL 수
| Tier | URL 수 |
|---|---:|
${tierRows.map(([label, n]) => `| ${label} | ${n.toLocaleString()} |`).join("\n")}
| **합계** | **${all.length.toLocaleString()}** |

## 운영 방법
1. 매일 배치 파일 하나(예: \`day-001.txt\`)를 엽니다.
2. 네이버 서치어드바이저 → **요청 → 웹 페이지 수집** 에 파일 안의 URL을 **한 줄씩** 붙여넣어 제출합니다.
3. 파일 하나(50개)를 모두 제출했으면, 아래 체크리스트에서 해당 day 파일에 체크합니다.
4. 다음 날 다음 번호 파일로 이어서 진행합니다. (재생성 스크립트: \`npx tsx scripts/generate-naver-submission-batches.ts\`)

## 제출 체크리스트
${checklist}
`;
writeFileSync(join(OUT_DIR, "INDEX.md"), index, "utf8");

/* ───────── 콘솔 요약 후 즉시 종료 ───────── */
console.log("[네이버 배치 생성 완료]");
for (const [label, n] of tierRows) console.log(`  ${label}: ${n.toLocaleString()}`);
if (t3Cut > 0)
  console.log(`  (Tier 3 중 ${t3Cut.toLocaleString()}개 + Tier 4 전량은 컷오프 초과로 이번 회차 제외 — TIER34_CAP 확장 시 편입)`);
console.log(`  ─ 전체 URL: ${all.length.toLocaleString()} / 배치 파일: ${totalDays}개 (naver-submission/)`);
