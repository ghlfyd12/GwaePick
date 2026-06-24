/*
 * 17개 시/도 시군구 경계 GeoJSON 생성기.
 *
 * 원본: southkorea/southkorea-maps (KOSTAT 2018 시군구) — 공개 GeoJSON.
 *   https://raw.githubusercontent.com/southkorea/southkorea-maps/master/kostat/2018/json/skorea-municipalities-2018-geo.json
 *   라이선스: 원 저장소 표기(데이터 출처: 통계청). 비상업/공개 사용.
 * 처리: code 접두 2자리로 시/도 분리 → sidoRegions.ts 시군구 slug 매칭 → properties{slug,label,name_full}
 *   보강 → mapshaper 단순화 → public/geo/sigungu/{sido}.json (17개).
 *
 * 실행: node scripts/build-sigungu-geo.mjs
 * ⚠️ 경계 데이터는 원본에서만. 임의 생성 금지. 매칭 실패 시군구는 콘솔에 목록 출력.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import mapshaper from "mapshaper";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC_URL =
  "https://raw.githubusercontent.com/southkorea/southkorea-maps/master/kostat/2018/json/skorea-municipalities-2018-geo.json";
const SRC_LOCAL = join(ROOT, ".geo-tmp", "municipalities.json");
const OUT_DIR = join(ROOT, "public", "geo", "sigungu");

// code 접두(2자리) → 시/도 slug (sidoRegions.ts 의 영문 slug)
const PREFIX = {
  "11": "seoul", "21": "busan", "22": "daegu", "23": "incheon",
  "24": "gwangju", "25": "daejeon", "26": "ulsan", "29": "sejong",
  "31": "gyeonggi", "32": "gangwon", "33": "chungbuk", "34": "chungnam",
  "35": "jeonbuk", "36": "jeonnam", "37": "gyeongbuk", "38": "gyeongnam",
  "39": "jeju",
};

// 원본 명칭이 우리 데이터와 다른 케이스(정규화 이름 기준 별칭). 2018 원본 → 현재명.
const ALIAS = { 미추홀구: "남구" }; // 인천 남구 → 2018 미추홀구 개칭

const norm = (s) => s.replace(/\s+/g, "");

async function loadSource() {
  if (existsSync(SRC_LOCAL)) return JSON.parse(readFileSync(SRC_LOCAL, "utf8"));
  console.log("원본 다운로드:", SRC_URL);
  const res = await fetch(SRC_URL);
  if (!res.ok) throw new Error(`다운로드 실패 HTTP ${res.status} — 도메인 차단 여부 확인 필요`);
  const text = await res.text();
  mkdirSync(dirname(SRC_LOCAL), { recursive: true });
  writeFileSync(SRC_LOCAL, text);
  return JSON.parse(text);
}

// sidoRegions.ts 파싱(데이터 변경 없이 읽기만)
function parseSidoRegions() {
  const src = readFileSync(join(ROOT, "src", "data", "sidoRegions.ts"), "utf8");
  const result = {};
  for (const slug of Object.values(PREFIX)) {
    const i = src.search(new RegExp(`slug: "${slug}", sigungu:`));
    const rest = src.slice(i);
    const n = rest.slice(20).search(/\n {2}\{ label: "[^"]+", slug: "[a-z]+", sigungu:/);
    const block = rest.slice(0, n < 0 ? rest.length : n + 20);
    result[slug] = [...block.matchAll(/\{ name: "([^"]+)", slug: "([^"]+)", dong:/g)].map(
      (m) => ({ name: m[1], slug: m[2] }),
    );
  }
  return result;
}

function shortLabel(ourName, kind) {
  if (kind === "city") {
    const m = ourName.match(/^(.+시)\s/);
    return m ? m[1] : ourName;
  }
  const m = ourName.match(/^.+시\s+(.+구)$/); // "고양시 덕양구" → "덕양구"
  return m ? m[1] : ourName;
}

async function main() {
  const geo = await loadSource();
  const ours = parseSidoRegions();

  // 시/도별 원본 feature 그룹
  const featsBySido = {};
  for (const f of geo.features) {
    const s = PREFIX[String(f.properties.code).slice(0, 2)];
    if (!s) continue;
    (featsBySido[s] ??= []).push(f);
  }

  const report = { matched: 0, cityMerged: [], failed: [], crossSido: [] };
  const stamped = {}; // sido -> feature[] (with our props)

  for (const sido of Object.values(PREFIX)) {
    const avail = [...(featsBySido[sido] ?? [])];
    const origNames = new Set(avail.map((f) => norm(f.properties.name)));
    const list = ours[sido] ?? [];
    const out = [];

    // pass1: 정확 매칭(소비)
    const pending = [];
    for (const o of list) {
      const n = norm(o.name);
      const idx = avail.findIndex((f) => norm(f.properties.name) === n);
      if (idx >= 0) {
        const f = avail.splice(idx, 1)[0];
        out.push(stamp(f, o, shortLabel(o.name, "gu")));
      } else pending.push(o);
    }
    // pass2: 별칭 → endsWith → startsWith → 시(상위) 병합
    for (const o of pending) {
      const n = norm(o.name);
      let idx = -1;
      const alias = ALIAS[n];
      if (alias) idx = avail.findIndex((f) => norm(f.properties.name) === alias);
      if (idx < 0) idx = avail.findIndex((f) => n.length >= 2 && norm(f.properties.name).endsWith(n));
      if (idx < 0) idx = avail.findIndex((f) => n.length >= 2 && norm(f.properties.name).startsWith(n));
      if (idx >= 0) {
        const f = avail.splice(idx, 1)[0];
        out.push(stamp(f, o, shortLabel(o.name, "gu")));
        continue;
      }
      // 시(상위) 병합: "A시 B구" → 원본 "A시"
      const cm = o.name.match(/^(.+시)\s+.+구$/);
      if (cm) {
        const cityNorm = norm(cm[1]);
        const cidx = avail.findIndex((f) => norm(f.properties.name) === cityNorm);
        if (cidx >= 0) {
          const f = avail.splice(cidx, 1)[0];
          out.push(stamp(f, o, shortLabel(o.name, "city")));
          continue;
        }
        if (origNames.has(cityNorm)) {
          // 같은 시의 다른 구가 이미 그 폴리곤을 차지 → 지도엔 시 단위로 표시(병합), 동 브라우저로 접근
          report.cityMerged.push(`${sido}/${o.name}`);
          continue;
        }
      }
      report.failed.push({ sido, name: o.name, slug: o.slug });
    }
    stamped[sido] = out;
  }

  // 크로스-시도 보정: 실패분을 다른 시/도 원본에서 끌어옴(예: 군위군 — 2018 경북)
  for (const fail of [...report.failed]) {
    const n = norm(fail.name);
    let pulled = null;
    for (const sido of Object.values(PREFIX)) {
      const arr = featsBySido[sido] ?? [];
      const idx = arr.findIndex((f) => norm(f.properties.name) === n);
      if (idx >= 0) {
        pulled = arr.splice(idx, 1)[0];
        report.crossSido.push(`${fail.name}: ${sido} 원본 → ${fail.sido}`);
        break;
      }
    }
    if (pulled) {
      stamped[fail.sido].push(stamp(pulled, fail, shortLabel(fail.name, "gu")));
      report.failed = report.failed.filter((x) => x !== fail);
    }
  }

  // mapshaper 단순화 + 저장
  mkdirSync(OUT_DIR, { recursive: true });
  for (const sido of Object.values(PREFIX)) {
    const fc = { type: "FeatureCollection", features: stamped[sido] };
    report.matched += stamped[sido].length;
    const cmd =
      "-i in.json -simplify 6% keep-shapes -clean -o out.json format=geojson precision=0.0001";
    const result = await mapshaper.applyCommands(cmd, { "in.json": JSON.stringify(fc) });
    writeFileSync(join(OUT_DIR, `${sido}.json`), result["out.json"]);
  }

  // 리포트
  console.log("\n=== 매칭 리포트 ===");
  console.log("polygon 생성(슬러그 부여):", report.matched);
  console.log("시 단위 병합(city-merged):", report.cityMerged.length, report.cityMerged.join(", ") || "");
  console.log("크로스-시도 보정:", report.crossSido.join(" | ") || "없음");
  console.log("매칭 실패 시군구:", report.failed.length, report.failed.map((f) => `${f.sido}/${f.name}`).join(", ") || "0건");

  function stamp(f, o, label) {
    return {
      type: "Feature",
      properties: { slug: o.slug, label, name_full: o.name },
      geometry: f.geometry,
    };
  }
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
