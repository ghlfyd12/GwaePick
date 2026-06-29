/**
 * 파워 홈페이지 지역별 영어회화 페이지(/power/[region]) 의 지역 슬러그/표시명 파생 소스.
 *
 * regions.ts(시/군/구 + 경기 동 목록) 를 가공해 다음 두 가지를 제공한다.
 *  - powerRegionSlugs : SSG·sitemap 에 등록할 정적 지역 슬러그 목록(한글, 중복 제거)
 *  - resolvePowerRegionName : URL 파라미터(한글/로마자/시군구 id) → 화면에 쓸 "지역명"
 *
 * 데이터에 없는 임의 지역(예: 신림동, 역삼동)도 동적으로 렌더해야 하므로,
 * 매칭에 실패하면 디코드한 파라미터 자체를 지역명으로 사용한다(날조 없이 입력 그대로).
 */
import { regions } from "@/data/regions";

/** 비교용 정규화 — 공백·하이픈 제거 + 소문자. (한글은 소문자 영향 없음) */
function normalize(s: string): string {
  return s.replace(/[\s-]/g, "").toLowerCase();
}

/**
 * 자주 검색되는 로마자 표기 → 한글 동명 별칭.
 * 데이터에 없는 서울 주요 동의 로마자 유입(예: sillim, yeoksam)을 한글 표기로 보정한다.
 * 필요 시 여기만 늘리면 된다(추정 데이터를 본문 수치로 쓰지 않으므로 안전).
 */
const ROMAJI_ALIASES: Record<string, string> = {
  sillim: "신림동",
  sinlim: "신림동",
  yeoksam: "역삼동",
  daechi: "대치동",
  mok: "목동",
  mokdong: "목동",
  jamsil: "잠실동",
  bundang: "분당",
  ilsan: "일산",
};

/**
 * 정적으로 생성할 지역 슬러그 목록(한글).
 *  - 경기: 시/군/구마다 동(dong) 단위로 — 롱테일 키워드(예: 영통동)
 *  - 그 외 시/도: 자치구명 단위로 — 동 데이터가 없으므로 구 단위(예: 강남구)
 * 동명이 여러 구에 중복되면 한 번만 등록한다.
 */
export const powerRegionSlugs: string[] = (() => {
  const set = new Set<string>();
  for (const r of regions) {
    if (r.dongs && r.dongs.length > 0) {
      for (const dong of r.dongs) set.add(dong);
    } else {
      set.add(r.name);
    }
  }
  return [...set];
})();

/** 정규화 슬러그 → 표준 표시명 매핑(파라미터 해석용). */
const NAME_BY_NORM: Map<string, string> = (() => {
  const map = new Map<string, string>();
  const add = (key: string, display: string) => {
    const n = normalize(key);
    if (n && !map.has(n)) map.set(n, display);
  };
  for (const r of regions) {
    // 시/군/구 식별자·검색명·표시명 모두 같은 표시명으로 귀결
    add(r.id, r.name);
    add(r.cityQuery, r.name);
    add(r.name, r.name);
    if (r.dongs) for (const dong of r.dongs) add(dong, dong);
  }
  return map;
})();

/**
 * URL 파라미터를 화면용 "지역명"으로 해석한다.
 *  1) 로마자 별칭 → 한글
 *  2) 알려진 지역(동/구/시군구 id) → 표준 표시명
 *  3) 그 외 → 디코드한 입력 그대로(임의 동명도 그대로 노출)
 */
export function resolvePowerRegionName(rawParam: string): string {
  let decoded = rawParam;
  try {
    decoded = decodeURIComponent(rawParam);
  } catch {
    // 잘못된 인코딩이면 원본 사용
  }
  decoded = decoded.trim();
  const norm = normalize(decoded);

  const romaji = ROMAJI_ALIASES[norm];
  if (romaji) return romaji;

  const known = NAME_BY_NORM.get(norm);
  if (known) return known;

  return decoded;
}
