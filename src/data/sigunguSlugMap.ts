/**
 * 시군구 slug 매핑 — 지역(sidoRegions) 시군구 slug → 학교(schools) 시군구 slug.
 *
 * 배경: schools.ts 와 sidoRegions.ts 가 독립 생성되어 시군구 slug 가 불일치한다
 *   (지역 "가평군/gapyeonggun" vs 학교 "가평/gapyeong", 지역 "수원시 권선구" 4구 vs 학교 "수원" 1개 등).
 *   역인덱스(schoolRegionIndex)가 직접 일치에 실패할 때 이 표를 경유해 학교 풀을 찾는다.
 *
 * 원칙:
 *  - **원본(schools.ts·sidoRegions.ts)은 절대 수정하지 않는다.** 이 표만 순수 추가.
 *  - **키는 반드시 sidoSlug 로 스코프**한다 → 시도 간 동명 시군구(경기 광주↔광주광역시, 강원/경남 고성 등) 오연결 방지.
 *  - slug 가 이미 일치하는 시군구는 넣지 않는다(미스만 기록하는 최소 표).
 *  - name 대조로 후보를 만들되 전 항목을 스크립트로 검증(cityBase(지역)===norm(학교), 같은 시도, 학교 slug 실재) — 50/50 통과.
 *  - **확신할 수 없는 항목은 매핑하지 않는다.** 미매핑(블록 미노출)이 오매핑(다른 지역 학교 노출)보다 낫다.
 *    미매핑 C형: 경기 광주시(학교측 "광주" 시군구 없음), 경남 마산합포구·마산회원구(학교측 "마산" 없음 — 창원 흡수).
 *
 * 유형: A형(접미사 차이, 1:1) / B형(구 분할 다대일 — 수원 4구→수원 등). B형은 여러 구가 한 학교 풀을 공유하므로
 *   RegionSchoolLinks 에서 구 slug 해시로 시작 오프셋을 분산한다(isSharedRegionSlug 로 판별).
 */
export const SIGUNGU_SLUG_MAP: Record<string, Record<string, string>> = {
  gyeonggi: {
    // A형 — 접미사(군/시) 차이, 1:1
    gapyeonggun: "gapyeong",
    gwacheonsi: "gwacheon",
    gwangmyeongsi: "gwangmyeong",
    gurisi: "guri",
    gimposi: "gimpo",
    namyangjusi: "namyangju",
    dongducheonsi: "dongducheon",
    siheungsi: "siheung",
    anseongsi: "anseong",
    yangjusi: "yangju",
    yangpyeonggun: "yangpyeong",
    yeojusi: "yeoju",
    yeoncheongun: "yeoncheon",
    osansi: "osan",
    uiwangsi: "uiwang",
    uijeongbusi: "uijeongbu",
    icheonsi: "icheon",
    pajusi: "paju",
    pyeongtaeksi: "pyeongtaek",
    pocheonsi: "pocheon",
    hanamsi: "hanam",
    // B형 — 구 분할(다대일)
    goyangsideogyanggu: "goyang",
    goyangsiilsandonggu: "goyang",
    goyangsiilsanseogu: "goyang",
    bucheonsisosagu: "bucheon",
    bucheonsiojeonggu: "bucheon",
    bucheonsiwonmigu: "bucheon",
    seongnamsibundanggu: "seongnam",
    seongnamsisujeonggu: "seongnam",
    seongnamsijungwongu: "seongnam",
    suwonsigwonseongu: "suwon",
    suwonsiyeongtonggu: "suwon",
    suwonsijangangu: "suwon",
    suwonsipaldalgu: "suwon",
    ansansidanwongu: "ansan",
    ansansisangrokgu: "ansan",
    anyangsidongangu: "anyang",
    anyangsimanangu: "anyang",
    yonginsigiheunggu: "yongin",
    yonginsisujigu: "yongin",
    yonginsicheoingu: "yongin",
    hwaseongsidongtangu: "hwaseong",
    hwaseongsimansegu: "hwaseong",
    hwaseongsibyeongjeomgu: "hwaseong",
    hwaseongsihyohaenggu: "hwaseong",
  },
  gyeongnam: {
    // B형 — 창원 3구 → 창원
    changwonsiseongsangu: "changwonsi",
    changwonsiuichanggu: "changwonsi",
    changwonsijinhaegu: "changwonsi",
  },
  gyeongbuk: {
    // B형 — 포항 2구 → 포항
    pohangsinamgu: "pohangsi",
    pohangsibukgu: "pohangsi",
  },
};

/** 지역 시군구 slug → 학교 시군구 slug(같은 시도). 매핑 없으면 undefined. */
export function resolveSchoolSigunguSlug(
  sidoSlug: string,
  regionSigunguSlug: string,
): string | undefined {
  return SIGUNGU_SLUG_MAP[sidoSlug]?.[regionSigunguSlug];
}

/**
 * B형(다대일) 공유 풀에 속한 지역 시군구 slug 집합(시도별) — 모듈 1회 계산.
 * 같은 학교 시군구를 2개 이상 지역이 가리키면, 그 지역들은 목록이 겹치지 않도록 오프셋 분산이 필요하다.
 */
const SHARED_REGION_SLUGS: Record<string, Set<string>> = {};
for (const [sido, m] of Object.entries(SIGUNGU_SLUG_MAP)) {
  const targetCount = new Map<string, number>();
  for (const school of Object.values(m)) targetCount.set(school, (targetCount.get(school) ?? 0) + 1);
  const shared = new Set<string>();
  for (const [region, school] of Object.entries(m)) {
    if ((targetCount.get(school) ?? 0) >= 2) shared.add(region);
  }
  SHARED_REGION_SLUGS[sido] = shared;
}

/** 이 지역 시군구가 B형 공유 풀(구 분할)에 속하는가 — 오프셋 분산 대상 판별. */
export function isSharedRegionSlug(sidoSlug: string, regionSigunguSlug: string): boolean {
  return SHARED_REGION_SLUGS[sidoSlug]?.has(regionSigunguSlug) ?? false;
}
