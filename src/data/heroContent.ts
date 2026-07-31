/**
 * Hero(상단) 섹션의 모든 카피/데이터 단일 소스.
 *
 * 컴포넌트(Hero.tsx)에는 문자열을 하드코딩하지 않는다.
 * 추후 pSEO(지역×학년×과목) 페이지에서 카피를 동적으로 주입·변주하므로
 * 모든 텍스트·이미지 메타는 반드시 이 파일에서만 관리한다.
 *
 * 톤(CLAUDE.md 고정 규칙): 영업·과장 금지, "내가 가르쳐봤으니 안다"는
 * 동료 교사의 차분한 확신. 금지어(CLAUDE.md 워딩 규칙 참고)는 쓰지 않는다.
 */

/** 헤드라인 한 조각. emphasis 가 true 면 포인트 컬러+볼드로 렌더. */
export type HeadlineSegment = {
  text: string;
  /** 강조 단어 — 포인트(코랄·오렌지) 컬러 + 볼드 */
  emphasis?: boolean;
  /** 이 조각 뒤에서 모바일(md 미만)만 줄바꿈. 데스크톱은 무시(자연 줄바꿈). */
  break?: boolean;
};

/** 서브 카피 한 조각. strong 이 true 면 볼드 강조(컬러는 본문색 유지). */
export type SubCopySegment = {
  text: string;
  strong?: boolean;
};

export type HeroImage = {
  src: string;
  alt: string;
};

/** 단일 히어로 배경 이미지. */
export type HeroBackground = HeroImage & {
  /** 인물/핵심부가 좌측 텍스트와 겹치지 않게 미는 CSS object-position 값(예: "65% center"). */
  objectPosition?: string;
};

export type TrustBadge = {
  /** 간단한 이모지 아이콘 (외부 아이콘 의존성 없이) */
  icon: string;
  label: string;
};

export type StudentType = {
  emoji: string;
  text: string;
};

/** 히어로 오른쪽 보조 진입 배너(코랄 알약). 주 CTA(무료 상담 신청)보다 약간 작은 위계. */
export type SideBanner = {
  label: string;
  href: string;
};

/**
 * 헤드라인 A/B 변이.
 *  - A안: 공감형(방법이 아니라 맞는 선생님)
 *  - B안: 입시 긴급성(골든타임) — 기획안 C안
 * activeVariant 한 줄만 바꾸면 헤드라인이 즉시 전환된다.
 */
export const headlineVariants = {
  A: [
    // 모바일 3줄: ① 공부를…아이, / ② 문제는 방법이 아니라 / ③ 맞는 선생님입니다.
    // (break 는 md:hidden 줄바꿈 — 데스크톱은 trailing space 로 자연스럽게 이어진다)
    { text: "공부를 해도 성적이 그대로인 아이, ", break: true },
    { text: "문제는 " },
    { text: "방법", emphasis: true },
    { text: "이 아니라 ", break: true },
    { text: "맞는 선생님", emphasis: true },
    { text: "입니다." },
  ] as HeadlineSegment[],
  B: [
    { text: "기초가 흔들리는 " },
    { text: "지금", emphasis: true },
    { text: "이, 다시 잡을 수 있는 " },
    { text: "마지막 골든타임", emphasis: true },
    { text: "입니다." },
  ] as HeadlineSegment[],
};

export type HeadlineVariant = keyof typeof headlineVariants;

export const heroContent = {
  /**
   * 현재 노출 중인 헤드라인 변이.
   * 'A' ↔ 'B' 로만 바꾸면 헤드라인이 전환된다(기본값 'A').
   * 실제 A/B 트래픽 분배 로직은 이번 범위 밖.
   */
  activeVariant: "A" as HeadlineVariant,

  headlines: headlineVariants,

  /** 서브 카피 (A/B 공통). strong 조각은 볼드로 강조. */
  subCopy: [
    { text: "진도가 빨라 놓친 아이, 자신감을 잃은 아이, 어디서부터 손대야 할지 막막한 아이 — 상담부터 시작하세요. " },
    { text: "직접 가르쳐 본 선생님", strong: true },
    { text: "이 아이를 먼저 이해하고, " },
    { text: "가장 잘 맞는 선생님과 호흡을 맞춰", strong: true },
    { text: " 수업할 수 있도록 해드립니다." },
  ] satisfies SubCopySegment[],

  /** 전환 목표 = 무료 상담 신청. 폼 구현 전까지 #consult 앵커로 연결. */
  cta: {
    label: "무료 상담 신청",
    href: "#consult",
  },

  /** 신뢰 뱃지 3종 */
  trustBadges: [
    { icon: "✓", label: "검증 교사" },
    { icon: "🎁", label: "무료 체험" },
    { icon: "🔄", label: "호흡 조율" },
  ] satisfies TrustBadge[],

  /** "어떤 학생인가" 공감 블록 4개 */
  studentTypes: [
    { emoji: "📉", text: "학원 다녀도 성적이 안 오르는 아이" },
    { emoji: "😟", text: "특정 과목만 유독 어려워하는 아이" },
    { emoji: "🐢", text: "학교 진도를 따라가기 버거운 아이" },
    { emoji: "🔁", text: "선생님과 안 맞아 과외를 그만둔 경험이 있는 아이" },
  ] satisfies StudentType[],

  /**
   * 히어로 오른쪽 보조 진입 배너(코랄 알약, 세로 스택).
   * 두 슬라이드 모두에 표시되어 뉴스 슬라이드의 빈 오른쪽을 채운다.
   * 라벨/링크는 여기서만 관리(하드코딩 금지). 앵커 섹션은 추후 생성 시 자연 연결.
   */
  heroSideBanners: [
    { label: "무료수업 문의하기", href: "#consult" },
    { label: "과목별 커리큘럼보기", href: "#curriculum" },
    { label: "수업후기", href: "#reviews" },
  ] satisfies SideBanner[],

  /**
   * 히어로 단일 배경 이미지(사진) — 선생님-학생 1:1 장면.
   * object-cover 로 영역을 꽉 채우고, 인물이 좌측 텍스트와 겹치지 않게 objectPosition 으로 민다.
   * 2028 입시 인포그래픽(뉴스) 슬라이드는 제거됨 — 원본 이미지 파일은 추후 재활용 위해 유지.
   */
  heroBackground: {
    src: "/images/hero-main.png",
    alt: "교실에서 선생님이 학생의 교재를 짚어가며 1:1로 설명하는 모습",
    objectPosition: "65% center",
  } satisfies HeroBackground,
} as const;
