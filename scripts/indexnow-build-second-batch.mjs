// scripts/indexnow-build-second-batch.mjs
//
// IndexNow 2차 전송 목록 생성기 — 최근 실변경 페이지(~530개). 1회성 실행 후 종료.
//
// 대상(사이트맵 <loc> 와 동일 인코딩: 한글 경로는 encodeURIComponent):
//   ① 지역 랜딩 122개        /{region.id}                     (인바운드 링크 신설)
//   ② 경기 시군구×과목 368개  /tutoring/by-region/경기/{sg}/{subj}  (SSR 잘림 해소·사이트맵 등재분)
//   ③ 허브 38개              홈 + by-region/by-school/by-subject 허브 + 시도 허브 34
//                            (폰트·이미지·링크 실변경)
//
// 출력: scripts/indexnow/second-batch-urls.txt (한 줄 1 URL). 상주/폴링 없음.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BASE = "https://xn--l89av43blfdm0cm7d.com";
const enc = (s) => encodeURIComponent(s);

const read = (p) => readFileSync(join(ROOT, p), "utf8");

// ── ① 지역 랜딩 122 (regions.ts 의 id) ──────────────────────────────────
const regionsSrc = read("src/data/regions.ts");
const regionIds = [...new Set([...regionsSrc.matchAll(/id:\s*"([^"]+)"/g)].map((m) => m[1]))];
const regionUrls = regionIds.map((id) => `${BASE}/${enc(id)}`);

// ── ② 경기 시군구×과목 368 (gyeonggi 46 × pseo 과목 8) ───────────────────
const gg = JSON.parse(read("src/data/gyeonggi-regions.json"));
const sigungu = gg.sigungu; // 46
const SIDO = gg.sidoLabel; // "경기"
// pseo.ts 의 subjects 배열만 슬라이스(grades 제외)
const pseoSrc = read("src/data/pseo.ts");
const sStart = pseoSrc.indexOf("export const subjects");
const subjBlock = pseoSrc.slice(sStart, pseoSrc.indexOf("];", sStart));
const pseoSubjects = [...subjBlock.matchAll(/slug:\s*"([^"]+)"/g)].map((m) => m[1]); // 8
// 사이트맵과 동일 순서(과목 바깥, 시군구 안)
const sigunguUrls = [];
for (const subj of pseoSubjects) {
  for (const sg of sigungu) {
    sigunguUrls.push(`${BASE}/tutoring/by-region/${enc(SIDO)}/${enc(sg.slug)}/${enc(subj)}`);
  }
}

// ── ③ 허브 38 (홈 + 카테고리 허브 3 + 시도 허브 34) ──────────────────────
const sidoSrc = read("src/data/sido.ts");
const sidoSlugs = [...sidoSrc.matchAll(/slug:\s*"([a-z]+)"/g)].map((m) => m[1]); // 17
const hubUrls = [
  `${BASE}/`, // 홈(사이트맵 <loc> 와 동일하게 트레일링 슬래시)
  `${BASE}/tutoring/by-region`,
  `${BASE}/tutoring/by-school`,
  `${BASE}/tutoring/by-subject`,
  ...sidoSlugs.map((s) => `${BASE}/tutoring/by-region/${s}`),
  ...sidoSlugs.map((s) => `${BASE}/tutoring/by-school/${s}`),
];

const all = [...regionUrls, ...sigunguUrls, ...hubUrls];
const uniq = [...new Set(all)];

const outDir = join(ROOT, "scripts/indexnow");
mkdirSync(outDir, { recursive: true });
const outFile = join(outDir, "second-batch-urls.txt");
writeFileSync(outFile, uniq.join("\n") + "\n", "utf8");

console.log(`① 지역 랜딩: ${regionUrls.length}`);
console.log(`② 경기 시군구×과목: ${sigunguUrls.length} (시군구 ${sigungu.length} × 과목 ${pseoSubjects.length} [${pseoSubjects.join(",")}])`);
console.log(`③ 허브: ${hubUrls.length} (홈1 + 카테고리3 + 시도 ${sidoSlugs.length}×2)`);
console.log(`합계(중복 제거 전): ${all.length}  / 중복 제거 후: ${uniq.length}`);
console.log(`출력: ${outFile}`);
