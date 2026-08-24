// scripts/indexnow-detect.mjs
//
// IndexNow 반자동 감지기 (c안) — "이번 배포에서 실제 변경된 유형의 URL만" 산출한다.
// 전송은 하지 않는다. 목록 파일과 다음 실행 명령만 출력하고 종료(포그라운드 1회).
//
// 동작:
//   1) contentMeta.ts 의 상수별 `// @indexnow-group: <그룹>` 태그를 작업트리에서 읽어
//      상수→그룹 매핑을 만든다.
//   2) git diff <base> <head> -- src/data/contentMeta.ts 에서 "값이 바뀐 상수"만 추린다
//      (태그 주석만 추가된 변경은 날짜 값이 그대로라 감지되지 않는다 — 가짜 트리거 방지).
//   3) 바뀐 상수의 그룹별 URL 목록을 사이트맵과 동일 소스에서 산출한다.
//   4) 총량을 출력하고, 1,000건 초과 그룹은 경고를 띄운 뒤 목록 파일만 남기고 종료
//      (전송기는 --confirm-large 없이는 거부하도록 별도 가드).
//   5) 이미 이 커밋으로 전송된 marker(.indexnow-sent-<sha>)가 있으면 안내 후 종료.
//
// 사용법:
//   node scripts/indexnow-detect.mjs [--base <ref>] [--head <ref>]
//     --base : 직전 배포 기준(기본 origin/master). push 전 리뷰어 흐름에선 origin/master 가
//              "마지막 배포", HEAD 가 "이번 배포". 이미 push된 커밋을 사후 검증할 땐 --base HEAD~1.
//     --head : 이번 배포 기준(기본 HEAD).
//
// 상주/폴링/데몬 없음.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BASE_URL = "https://xn--l89av43blfdm0cm7d.com";
const META_REL = "src/data/contentMeta.ts";
const OUT_DIR = join(ROOT, "scripts/indexnow");
const WARN_THRESHOLD = 1000;

// ── 인자 ──────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const getArg = (name, def) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : def;
};
const baseRef = getArg("--base", "origin/master");
const headRef = getArg("--head", "HEAD");

const git = (cmd) => execSync(`git ${cmd}`, { cwd: ROOT, encoding: "utf8" });

// ── 커밋 SHA + marker 선확인 ────────────────────────────────────────────────
let headSha;
try {
  headSha = git(`rev-parse --short ${headRef}`).trim();
} catch (e) {
  console.error(`git rev-parse 실패(${headRef}): ${e.message}`);
  process.exit(1);
}
const markerPath = join(ROOT, `.indexnow-sent-${headSha}`);
if (existsSync(markerPath)) {
  console.log(`이미 전송됨 — marker 존재: .indexnow-sent-${headSha}`);
  console.log(`(같은 커밋 재전송 방지. 재전송이 필요하면 marker 파일을 지운 뒤 다시 실행.)`);
  process.exit(0);
}

// ── 1) 작업트리 contentMeta 에서 상수→그룹 태그 매핑 ─────────────────────────
const metaSrc = readFileSync(join(ROOT, META_REL), "utf8");
const groupOf = {}; // NAME → group
for (const m of metaSrc.matchAll(
  /export\s+const\s+(\w+)\s*=\s*"[^"]*";\s*\/\/\s*@indexnow-group:\s*([\w-]+)/g,
)) {
  groupOf[m[1]] = m[2];
}

// ── 2) git diff 로 "값이 바뀐 상수"만 추출 ──────────────────────────────────
let diff = "";
try {
  diff = git(`diff ${baseRef} ${headRef} -- ${META_REL}`);
} catch (e) {
  console.error(`git diff 실패(${baseRef}..${headRef}): ${e.message}`);
  process.exit(1);
}
const removed = {};
const added = {};
for (const line of diff.split(/\r?\n/)) {
  let m;
  if ((m = line.match(/^-\s*export\s+const\s+(\w+)\s*=\s*"([^"]+)"/))) removed[m[1]] = m[2];
  else if ((m = line.match(/^\+\s*export\s+const\s+(\w+)\s*=\s*"([^"]+)"/))) added[m[1]] = m[2];
}
// 값이 새로 생겼거나(added 존재) 이전과 다른 경우만 "변경"으로 본다.
const changedConsts = Object.keys(added).filter(
  (name) => removed[name] === undefined || removed[name] !== added[name],
);

if (changedConsts.length === 0) {
  console.log(`변경된 contentMeta 상수 없음 (${baseRef}..${headRef}). 전송 대상 없음 — 종료.`);
  process.exit(0);
}

// 변경 상수 → 그룹(중복 제거). 태그 없는 상수는 경고.
const groups = new Set();
const untagged = [];
for (const name of changedConsts) {
  const g = groupOf[name];
  if (!g) untagged.push(name);
  else groups.add(g);
}

console.log(`기준: ${baseRef}..${headRef} (커밋 ${headSha})`);
console.log(`변경된 상수: ${changedConsts.map((n) => `${n}(${removed[n] ?? "신규"}→${added[n]})`).join(", ")}`);
if (untagged.length) {
  console.log(`⚠️  그룹 태그 없는 상수(전송 제외): ${untagged.join(", ")} — 필요 시 태그 추가.`);
}
console.log(`감지 그룹: ${[...groups].join(", ") || "(없음)"}`);
console.log("");

// ── 3) 그룹별 URL 산출기 (사이트맵과 동일 소스) ─────────────────────────────
const enc = (s) => encodeURIComponent(s);
const readSrc = (rel) => readFileSync(join(ROOT, rel), "utf8");

function urlsForGroup(group) {
  switch (group) {
    case "school": {
      // 학교 slug(`slug:"x", level:`) × 과목 slug 8종 — indexnow-build-urllist 와 동일 규칙/순서.
      const schoolSlugs = [
        ...readSrc("src/data/schools.ts").matchAll(/slug:\s*"([^"]+)"\s*,\s*level:/g),
      ].map((m) => m[1]);
      const subjectSlugs = [
        ...readSrc("src/data/subjects.ts").matchAll(/slug:\s*"([^"]+)"/g),
      ].map((m) => m[1]);
      const out = [];
      for (const s of schoolSlugs)
        for (const subj of subjectSlugs)
          out.push(`${BASE_URL}/tutoring/by-school/${enc(s)}/${subj}`);
      return out;
    }
    case "school-hub": {
      // 학교 단위 허브(과목 없음) — 고교 파일럿. schoolSitemap.ts 의 HIGH_SCHOOL_HUB_SLUGS 와
      // 동일 산출: schools.ts 파일 순서(=ALL_SCHOOLS) × 해석된 level("high") 필터.
      // level 오배정 교정(schoolLevelOverrides)을 반영해 사이트맵/라우트와 같은 집합·순서가 되게 한다.
      const pairs = [
        ...readSrc("src/data/schools.ts").matchAll(
          /slug:\s*"([^"]+)"\s*,\s*level:\s*"([^"]+)"/g,
        ),
      ].map((m) => [m[1], m[2]]);
      const ov = {};
      for (const m of readSrc("src/data/schoolLevelOverrides.ts").matchAll(
        /(?:"([^"]+)"|([A-Za-z0-9_]+)):\s*"(high|middle|elem)"/g,
      )) {
        ov[m[1] ?? m[2]] = m[3];
      }
      const out = [];
      for (const [slug, level] of pairs) {
        if ((ov[slug] ?? level) === "high")
          out.push(`${BASE_URL}/tutoring/by-school/${enc(slug)}`);
      }
      return out;
    }
    case "subject": {
      const subjectSlugs = [
        ...readSrc("src/data/subjects.ts").matchAll(/slug:\s*"([^"]+)"/g),
      ].map((m) => m[1]);
      return subjectSlugs.map((s) => `${BASE_URL}/tutoring/by-subject/${s}`);
    }
    case "region": {
      // regions.ts 의 데이터 라인 id(인터페이스 `id: string;` 은 따옴표 없어 미매칭).
      const ids = [...readSrc("src/data/regions.ts").matchAll(/\bid:\s*"([^"]+)"/g)].map((m) => m[1]);
      return ids.map((id) => `${BASE_URL}/${enc(id)}`);
    }
    case "region-landmark": {
      // regionLandmarks.ts 의 REGION_LANDMARKS 키(보강 대상 랜딩만).
      const keys = [
        ...readSrc("src/data/regionLandmarks.ts").matchAll(/"([^"]+)":\s*\[/g),
      ].map((m) => m[1]);
      return keys.map((id) => `${BASE_URL}/${enc(id)}`);
    }
    case "core": {
      return [`${BASE_URL}/`, `${BASE_URL}/apply`, `${BASE_URL}/privacy`];
    }
    default:
      // dong·gyeonggi·power 는 대량·복합 산출이라 자동 생성 미지원(수동 리스트/승인 경로).
      return null;
  }
}

// ── 4) 그룹별 목록 생성 + 규모 가드 ────────────────────────────────────────
mkdirSync(OUT_DIR, { recursive: true });
let anyOver = false;
const produced = [];

for (const group of groups) {
  const urls = urlsForGroup(group);
  if (urls === null) {
    console.log(`● ${group}: 자동 생성 미지원(대량·복합). 수동 리스트/승인 경로로 처리 필요.`);
    continue;
  }
  const outFile = join(OUT_DIR, `detected-${group}.txt`);
  writeFileSync(outFile, urls.join("\n") + "\n", "utf8");
  const rel = outFile.replace(ROOT + "\\", "").replace(ROOT + "/", "").replace(/\\/g, "/");
  const over = urls.length > WARN_THRESHOLD;
  anyOver = anyOver || over;
  produced.push({ group, count: urls.length, rel, over });

  console.log(`● ${group}: ${urls.length}건 → ${rel}`);
  if (over) {
    console.log(
      `   ⚠️  ${WARN_THRESHOLD}건 초과 — 대량 전송. 검수자 승인 후 전송기에 --confirm-large 필요.`,
    );
  }
}

console.log("");
if (produced.length === 0) {
  console.log("자동 산출 가능한 그룹 없음 — 종료(전송 없음).");
  process.exit(0);
}

// ── 5) 다음 실행 안내 (전송은 사람이 승인 후 실행) ──────────────────────────
console.log("다음 단계(검수자 승인 후, 배포 라이브 확인 뒤 실행):");
for (const p of produced) {
  const flag = p.over ? " --confirm-large" : "";
  console.log(`  node scripts/indexnow-submit.mjs ${p.rel}${flag}`);
}
console.log("");
console.log(`전송 성공 시 전송기가 marker(.indexnow-sent-${headSha})를 남겨 재전송을 막는다.`);
if (anyOver) {
  console.log("⚠️  1,000건 초과 그룹 포함 — 자동 전송하지 않음. 승인·분할 전송 원칙 준수.");
}
