/*
 * regions.ts 생성기 (pSEO 지역 데이터 단일 소스 빌드).
 *
 * 입력:
 *   public/files/ahreumworld.csv  → 경기도 시/군/구 + 동(법정/행정동) 목록(2개 표 블록)
 *   public/files/ahreumschool.csv → 광주광역시 구 + 초/중/고 학교 목록
 *   + 아래 METRO 상수: 특별/광역시·세종의 자치구/군(안정적인 행정구역, 직접 입력)
 *
 * 출력: src/data/regions.ts  (Region[] 배열 + 조회 헬퍼)
 *
 * 실행: node scripts/build-regions.mjs
 *   (이 환경은 PATH 에 node 가 없을 수 있음 — 포터블 노드 경로로 실행)
 *
 * ⚠️ 지역명은 "실제 행정구역"이어야 한다. 새 지역을 추가할 땐 CSV 를 늘리거나 METRO 에 사실인 구/군만 추가할 것.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const FILES = join(ROOT, "public", "files");

/** CSV 한 줄을 셀 배열로(따옴표 없는 단순 CSV 전제). 셀은 trim. */
function parseCsv(text) {
  return text
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.split(",").map((c) => c.trim()));
}

/** 한 칸 더 짧은 표시명: "수원시 영통구"→"수원 영통구", "평택시"→"평택", "가평군"→"가평", "송파구"→"송파구" */
function displayName(city) {
  if (city.includes(" ")) return city.replace("시 ", " ").replace("군 ", " ");
  if (/[시군]$/.test(city)) return city.slice(0, -1);
  return city;
}

/** URL 슬러그(한글): 공백 → '-' */
function toId(province, city) {
  return `${province}-${city.replace(/\s+/g, "-")}`;
}

const regions = [];
const seen = new Set();
function push(r) {
  if (seen.has(r.id)) return;
  seen.add(r.id);
  regions.push(r);
}

/* ── 1) ahreumworld.csv → 경기도 시/군/구 + 동 ──────────────────────────── */
{
  const rows = parseCsv(readFileSync(join(FILES, "ahreumworld.csv"), "utf8"));
  // 헤더(시군구 명) 행: 첫 칸이 비어있지 않고 동/읍/면으로 끝나지 않는 행을 블록 시작으로 본다.
  const headerIdx = [];
  rows.forEach((cells, i) => {
    const nonEmpty = cells.filter(Boolean);
    if (nonEmpty.length === 0) return;
    const looksCity = nonEmpty.some((c) => /[시군구]$/.test(c));
    const looksDong = nonEmpty.every((c) => /[동읍면가]$/.test(c));
    if (looksCity && !looksDong) headerIdx.push(i);
  });

  headerIdx.forEach((hi, k) => {
    const end = headerIdx[k + 1] ?? rows.length;
    const header = rows[hi];
    header.forEach((city, col) => {
      if (!city) return;
      const dongs = [];
      for (let r = hi + 1; r < end; r++) {
        const v = rows[r]?.[col];
        if (v) dongs.push(v);
      }
      push({
        id: toId("경기", city),
        province: "경기",
        cityQuery: city,
        name: displayName(city),
        dongs: [...new Set(dongs)],
      });
    });
  });
}

/* ── 2) ahreumschool.csv → 광주광역시 구 + 학교 ────────────────────────── */
{
  const rows = parseCsv(readFileSync(join(FILES, "ahreumschool.csv"), "utf8"));
  // 1행: [광주광역시, 동구, 서구, 남구, 북구, 광산구]. 1번째 칸은 시도명, 2번째 칸부터 구.
  const header = rows[0];
  const guByCol = {}; // col → 구 이름
  header.forEach((v, col) => {
    if (col === 0 || !v) return;
    guByCol[col] = v;
  });
  const sectionLabels = new Set(["초등학교", "중학교", "고등학교"]);
  const schoolsByCol = {};
  for (let r = 1; r < rows.length; r++) {
    rows[r].forEach((v, col) => {
      if (!guByCol[col] || !v || sectionLabels.has(v)) return;
      (schoolsByCol[col] ??= []).push(v);
    });
  }
  Object.entries(guByCol).forEach(([col, gu]) => {
    push({
      id: toId("광주", gu),
      province: "광주",
      cityQuery: gu,
      name: gu,
      schools: [...new Set(schoolsByCol[col] ?? [])],
    });
  });
}

/* ── 3) 특별/광역시·세종 자치구·군 (안정적 행정구역) ───────────────────── */
const METRO = {
  서울: ["종로구","중구","용산구","성동구","광진구","동대문구","중랑구","성북구","강북구","도봉구","노원구","은평구","서대문구","마포구","양천구","강서구","구로구","금천구","영등포구","동작구","관악구","서초구","강남구","송파구","강동구"],
  부산: ["중구","서구","동구","영도구","부산진구","동래구","남구","북구","해운대구","사하구","금정구","강서구","연제구","수영구","사상구","기장군"],
  대구: ["중구","동구","서구","남구","북구","수성구","달서구","달성군","군위군"],
  인천: ["중구","동구","미추홀구","연수구","남동구","부평구","계양구","서구","강화군","옹진군"],
  대전: ["동구","중구","서구","유성구","대덕구"],
  울산: ["중구","남구","동구","북구","울주군"],
  세종: ["세종시"],
};
for (const [province, cities] of Object.entries(METRO)) {
  for (const city of cities) {
    push({
      id: toId(province, city),
      province,
      cityQuery: city,
      name: displayName(city),
    });
  }
}

/* ── 출력 ─────────────────────────────────────────────────────────────── */
const body = regions
  .map((r) => {
    const parts = [
      `id: ${JSON.stringify(r.id)}`,
      `province: ${JSON.stringify(r.province)}`,
      `cityQuery: ${JSON.stringify(r.cityQuery)}`,
      `name: ${JSON.stringify(r.name)}`,
    ];
    if (r.dongs?.length) parts.push(`dongs: ${JSON.stringify(r.dongs)}`);
    if (r.schools?.length) parts.push(`schools: ${JSON.stringify(r.schools)}`);
    return `  { ${parts.join(", ")} },`;
  })
  .join("\n");

const out = `/**
 * pSEO 지역 데이터 단일 소스 (자동 생성 — 직접 수정 금지).
 *
 * 생성기: scripts/build-regions.mjs  (재생성: node scripts/build-regions.mjs)
 * 출처: public/files/ahreumworld.csv(경기 동), ahreumschool.csv(광주 학교) + 광역시 자치구 상수.
 *
 * 지역(시/군/구) 한 곳당 동적 랜딩페이지 1개(/[id])가 SSG 로 생성된다.
 * 지역을 추가하려면 CSV/생성기 상수를 늘린 뒤 생성기를 다시 실행한다.
 */

export interface Region {
  /** URL 슬러그(한글). 예: "서울-송파구", "경기-수원시-영통구" */
  id: string;
  /** 광역 시/도 표시명. 예: "서울", "경기", "광주" */
  province: string;
  /** 검색 키워드용 공식 시/군/구명. 예: "송파구", "수원시 영통구" */
  cityQuery: string;
  /** 카피·타이틀용 표시명(짧게). 예: "송파구", "수원 영통구", "평택" */
  name: string;
  /** 대표 동/읍/면(롱테일 키워드용, 있을 때만) */
  dongs?: string[];
  /** 대표 학교(내신/기출 키워드용, 있을 때만) */
  schools?: string[];
}

export const regions: Region[] = [
${body}
];

/** id 로 지역 1건 조회(없으면 undefined). */
export function getRegionById(id: string): Region | undefined {
  return regions.find((r) => r.id === id);
}
`;

mkdirSync(join(ROOT, "src", "data"), { recursive: true });
writeFileSync(join(ROOT, "src", "data", "regions.ts"), out, "utf8");
console.log(
  `regions.ts 생성 완료 — ${regions.length}개 지역` +
    ` (경기 ${regions.filter((r) => r.province === "경기").length}, ` +
    `광주 ${regions.filter((r) => r.province === "광주").length}, ` +
    `그 외 광역시 ${regions.filter((r) => !["경기", "광주"].includes(r.province)).length})`,
);
