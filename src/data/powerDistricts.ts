/**
 * /power 신도시·택지지구·생활권 지명 — by-region 평면 slug 체계에 additive 편입(단일 소스).
 *
 * 행정구역(시도·시군구·동)으로 커버되지 않는 생활권 지명(판교·위례·마곡 등)의 검색 수요용.
 * 신규 라우트 없음 — /power/by-region/{지명}/{subject} × 5과목이 기존 라우트로 자동 생성된다.
 * 각 지명은 소속 시군구 표기를 보유해 본문·description 1회 언급과 상향/하향 내부 링크에 쓴다.
 *
 * slug 규칙:
 *  - 표시명(지명)이 곧 slug·title 지역명. 전역 유일이면 그대로 사용.
 *  - 기존 지역 slug(963 ∪ 확장) 또는 다른 지명과 충돌하면 "{소속시군구} {지명}" 접미로 해소(발생 시 보고).
 *  - 목록 외 지명 추가·표기 임의 변경 금지.
 *
 * 소속 시군구 허브 매핑(sigunguHubSlug): 소속 시군구 표기를 실존 허브 slug(963 평면 또는 확장)로
 *  해석한다. 광역시 접두("인천 서구")는 확장 접미 slug 가 있으면 그대로, 없으면(유일 구) 접두를 떼어
 *  평면 slug 에 매칭한다. 미해석 시 null(보고).
 *
 * 워딩: 느낌표·금지어 없음. 색은 컴포넌트 accent(퍼플).
 */
import { isAnyPowerRegionSlug } from "@/data/powerRegionsExpansion";
import { REGIONS } from "@/data/sidoRegions";

const nfc = (s: string) => s.normalize("NFC");

/* ── 소속 시군구 → 시도(정식명) 해석(시도 필터 칩용) ─────────────────── */
const SIDO_BY_METRO: Record<string, string> = {
  서울: "서울특별시",
  부산: "부산광역시",
  대구: "대구광역시",
  인천: "인천광역시",
  광주: "광주광역시",
  대전: "대전광역시",
  울산: "울산광역시",
  세종: "세종특별자치시",
};
/** 권역 → 시도(정식명). 단일 시도 권역만(모호 권역은 시군구/접두로 해석). */
const SIDO_BY_GWANYEOK: Record<string, string> = {
  서울: "서울특별시",
  경기남부: "경기도",
  경기동부: "경기도",
  경기서부: "경기도",
  경기북부: "경기도",
  인천: "인천광역시",
};
/** 시군구명 → 시도(REGIONS 기반, 최초 등장 우선). */
const sidoBySigungu = new Map<string, string>();
for (const sido of REGIONS) {
  for (const sg of sido.sigungu) {
    if (!sidoBySigungu.has(nfc(sg.name))) sidoBySigungu.set(nfc(sg.name), sido.label);
  }
}
/** REGIONS 부재 시군구 폴백. */
const SIDO_FALLBACK: Record<string, string> = {
  군포시: "경기도",
  진주시: "경상남도",
  전주시: "전라북도",
};

/** 광역시·특별시 짧은 접두(소속 시군구 표기 앞) — 접두 분리 판정용. */
const METRO_PREFIX = new Set([
  "서울",
  "부산",
  "대구",
  "인천",
  "광주",
  "대전",
  "울산",
  "세종",
]);

/** 권역 → [지명, 소속 시군구] 목록(제공 목록 그대로, 순서 보존). */
const RAW: { region: string; items: [string, string][] }[] = [
  {
    region: "서울",
    items: [
      ["마곡", "강서구"],
      ["천왕지구", "구로구"],
      ["항동지구", "구로구"],
      ["세곡지구", "강남구"],
      ["우면지구", "서초구"],
      ["내곡지구", "서초구"],
      ["수서택지지구", "강남구"],
      ["은평뉴타운", "은평구"],
      ["고덕강일지구", "강동구"],
      ["강일지구", "강동구"],
      ["수색증산뉴타운", "은평구"],
      ["장위뉴타운", "성북구"],
      ["왕십리뉴타운", "성동구"],
      ["미아뉴타운", "강북구"],
      ["문정지구", "송파구"],
    ],
  },
  {
    region: "경기남부",
    items: [
      ["판교", "성남시 분당구"],
      ["위례", "하남시"],
      ["죽전", "용인시 수지구"],
      ["광교", "수원시 영통구"],
      ["호매실", "수원시 권선구"],
      ["동백", "용인시 기흥구"],
      ["동탄", "화성시"],
      ["동탄2", "화성시"],
      ["봉담", "화성시"],
      ["세교", "오산시"],
      ["고덕국제신도시", "평택시"],
      ["소사벌", "평택시"],
      ["브레인시티", "평택시"],
      ["현화지구", "평택시"],
      ["평촌", "안양시 동안구"],
      ["산본", "군포시"],
      ["인덕원", "안양시 동안구"],
      ["포일지구", "의왕시"],
      ["내손지구", "의왕시"],
    ],
  },
  {
    region: "경기동부",
    items: [
      ["미사", "하남시"],
      ["감일지구", "하남시"],
      ["다산", "남양주시"],
      ["별내", "남양주시"],
      ["진접", "남양주시"],
      ["갈매", "구리시"],
      ["태전지구", "광주시"],
      ["오포", "광주시"],
      ["양지지구", "용인시 처인구"],
    ],
  },
  {
    region: "경기서부",
    items: [
      ["중동신도시", "부천시"],
      ["상동지구", "부천시"],
      ["옥길지구", "부천시"],
      ["배곧", "시흥시"],
      ["은계지구", "시흥시"],
      ["목감지구", "시흥시"],
      ["장현지구", "시흥시"],
      ["하중지구", "시흥시"],
      ["한강신도시", "김포시"],
      ["풍무지구", "김포시"],
      ["광명역세권", "광명시"],
      ["고잔신도시", "안산시 단원구"],
    ],
  },
  {
    region: "경기북부",
    items: [
      ["일산", "고양시 일산동구"],
      ["삼송지구", "고양시 덕양구"],
      ["원흥지구", "고양시 덕양구"],
      ["지축지구", "고양시 덕양구"],
      ["향동지구", "고양시 덕양구"],
      ["덕은지구", "고양시 덕양구"],
      ["식사지구", "고양시 일산동구"],
      ["운정", "파주시"],
      ["옥정", "양주시"],
      ["회천신도시", "양주시"],
      ["민락2지구", "의정부시"],
      ["고산지구", "의정부시"],
    ],
  },
  {
    region: "인천",
    items: [
      ["송도", "인천 연수구"],
      ["청라", "인천 서구"],
      ["영종하늘도시", "인천 중구"],
      ["검단신도시", "인천 서구"],
      ["논현지구", "인천 남동구"],
      ["서창지구", "인천 남동구"],
      ["가정지구", "인천 서구"],
      ["루원시티", "인천 서구"],
    ],
  },
  {
    region: "충청",
    items: [
      ["도안신도시", "대전 서구"],
      ["내포신도시", "홍성군"],
      ["불당", "천안시 서북구"],
      ["탕정", "아산시"],
      ["오송", "청주시 흥덕구"],
      ["오창", "청주시 청원구"],
    ],
  },
  {
    region: "부산경남",
    items: [
      ["마린시티", "부산 해운대구"],
      ["센텀시티", "부산 해운대구"],
      ["정관", "기장군"],
      ["명지국제도시", "부산 강서구"],
      ["에코델타시티", "부산 강서구"],
      ["일광", "기장군"],
      ["물금", "양산시"],
      ["율하지구", "김해시"],
      ["진주혁신도시", "진주시"],
    ],
  },
  {
    region: "대구경북",
    items: [
      ["테크노폴리스", "대구 달성군"],
      ["이시아폴리스", "대구 동구"],
      ["알파시티", "대구 수성구"],
      ["연경지구", "대구 북구"],
      ["펜타힐즈", "경산시"],
      ["지곡단지", "포항시 남구"],
    ],
  },
  {
    region: "광주전라",
    items: [
      ["수완지구", "광주 광산구"],
      ["첨단지구", "광주 광산구"],
      ["상무지구", "광주 서구"],
      ["효천지구", "광주 남구"],
      ["빛가람혁신도시", "나주시"],
      ["에코시티", "전주시"],
    ],
  },
  {
    region: "강원제주",
    items: [
      ["원주혁신도시", "원주시"],
      ["남춘천지구", "춘천시"],
      ["제주첨단과학기술단지", "제주시"],
      ["아라지구", "제주시"],
    ],
  },
];

/**
 * 소속 시군구 표기 → 허브 slug.
 *  - 전각(full) 또는 접두 분리(strip) 후보가 963∪확장 에 실존하면 그 slug(사전 빌드 허브).
 *  - 둘 다 없으면(구로 분할된 시·데이터 부재 시명) 시명 자체를 slug 로 — /power/{시} 는
 *    [region] 라우트 dynamicParams 로 200 렌더된다(ISR). prebuilt=false 로 표시.
 */
/** 소속 시군구 표기 + 권역 → 시도 정식명(시도 칩 필터용). */
function resolveSido(paren: string, gwanyeok: string): string {
  if (SIDO_BY_GWANYEOK[gwanyeok]) return SIDO_BY_GWANYEOK[gwanyeok];
  const parts = paren.split(" ");
  if (parts.length >= 2 && SIDO_BY_METRO[parts[0]]) return SIDO_BY_METRO[parts[0]];
  return sidoBySigungu.get(nfc(paren)) ?? SIDO_FALLBACK[paren] ?? "";
}

function resolveHubSlug(paren: string): { slug: string; prebuilt: boolean } {
  const cands = [paren];
  const parts = paren.split(" ");
  if (parts.length >= 2 && METRO_PREFIX.has(parts[0])) {
    cands.push(parts.slice(1).join(" "));
  }
  for (const c of cands) if (isAnyPowerRegionSlug(c)) return { slug: c, prebuilt: true };
  return { slug: cands[cands.length - 1], prebuilt: false };
}

export interface PowerDistrict {
  /** by-region [region] 파라미터(한글, 전역 유일). = 표기명. */
  slug: string;
  /** 화면 표기명(= slug). */
  name: string;
  /** 제공 목록 원본 지명(충돌 접미 전). */
  rawName: string;
  /** 권역 그룹(서울/경기남부/…). */
  region: string;
  /** 소속 시군구 표기(본문·라벨·상향 링크 라벨용). */
  sigunguText: string;
  /** 소속 시도(정식명) — 지역 인덱스 시도 칩 필터용. */
  sidoLabel: string;
  /** 소속 시군구 허브 slug(상향 링크 도착) — /power/{slug} 200 렌더 보장. */
  sigunguHubSlug: string;
  /** 허브가 963∪확장 사전 빌드 slug 인지(false=시명 dynamicParams 렌더). */
  hubPrebuilt: boolean;
}

/** 충돌 접미로 표기가 바뀐 지명(보고용). */
export interface DistrictCollision {
  rawName: string;
  resolvedSlug: string;
  reason: "existing-region" | "duplicate-district";
}

const collisions: DistrictCollision[] = [];
const dynamicHubs: { rawName: string; sigunguText: string; hubSlug: string }[] = [];

/* ── slug 결정(충돌 해소) + 허브 매핑 ─────────────────────────────── */
const seen = new Set<string>();
const built: PowerDistrict[] = [];
for (const grp of RAW) {
  for (const [rawName, paren] of grp.items) {
    let slug = rawName;
    if (isAnyPowerRegionSlug(slug)) {
      slug = `${paren} ${rawName}`;
      collisions.push({ rawName, resolvedSlug: slug, reason: "existing-region" });
    } else if (seen.has(nfc(slug))) {
      slug = `${paren} ${rawName}`;
      collisions.push({ rawName, resolvedSlug: slug, reason: "duplicate-district" });
    }
    seen.add(nfc(slug));
    const hub = resolveHubSlug(paren);
    if (!hub.prebuilt) dynamicHubs.push({ rawName, sigunguText: paren, hubSlug: hub.slug });
    built.push({
      slug,
      name: slug,
      rawName,
      region: grp.region,
      sigunguText: paren,
      sidoLabel: resolveSido(paren, grp.region),
      sigunguHubSlug: hub.slug,
      hubPrebuilt: hub.prebuilt,
    });
  }
}

/* ── 공개 API ──────────────────────────────────────────────────────── */
export const powerDistricts: PowerDistrict[] = built;
export const powerDistrictCollisions: DistrictCollision[] = collisions;
/** 사전 빌드 허브가 없어 시명 dynamicParams 로 렌더되는 상향 링크(투명성용). */
export const powerDistrictDynamicHubs = dynamicHubs;

const slugKey = (s: string): string => {
  try {
    return decodeURIComponent(s).normalize("NFC");
  } catch {
    return s.normalize("NFC");
  }
};

const bySlug = new Map(powerDistricts.map((d) => [nfc(d.slug), d]));
const byHub = new Map<string, PowerDistrict[]>();
for (const d of powerDistricts) {
  const k = nfc(d.sigunguHubSlug);
  const arr = byHub.get(k);
  if (arr) arr.push(d);
  else byHub.set(k, [d]);
}

/** URL 파라미터가 지명이면 해당 데이터, 아니면 null. */
export function getPowerDistrict(param: string): PowerDistrict | null {
  return bySlug.get(slugKey(param)) ?? null;
}

/** 지명 slug 여부. */
export function isPowerDistrictSlug(param: string): boolean {
  return bySlug.has(slugKey(param));
}

/** 지명 slug 전체(sitemap·SSG용). */
export function allDistrictSlugs(): string[] {
  return powerDistricts.map((d) => d.slug);
}

/** 시군구 허브 slug → 관할 지명 목록(하향 링크용). */
export function districtsOfHub(hubSlugParam: string): PowerDistrict[] {
  return byHub.get(slugKey(hubSlugParam)) ?? [];
}

/** 권역별 지명 그룹(/power/regions 신도시 섹션용, 순서 보존). 시도는 칩 필터용. */
export interface DistrictRegionGroup {
  region: string;
  districts: { name: string; slug: string; sido: string }[];
}
export function powerDistrictGroups(): DistrictRegionGroup[] {
  const byKey = new Map(built.map((d) => [`${d.region}|${d.rawName}`, d]));
  return RAW.map((g) => ({
    region: g.region,
    districts: g.items.map(([rawName]) => {
      const d = byKey.get(`${g.region}|${rawName}`)!;
      return { name: d.name, slug: d.slug, sido: d.sidoLabel };
    }),
  }));
}
