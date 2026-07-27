/*
 * NEIS 「학교기본정보」 → Supabase schools 캐시 동기화.
 *
 * 실행: npm run sync:neis   (또는 node scripts/sync-neis.mjs)
 * 환경변수(.env.local 자가 로딩): NEIS_API_KEY / NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY
 *
 * 동작:
 *   17개 시도교육청 코드를 순회하며 페이지네이션(pSize=1000)으로 전량 수집 →
 *   초·중·고만 필터 → school_code(=SD_SCHUL_CODE) 기준 upsert.
 *   API 호출 사이에 200ms 대기(레이트리밋 예방).
 *
 * ⚠️ sigungu_code 주의:
 *   NEIS 응답에는 시군구 코드가 없다(도로명주소 문자열만 존재). 스키마의 sigungu_code 는
 *   VARCHAR(10) 이므로 "시도교육청코드 + 시군구명 해시 6자리"(예: B10a1b2c3, 9자)로 생성한다.
 *   이름에서 결정적으로 파생되므로 재실행해도 값이 바뀌지 않는다(신청 데이터의 참조 안정성).
 *   사람이 읽을 이름은 같은 행의 sigungu_name 에 함께 저장된다.
 *
 * 키 값은 절대 출력하지 않는다.
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

/* ── .env.local 자가 로딩(node 는 .env 를 자동 로드하지 않음) ─────────── */
function loadEnvLocal() {
  try {
    const raw = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
      if (!m) continue;
      const key = m[1];
      const value = m[2].trim().replace(/^"(.*)"$/, "$1");
      if (process.env[key] === undefined) process.env[key] = value;
    }
  } catch {
    /* .env.local 이 없으면 실제 환경변수 사용 */
  }
}
loadEnvLocal();

const NEIS_API_KEY = process.env.NEIS_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const missing = [
  ["NEIS_API_KEY", NEIS_API_KEY],
  ["NEXT_PUBLIC_SUPABASE_URL", SUPABASE_URL],
  ["SUPABASE_SERVICE_ROLE_KEY", SERVICE_ROLE_KEY],
].filter(([, v]) => !v).map(([k]) => k);
if (missing.length) {
  console.error(`환경변수 누락: ${missing.join(", ")} — .env.local 을 확인하세요.`);
  process.exit(1);
}

/** 시도교육청 코드 → 시도명(진행 로그용). NEIS ATPT_OFCDC_SC_CODE 체계. */
const OFFICES = [
  ["B10", "서울"], ["C10", "부산"], ["D10", "대구"], ["E10", "인천"],
  ["F10", "광주"], ["G10", "대전"], ["H10", "울산"], ["I10", "세종"],
  ["J10", "경기"], ["K10", "강원"], ["M10", "충북"], ["N10", "충남"],
  ["P10", "전북"], ["Q10", "전남"], ["R10", "경북"], ["S10", "경남"],
  ["T10", "제주"],
];

/** 초·중·고만 캐시한다(유치원·특수학교·각종학교 제외). */
const LEVEL_BY_KIND = {
  초등학교: "초",
  중학교: "중",
  고등학교: "고",
};

const PAGE_SIZE = 1000;
const DELAY_MS = 200;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** FNV-1a 32bit — 시군구명 → 안정적인 6자리 hex. */
function hash6(s) {
  let h = 0x811c9dc5;
  for (const ch of s) {
    h ^= ch.codePointAt(0);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, "0").slice(0, 6);
}

/**
 * 도로명주소 → 시군구명.
 *   "서울특별시 송파구 송이로 42"      → "송파구"
 *   "경기도 성남시 분당구 …"           → "성남시 분당구"  (시 + 구 2토큰)
 *   "세종특별자치시 조치원읍 …"        → "세종특별자치시" (시군구 단위 없음)
 * 주소가 비었거나 형태가 다르면 시도명으로 대체한다(NOT NULL 컬럼 보호).
 */
function parseSigungu(roadAddress, sidoName) {
  const tokens = String(roadAddress ?? "").trim().split(/\s+/).filter(Boolean);
  if (tokens.length >= 3 && /시$/.test(tokens[1]) && /구$/.test(tokens[2])) {
    return `${tokens[1]} ${tokens[2]}`;
  }
  if (tokens.length >= 2 && /[시군구]$/.test(tokens[1])) return tokens[1];
  return sidoName;
}

/** NEIS 한 페이지 조회. 데이터 끝(INFO-200)이면 null 을 돌려준다. */
async function fetchPage(officeCode, pIndex) {
  const url =
    "https://open.neis.go.kr/hub/schoolInfo" +
    `?KEY=${encodeURIComponent(NEIS_API_KEY)}` +
    `&Type=json&pIndex=${pIndex}&pSize=${PAGE_SIZE}` +
    `&ATPT_OFCDC_SC_CODE=${officeCode}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();

  // 데이터가 없을 때는 schoolInfo 대신 RESULT 만 온다.
  if (!json.schoolInfo) {
    const code = json.RESULT?.CODE ?? "UNKNOWN";
    if (code === "INFO-200") return null; // 마지막 페이지 다음 — 정상 종료
    throw new Error(`NEIS ${code}: ${json.RESULT?.MESSAGE ?? ""}`);
  }
  const head = json.schoolInfo[0]?.head ?? [];
  const resultCode = head[1]?.RESULT?.CODE;
  if (resultCode && resultCode !== "INFO-000") {
    throw new Error(`NEIS ${resultCode}`);
  }
  return {
    total: head[0]?.list_total_count ?? 0,
    rows: json.schoolInfo[1]?.row ?? [],
  };
}

/** NEIS row → schools 레코드(초·중·고가 아니면 null). */
function toSchoolRecord(row) {
  const level = LEVEL_BY_KIND[row.SCHUL_KND_SC_NM];
  if (!level) return null;

  const sidoCode = row.ATPT_OFCDC_SC_CODE;
  const sidoName = row.LCTN_SC_NM || row.ATPT_OFCDC_SC_NM || "";
  const sigunguName = parseSigungu(row.ORG_RDNMA, sidoName);

  return {
    school_code: row.SD_SCHUL_CODE,
    school_name: row.SCHUL_NM,
    school_level: level,
    sido_code: sidoCode,
    sido_name: sidoName,
    sigungu_code: `${sidoCode}${hash6(sigunguName)}`,
    sigungu_name: sigunguName,
    updated_at: new Date().toISOString(),
  };
}

async function main() {
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const before = await supabase
    .from("schools")
    .select("school_code", { count: "exact", head: true });
  if (before.error) {
    console.error("schools 테이블 조회 실패 —", before.error.message);
    process.exit(1);
  }
  console.log(`시작 — 현재 schools 건수: ${before.count ?? 0}\n`);

  /** school_code 중복 제거용(같은 학교가 여러 교육청에 잡히는 경우 방지). */
  const collected = new Map();
  /** sigungu_code → sigungu_name — 해시 충돌 감지용. */
  const codeToName = new Map();
  const failures = [];
  let skipped = 0;

  for (const [officeCode, officeLabel] of OFFICES) {
    let pIndex = 1;
    let officeCount = 0;

    for (;;) {
      let page;
      try {
        page = await fetchPage(officeCode, pIndex);
      } catch (err) {
        failures.push(`${officeLabel}(${officeCode}) p${pIndex}: ${err.message}`);
        console.error(`  실패 — ${officeLabel} 페이지 ${pIndex}: ${err.message}`);
        break;
      }
      if (!page || page.rows.length === 0) break;

      for (const row of page.rows) {
        const rec = toSchoolRecord(row);
        if (!rec) {
          skipped += 1;
          continue;
        }
        const prev = codeToName.get(rec.sigungu_code);
        if (prev && prev !== rec.sigungu_name) {
          failures.push(
            `시군구 해시 충돌: ${rec.sigungu_code} ← "${prev}" / "${rec.sigungu_name}"`,
          );
        }
        codeToName.set(rec.sigungu_code, rec.sigungu_name);
        collected.set(rec.school_code, rec);
        officeCount += 1;
      }

      const done = pIndex * PAGE_SIZE >= page.total;
      if (done) break;
      pIndex += 1;
      await sleep(DELAY_MS);
    }

    console.log(`${officeLabel}(${officeCode}) — 초·중·고 ${officeCount}건`);
    await sleep(DELAY_MS);
  }

  const records = [...collected.values()];
  console.log(
    `\n수집 완료 — 초·중·고 ${records.length}건 / 제외(유치원·특수학교 등) ${skipped}건`,
  );
  if (records.length === 0) {
    console.error("수집된 학교가 없습니다 — upsert 를 건너뜁니다.");
    process.exit(1);
  }

  // upsert (school_code 기준). 요청 크기 제한을 고려해 500건씩 나눈다.
  const CHUNK = 500;
  let upserted = 0;
  for (let i = 0; i < records.length; i += CHUNK) {
    const chunk = records.slice(i, i + CHUNK);
    const { error } = await supabase
      .from("schools")
      .upsert(chunk, { onConflict: "school_code" });
    if (error) {
      failures.push(`upsert ${i}~${i + chunk.length}: ${error.message}`);
      console.error(`  upsert 실패 ${i}~${i + chunk.length}: ${error.message}`);
      continue;
    }
    upserted += chunk.length;
    process.stdout.write(`\r  upsert ${upserted}/${records.length}`);
  }
  console.log();

  const after = await supabase
    .from("schools")
    .select("school_code", { count: "exact", head: true });

  console.log("\n=== 결과 ===");
  console.log(`upsert 전송: ${upserted}건`);
  console.log(`schools 테이블: ${before.count ?? 0} → ${after.count ?? "?"}건`);
  console.log(`시군구 종류: ${codeToName.size}개`);
  if (failures.length) {
    console.log(`\n실패 ${failures.length}건:`);
    for (const f of failures) console.log(`  - ${f}`);
    process.exit(1);
  }
  console.log("실패 없음.");
}

main().catch((err) => {
  console.error("\n[sync-neis] 중단:", err?.message ?? err);
  process.exit(1);
});
