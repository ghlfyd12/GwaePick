/*
 * gyeonggi-regions.json 생성기 (경기 시/군/구 + 동 데이터).
 *
 * 입력: public/files/ahreumworld.csv (경기 시군구 컬럼 + 동 목록, 2개 표 블록)
 * 출력: src/data/gyeonggi-regions.json
 *   { sido, sidoLabel, sigungu:[ { name, slug, dongs:[ { name, slug } ] } ] }
 *   - 시군구 slug = name 의 공백 → '-' (예 "수원시 장안구" → "수원시-장안구")
 *   - 동 slug = 한글명 그대로
 *
 * 실행: node scripts/build-gyeonggi.mjs
 * ⚠️ 지역명은 실제 행정구역이어야 한다. 더 완전한 동 데이터가 있으면 같은 구조의 JSON 으로 교체하면 된다.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const text = readFileSync(join(ROOT, "public", "files", "ahreumworld.csv"), "utf8").replace(/\r/g, "");
const rows = text.split("\n").map((l) => l.split(",").map((c) => c.trim()));

// 헤더(시군구) 행 탐지: 비어있지 않은 셀이 시/군/구로 끝나고 동/읍/면/가 로만 이뤄지지 않은 행
const headerIdx = [];
rows.forEach((cells, i) => {
  const ne = cells.filter(Boolean);
  if (!ne.length) return;
  const looksCity = ne.some((c) => /[시군구]$/.test(c));
  const looksDong = ne.every((c) => /[동읍면가]$/.test(c));
  if (looksCity && !looksDong) headerIdx.push(i);
});

const sigungu = [];
headerIdx.forEach((hi, k) => {
  const end = headerIdx[k + 1] ?? rows.length;
  rows[hi].forEach((name, col) => {
    if (!name) return;
    const seen = new Set();
    const dongs = [];
    for (let r = hi + 1; r < end; r++) {
      const v = rows[r]?.[col];
      if (v && !seen.has(v)) {
        seen.add(v);
        dongs.push({ name: v, slug: v });
      }
    }
    sigungu.push({ name, slug: name.replace(/\s+/g, "-"), dongs });
  });
});

const out = { sido: "gyeonggi", sidoLabel: "경기", sigungu };
const totalDongs = sigungu.reduce((n, s) => n + s.dongs.length, 0);
writeFileSync(
  join(ROOT, "src", "data", "gyeonggi-regions.json"),
  JSON.stringify(out, null, 2),
  "utf8",
);
console.log(`gyeonggi-regions.json 생성 — 시군구 ${sigungu.length}, 동 ${totalDongs}`);
