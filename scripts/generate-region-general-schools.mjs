/*
 * 지역×과목 pSEO 인근 학교용 — 전국 시군구 "일반계 대표 학교"(중2·고2) 자동 산출.
 *
 * 실행: node scripts/generate-region-general-schools.mjs   (수동 1회성)
 * 환경변수(.env.local 자가 로딩): NEIS_API_KEY
 * 출력: src/data/regionGeneralSchools.generated.ts (결과 파일만 커밋, 수집 JSON·키는 커밋 금지)
 *
 * 분류 규칙(확정):
 *  - 고등학교: NEIS HS_SC_NM 기준 — 일반고·자율고 = 일반계 포함 / 특성화고·특목고 = 제외 /
 *    schools.ts↔NEIS 매칭 실패 = 자동 풀에서 제외(그 학교 없이 나머지 일반계 가나다순).
 *  - 중학교: NEIS 는 중학교 유형을 제공하지 않으므로 교명 필터(공업·상업·예술·국제 등) 적용 후 가나다순.
 *  - 학교풀별 일반계 중 2 + 고 2, 가나다순. 한쪽 1개면 1개만, 0개면 해당 학교급 엔트리 생략.
 *  - 현행 가나다순과 결과가 같은 풀은 엔트리 생략(변경 대상 풀만 기록 → 파일 최소화).
 *
 * 결정론적: 시도교육청·시군구·학교 순회 순서 고정, 가나다 정렬 고정. 재실행 diff 로 변경 추적 가능.
 * NEIS 인증키는 절대 출력·커밋하지 않는다.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dir, "..");

/* ── .env.local 로딩 ────────────────────────────────────────────── */
try {
  const raw = readFileSync(join(ROOT, ".env.local"), "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].trim().replace(/^"(.*)"$/, "$1");
  }
} catch { /* 실제 환경변수 사용 */ }
const KEY = process.env.NEIS_API_KEY;
if (!KEY) { console.error("환경변수 NEIS_API_KEY 누락 — .env.local 확인"); process.exit(1); }

/* ── NEIS 수집 ──────────────────────────────────────────────────── */
const OFFICES = [["B10","서울"],["C10","부산"],["D10","대구"],["E10","인천"],["F10","광주"],["G10","대전"],["H10","울산"],["I10","세종"],["J10","경기"],["K10","강원"],["M10","충북"],["N10","충남"],["P10","전북"],["Q10","전남"],["R10","경북"],["S10","경남"],["T10","제주"]];
const PAGE = 1000, DELAY = 200;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** NEIS 정식 교명 → schools.ts 축약형 근사(여자→여, 외국어→외 등). */
function norm(nm) {
  return String(nm)
    .replace(/여자고등학교$/, "여고").replace(/여자중학교$/, "여중")
    .replace(/남자고등학교$/, "남고").replace(/남자중학교$/, "남중")
    .replace(/외국어고등학교$/, "외고")
    .replace(/고등학교$/, "고").replace(/중학교$/, "중");
}

async function fetchPage(office, pIndex) {
  const url = "https://open.neis.go.kr/hub/schoolInfo?KEY=" + encodeURIComponent(KEY) +
    `&Type=json&pIndex=${pIndex}&pSize=${PAGE}&ATPT_OFCDC_SC_CODE=${office}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("HTTP " + res.status);
  const j = await res.json();
  if (!j.schoolInfo) { if (j.RESULT?.CODE === "INFO-200") return null; throw new Error(j.RESULT?.CODE); }
  return { total: j.schoolInfo[0].head[0].list_total_count, rows: j.schoolInfo[1].row };
}

async function collectNeis() {
  const list = [];
  for (const [office, label] of OFFICES) {
    let p = 1, cnt = 0;
    for (;;) {
      let page;
      try { page = await fetchPage(office, p); } catch (e) { console.error(`  ${label} p${p} 실패: ${e.message}`); break; }
      if (!page || page.rows.length === 0) break;
      for (const r of page.rows) {
        const knd = r.SCHUL_KND_SC_NM;
        if (knd !== "중학교" && knd !== "고등학교") continue;
        list.push({ name: norm(r.SCHUL_NM), level: knd === "중학교" ? "middle" : "high", sido: r.LCTN_SC_NM || "", hsType: r.HS_SC_NM ?? null });
        cnt++;
      }
      if (p * PAGE >= page.total) break;
      p++; await sleep(DELAY);
    }
    console.log(`  ${label}: 중·고 ${cnt}`);
    await sleep(DELAY);
  }
  return list;
}

/* ── schools.ts 파싱 ────────────────────────────────────────────── */
function parseSchools() {
  const sc = readFileSync(join(ROOT, "src/data/schools.ts"), "utf8").split(/\r?\n/);
  const sidoRe = /\{ label: "([^"]+)", slug: "([^"]+)", sigungu:/, sgRe = /\{ name: "([^"]+)", slug: "([^"]+)", schools:/, scRe = /\{ name: "([^"]+)", slug: "([^"]+)", level: "(elem|middle|high)" \}/;
  let cs = null, cg = null; const pools = [];
  for (const ln of sc) {
    const a = ln.match(sidoRe); if (a) { cs = { label: a[1], slug: a[2] }; continue; }
    const b = ln.match(sgRe); if (b && cs) { cg = { key: `${cs.slug}/${b[2]}`, sidoLabel: cs.label, sgName: b[1], schools: [] }; pools.push(cg); continue; }
    const d = ln.match(scRe); if (d && cg) cg.schools.push({ name: d[1], slug: d[2], level: d[3] });
  }
  return pools;
}

/* ── 중학교 교명 필터(1차 규칙과 동일) ──────────────────────────── */
const EXCLUDE = ["공업","공고","상업","상고","정보","디지털","전자","예술","체육","외국어","외고","과학고","국제","마이스터","관광","조리","미디어","디자인","애니메이션","방송","세무","회계","금융","보건","간호","농생명","해양","로봇","인공지능"];
const nameExcluded = (n) => EXCLUDE.some((k) => n.includes(k));
const gana = (arr) => arr.slice().sort((a, b) => a.name.localeCompare(b.name, "ko"));

async function main() {
  console.log("NEIS 수집…");
  const neis = await collectNeis();
  console.log(`총 중·고 ${neis.length}건`);

  // NEIS 인덱스
  const byNameSido = new Map(), byName = new Map();
  const put = (m, k, v) => { const a = m.get(k); if (a) a.push(v); else m.set(k, [v]); };
  for (const r of neis) { put(byNameSido, `${r.name}|${r.sido}|${r.level}`, r); put(byName, `${r.name}|${r.level}`, r); }
  function matchType(name, level, sidoLabel) {
    const c1 = byNameSido.get(`${name}|${sidoLabel}|${level}`);
    if (c1 && c1.length === 1) return c1[0].hsType;
    if (c1 && c1.length > 1) return "FAIL";
    const c2 = byName.get(`${name}|${level}`);
    if (c2 && c2.length === 1) return c2[0].hsType;
    return "FAIL";
  }
  const isGeneralHigh = (t) => t === "일반고" || t === "자율고"; // 자율고 포함(확정)

  const pools = parseSchools();
  const entries = []; // {key, sgName, middle:[{name,slug}], high:[{name,slug}]}
  let changedPools = 0, schoolCount = 0;
  for (const pool of pools) {
    const highs = gana(pool.schools.filter((s) => s.level === "high"));
    const mids = gana(pool.schools.filter((s) => s.level === "middle"));
    // 자동 산출(일반계)
    const genHigh = highs.filter((s) => isGeneralHigh(matchType(s.name, "high", pool.sidoLabel))).slice(0, 2);
    const genMid = mids.filter((s) => !nameExcluded(s.name)).slice(0, 2);
    // 현행 가나다 top-2
    const curHigh = highs.slice(0, 2), curMid = mids.slice(0, 2);
    const eq = (a, b) => a.map((s) => s.slug).join() === b.map((s) => s.slug).join();
    if (eq(genHigh, curHigh) && eq(genMid, curMid)) continue; // 변경 없음 → 생략
    changedPools++;
    schoolCount += genHigh.length + genMid.length;
    entries.push({ key: pool.key, sgName: pool.sgName, middle: genMid, high: genHigh });
  }
  entries.sort((a, b) => a.key.localeCompare(b.key));

  // 파일 조립
  const today = new Date().toISOString().slice(0, 10);
  const lines = entries.map((e) => {
    const parts = [];
    if (e.middle.length) parts.push(`middle: [${e.middle.map((s) => `"${s.slug}"`).join(", ")}]`);
    if (e.high.length) parts.push(`high: [${e.high.map((s) => `"${s.slug}"`).join(", ")}]`);
    const cm = `중 ${e.middle.map((s) => s.name).join("·") || "-"} / 고 ${e.high.map((s) => s.name).join("·") || "-"}`;
    return `  "${e.key}": { ${parts.join(", ")} }, // ${e.sgName} · ${cm}`;
  });
  const header = `/**
 * [자동 생성 — 손으로 수정하지 말 것]
 * 지역×과목 pSEO 인근 학교(중2·고2) — 전국 시군구 "일반계 대표 학교" 자동 산출본.
 *
 * 생성일: ${today}
 * 생성 스크립트: scripts/generate-region-general-schools.mjs (NEIS schoolInfo + schools.ts 매칭)
 * 분류 규칙: 고 = NEIS HS_SC_NM 일반고·자율고 포함 / 특성화·특목 제외 / 매칭실패 제외.
 *            중 = 교명 필터(공업·예술·국제 등) 후 가나다순. 학교풀별 중2·고2(가나다).
 * 수록 범위: 현행 가나다순과 결과가 달라지는 학교풀만(동일 풀은 생략).
 * 우선순위: regionFeaturedSchools(수동) → 이 파일(자동) → 가나다순. (lib/regionSchoolPick.ts)
 * key = schools.ts 시군구 풀 slug(\`\${sidoSlug}/\${sigunguSlug}\`). 경기 시 단위는 런타임에서 구 route 로 확장.
 */
export const regionGeneralSchools: Record<
  string,
  { middle?: string[]; high?: string[] }
> = {
${lines.join("\n")}
};
`;
  writeFileSync(join(ROOT, "src/data/regionGeneralSchools.generated.ts"), header, "utf8");

  // slug 실존·소속 검증
  const poolByKey = new Map(pools.map((p) => [p.key, new Set(p.schools.map((s) => s.slug))]));
  let bad = 0;
  for (const e of entries) for (const s of [...e.middle, ...e.high]) if (!poolByKey.get(e.key)?.has(s.slug)) { console.error(`  ✗ ${e.key} ${s.slug} 소속 아님`); bad++; }
  console.log(`\n생성 완료 — 변경 풀 ${changedPools}개 / 학교 ${schoolCount}개`);
  console.log(bad === 0 ? "slug 실존·소속 검증 ✅" : `✗ ${bad}건 오류`);
}
main().catch((e) => { console.error("중단:", e?.message ?? e); process.exit(1); });
