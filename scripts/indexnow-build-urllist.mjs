// scripts/indexnow-build-urllist.mjs
//
// 학교×과목 상세 URL 목록 생성기 (IndexNow 첫 전송용) — 1회성 실행 후 종료.
//
// 사이트맵(src/app/sitemap.ts)의 학교 청크와 "동일한 URL"을 생성한다:
//   url = `${BASE}/tutoring/by-school/${encodeURIComponent(school.slug)}/${subject.slug}`
// 순서도 사이트맵과 동일(학교 파일 순서 = ALL_SCHOOLS, 학교마다 과목 8종 순서).
//
// 데이터는 소스 단일 소스에서 파싱한다(빌드/런타임 무관, 정적 텍스트 파싱):
//   - src/data/schools.ts : 학교 slug (각 학교 객체는 `slug: "x", level: "..."`)
//   - src/data/subjects.ts: 과목 slug (subjects 배열, 8종)
//
// 출력: scripts/indexnow/school-subject-urls.txt (한 줄 1 URL)
// 상주/폴링/데몬 없음 — 파일 쓰고 종료.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BASE = "https://xn--l89av43blfdm0cm7d.com";

// 학교 slug — `slug: "…", level:` 패턴만(시도/시군구 slug 는 level 이 없어 제외). 파일 순서 보존.
const schoolsSrc = readFileSync(join(ROOT, "src/data/schools.ts"), "utf8");
const schoolSlugs = [...schoolsSrc.matchAll(/slug:\s*"([^"]+)"\s*,\s*level:/g)].map(
  (m) => m[1],
);

// 과목 slug — subjects 배열의 따옴표 slug 8종(인터페이스의 `slug: string;` 은 값이 없어 미매칭).
const subjectsSrc = readFileSync(join(ROOT, "src/data/subjects.ts"), "utf8");
const subjectSlugs = [...subjectsSrc.matchAll(/slug:\s*"([^"]+)"/g)].map((m) => m[1]);

if (schoolSlugs.length === 0 || subjectSlugs.length === 0) {
  console.error(
    `파싱 실패 — 학교 ${schoolSlugs.length} / 과목 ${subjectSlugs.length}. 소스 형식 변경 여부 확인.`,
  );
  process.exit(1);
}

const urls = [];
for (const school of schoolSlugs) {
  for (const subject of subjectSlugs) {
    // 사이트맵과 동일: 학교 slug 만 encodeURIComponent, 과목 slug 는 원문(영문).
    urls.push(`${BASE}/tutoring/by-school/${encodeURIComponent(school)}/${subject}`);
  }
}

const outDir = join(ROOT, "scripts/indexnow");
mkdirSync(outDir, { recursive: true });
const outFile = join(outDir, "school-subject-urls.txt");
writeFileSync(outFile, urls.join("\n") + "\n", "utf8");

console.log(`학교 slug: ${schoolSlugs.length}`);
console.log(`과목 slug: ${subjectSlugs.length} (${subjectSlugs.join(", ")})`);
console.log(`생성 URL 총수: ${urls.length}`);
console.log(`출력: ${outFile}`);
console.log(`샘플 첫 3줄:\n  ${urls.slice(0, 3).join("\n  ")}`);
