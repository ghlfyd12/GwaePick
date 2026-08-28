/**
 * /power/[region] 렌더 유효성 검증(신규) — garbage·예약경로 차단, 실동 롱테일 보존.
 *
 * 관대한 렌더(dynamicParams)가 롱테일 지역(신림동·역삼동 등 963 미등재 실동) 대응 설계이므로,
 * "알 수 없는 slug = 무조건 404"는 롱테일을 죽인다. 대신 전국 실제 행정구역(sidoRegions)을
 * 읽어 실동/시군구만 통과시키고, 임의 문자열·예약 세그먼트(by-region 등)는 404 처리한다.
 *
 * 읽기 전용: sidoRegions.ts 는 수정하지 않는다(이 파일에서 참조만).
 */
import { REGIONS } from "@/data/sidoRegions";
import { isKnownPowerRegion } from "@/data/byRegionSubject";
import { isExpansionRegionSlug } from "@/data/powerRegionsExpansion";
import { resolvePowerRegionName } from "@/data/powerRegions";

/** 비교용 정규화 — 공백·하이픈 제거 + 소문자(한글은 소문자 영향 없음). */
function normalize(s: string): string {
  return s.replace(/[\s-]/g, "").toLowerCase();
}

const slugKey = (raw: string): string => {
  try {
    return decodeURIComponent(raw).normalize("NFC").trim();
  } catch {
    return raw.normalize("NFC").trim();
  }
};

/**
 * 예약 세그먼트 — /power 하위에 자체 라우트가 있거나 구조상 [region] 과 충돌 가능한 값.
 * sidoRegions 부재로 자동 차단되지만, 이중 안전으로 명시 차단한다.
 */
const RESERVED_SEGMENTS: ReadonlySet<string> = new Set([
  "by-region",
  "performance",
  "schools",
  "regions",
  "english",
  "japanese",
  "chinese",
  "teachers",
  "consult",
  "exams",
  "reviews",
  "cases",
]);

/** 전국 실제 시군구·동의 이름·slug(정규화) 집합 — 모듈 1회 계산. */
const REAL_REGION_SET: ReadonlySet<string> = (() => {
  const set = new Set<string>();
  for (const sido of REGIONS) {
    for (const sg of sido.sigungu) {
      set.add(normalize(sg.name));
      set.add(normalize(sg.slug));
      for (const d of sg.dong) {
        set.add(normalize(d.name));
        set.add(normalize(d.slug));
      }
    }
  }
  return set;
})();

/** sidoRegions 기준 실제 시군구/동인가(이름 또는 slug 일치). */
function isRealDong(param: string): boolean {
  const decoded = slugKey(param);
  if (REAL_REGION_SET.has(normalize(decoded))) return true;
  // 로마자 별칭(sillim 등)·기타 해석 경로 반영 — 해석된 표시명이 실제 동이면 통과.
  const resolved = resolvePowerRegionName(param);
  return REAL_REGION_SET.has(normalize(resolved));
}

/**
 * /power/[region] 렌더 대상인가.
 *  - 예약 세그먼트 → 무조건 false(404).
 *  - 알려진 파워 지역·확장 허브·실제 시군구/동(롱테일) → true.
 *  - 그 외 임의 문자열(garbage) → false(404).
 */
export function isValidPowerRegion(param: string): boolean {
  const decoded = slugKey(param);
  if (RESERVED_SEGMENTS.has(normalize(decoded))) return false;
  if (isKnownPowerRegion(param) || isExpansionRegionSlug(param)) return true;
  return isRealDong(param);
}
