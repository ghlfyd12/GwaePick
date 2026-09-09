/**
 * 검고의참견(/gumjung) 일정 축 데이터 — 허브 1 + 시도 17.
 *
 * 검정고시는 시도 교육청 단위로 연 2회(상반기 1회·하반기 2회) 시행된다. 구체 날짜는 연도·시도마다
 * 다르므로 데이터로 넣지 않고 "해당 회차 공고 확인"으로 위임한다(월 단위 일반 서술만). 연도가 바뀌어도
 * 페이지가 낡지 않는다. 시군구 단위 페이지는 만들지 않는다(중복 저품질 방지).
 *
 * 시도 배열은 색인 우선순위(지방 → 광역시 → 서울·경기)로 정렬해 둔다(sitemap·IndexNow 순서 대비).
 * 절대 규칙: 선생님 호칭만, 느낌표·보장·미확인 수치 금지, 방문·화상 1:1만, 특정 전형 단정 금지.
 */

export type GumjungSido = {
  /** 라우트 slug(로마자 — schools.ts 시도 slug 관례와 동일). */
  slug: string;
  /** 표기명(강원도 / 부산광역시 …). */
  name: string;
  /** 짧은 표기(강원 / 부산 …) — title·본문용. */
  short: string;
  /** 관할 교육청명. */
  office: string;
};

/** 색인 우선순위 순서: 지방 도·세종 → 광역시 → 서울·경기(맨 뒤). */
export const GUMJUNG_SIDOS: GumjungSido[] = [
  { slug: "gangwon", name: "강원도", short: "강원", office: "강원특별자치도교육청" },
  { slug: "chungbuk", name: "충청북도", short: "충북", office: "충청북도교육청" },
  { slug: "chungnam", name: "충청남도", short: "충남", office: "충청남도교육청" },
  { slug: "jeonbuk", name: "전라북도", short: "전북", office: "전북특별자치도교육청" },
  { slug: "jeonnam", name: "전라남도", short: "전남", office: "전라남도교육청" },
  { slug: "gyeongbuk", name: "경상북도", short: "경북", office: "경상북도교육청" },
  { slug: "gyeongnam", name: "경상남도", short: "경남", office: "경상남도교육청" },
  { slug: "jeju", name: "제주특별자치도", short: "제주", office: "제주특별자치도교육청" },
  { slug: "sejong", name: "세종특별자치시", short: "세종", office: "세종특별자치시교육청" },
  { slug: "busan", name: "부산광역시", short: "부산", office: "부산광역시교육청" },
  { slug: "daegu", name: "대구광역시", short: "대구", office: "대구광역시교육청" },
  { slug: "incheon", name: "인천광역시", short: "인천", office: "인천광역시교육청" },
  { slug: "gwangju", name: "광주광역시", short: "광주", office: "광주광역시교육청" },
  { slug: "daejeon", name: "대전광역시", short: "대전", office: "대전광역시교육청" },
  { slug: "ulsan", name: "울산광역시", short: "울산", office: "울산광역시교육청" },
  { slug: "seoul", name: "서울특별시", short: "서울", office: "서울특별시교육청" },
  { slug: "gyeonggi", name: "경기도", short: "경기", office: "경기도교육청" },
];

const bySlug = new Map(GUMJUNG_SIDOS.map((s) => [s.slug, s]));
export const GUMJUNG_SIDO_SLUGS: string[] = GUMJUNG_SIDOS.map((s) => s.slug);
export function getGumjungSido(slug: string): GumjungSido | null {
  return bySlug.get(slug) ?? null;
}

/** sidoRegions.label(예 "경기도"·"전라북도"·"강원도") → 일정 축 slug. 지역 253 보강의 일정 링크용. */
const SIDO_LABEL_TO_SLUG: Record<string, string> = {
  서울특별시: "seoul",
  경기도: "gyeonggi",
  강원도: "gangwon",
  충청북도: "chungbuk",
  충청남도: "chungnam",
  전라북도: "jeonbuk",
  전라남도: "jeonnam",
  경상북도: "gyeongbuk",
  경상남도: "gyeongnam",
  제주특별자치도: "jeju",
  세종특별자치시: "sejong",
  부산광역시: "busan",
  대구광역시: "daegu",
  인천광역시: "incheon",
  광주광역시: "gwangju",
  대전광역시: "daejeon",
  울산광역시: "ulsan",
};
/** 시도 라벨 → 일정 축 slug(없으면 null). */
export function gumjungScheduleSlugForSidoLabel(label: string): string | null {
  return SIDO_LABEL_TO_SLUG[label] ?? null;
}

/** 회차 구조(월 단위 일반 서술 — 구체 날짜는 공고 위임). */
export const GUMJUNG_SCHEDULE_STEPS: { n: number; title: string; body: string }[] = [
  { n: 1, title: "공고", body: "시도 교육청이 회차별 시행계획을 공고합니다. 응시 자격·접수 방법·시험일이 이 공고에 담깁니다." },
  { n: 2, title: "원서접수", body: "정해진 기간에 온라인 또는 방문으로 접수합니다. 접수 기간은 시험 약 두 달 전입니다." },
  { n: 3, title: "시험", body: "상반기 1회는 대략 4월, 하반기 2회는 대략 8월에 시행됩니다. 정확한 날짜는 해당 회차 공고에서 확인하세요." },
  { n: 4, title: "합격 발표", body: "시험 약 한 달 뒤 발표됩니다. 회차·시도별 일정은 공고 기준입니다." },
];

/** 허브·시도 공통 안내 문장. */
export const GUMJUNG_SCHEDULE_INTRO =
  "검정고시는 시도 교육청 단위로 연 2회(상반기·하반기) 시행됩니다. 회차마다 공고 → 원서접수 → 시험 → 합격 발표 순으로 진행되며, 구체적인 접수 기간과 시험일은 해당 회차 공고에서 확인할 수 있습니다.";

/** 허브 메타. */
export const GUMJUNG_SCHEDULE_HUB = {
  metaTitle: "검정고시 일정 - 연 2회 접수 시험 발표 안내",
  metaDescription:
    "검정고시 일정을 안내합니다. 시도 교육청 단위 연 2회(상반기·하반기) 접수·시험·발표 구조와 급별 응시 자격을 확인하고, 방문·화상 1:1 수업으로 준비해 무료 상담으로 시작하세요.",
};

/** 시도 일정 메타 빌더. */
export function gumjungSidoMeta(sido: GumjungSido): { title: string; description: string } {
  return {
    title: `${sido.short} 검정고시 일정 - 접수 기간 시험일 안내`,
    description: `${sido.name} 검정고시 일정을 안내합니다. ${sido.office} 주관 연 2회 접수·시험·발표 구조와 급별 응시 자격을 확인하고, ${sido.short} 지역 검정고시 과외를 방문·화상 1:1로 준비해 무료 상담으로 시작하세요.`,
  };
}

/** 일정 FAQ(허브·시도 공통 — 실제 렌더 = FAQPage 대상). */
export const GUMJUNG_SCHEDULE_FAQ: { q: string; a: string }[] = [
  {
    q: "검정고시는 1년에 몇 번 시행되나요?",
    a: "연 2회 시행됩니다. 상반기 1회와 하반기 2회로 나뉘며, 각 회차의 접수 기간과 시험일은 해당 회차 공고에서 확인할 수 있습니다.",
  },
  {
    q: "자퇴 후 언제 시험을 볼 수 있나요?",
    a: "고졸 검정고시는 학교에서 제적된 날로부터 공고일 기준 6개월 이상 지나야 응시할 수 있습니다(등록 장애인은 예외). 중졸·초졸 검정고시는 이러한 경과 기간 요건이 없습니다.",
  },
];

// 빌드 검증: 시도 title ≤ 40자.
{
  for (const s of GUMJUNG_SIDOS) {
    const t = gumjungSidoMeta(s).title;
    if ([...t].length > 40) throw new Error(`[gumjung/schedule] "${s.slug}" title >40자(${[...t].length}): ${t}`);
  }
}
