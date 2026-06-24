/**
 * Hero(상단) 섹션의 모든 카피/데이터 단일 소스.
 *
 * 컴포넌트(Hero.tsx)에는 문자열을 하드코딩하지 않는다.
 * 추후 pSEO(지역×학년×과목) 페이지에서 카피를 동적으로 주입·변주하므로
 * 모든 텍스트·이미지 메타는 반드시 이 파일에서만 관리한다.
 *
 * 톤(CLAUDE.md 고정 규칙): 영업·과장 금지, "내가 가르쳐봤으니 안다"는
 * 동료 교사의 차분한 확신. "컨설턴트" 단어는 절대 사용하지 않는다.
 */

/** 헤드라인 한 조각. emphasis 가 true 면 포인트 컬러+볼드로 렌더. */
export type HeadlineSegment = {
  text: string;
  /** 강조 단어 — 포인트(코랄·오렌지) 컬러 + 볼드 */
  emphasis?: boolean;
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

export type HeroNewsImage = HeroImage & {
  /** 보조 비주얼(이미지2) 하단 caption — 차분한 톤, 여기서 자유롭게 수정 */
  caption: string;
};

/** 히어로 배경 슬라이드 한 장. */
export type HeroSlide = {
  id: string;
  src: string;
  alt: string;
  /**
   * 이미지 맞춤 방식.
   *  - "cover": 영역을 꽉 채움(사진은 잘려도 무방).
   *  - "contain": 원본 비율로 전체가 보이게(인포그래픽 등 글자 많은 그래픽).
   */
  fit: "cover" | "contain";
  /** fit:"cover" 일 때 인물/핵심부가 텍스트와 겹치지 않게 미는 CSS object-position 값(예: "65% center"). */
  objectPosition?: string;
  /** fit:"contain" 일 때 히어로 영역 대비 가로 비율(%) — 이 폭 안에서 비율 유지하며 최대한 크게. */
  widthPct?: number;
  /** fit:"contain" 일 때 히어로 영역 대비 세로 최대 비율(%) — 세로가 먼저 차면 여기에 맞춰 축소. */
  maxHeightPct?: number;
  /**
   * fit:"contain" 일 때 인포그래픽/배너 "뒤"에 까는 풀배경 사진 경로(선택).
   * 이 배경에는 heroBgBlur(메인과 공유되는 공통 블러)가 적용되고,
   * 인포그래픽·배너는 블러 없이 이 배경 위에 선명하게 얹힌다.
   */
  bgImage?: string;
  /** 이 슬라이드에서 헤드라인+CTA 오버레이를 보일지 여부. */
  showOverlay: boolean;
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
    { text: "공부를 해도 성적이 그대로인 아이, 문제는 " },
    { text: "방법", emphasis: true },
    { text: "이 아니라 " },
    { text: "맞는 선생님", emphasis: true },
    { text: "입니다." },
  ],
  B: [
    { text: "기초가 흔들리는 " },
    { text: "지금", emphasis: true },
    { text: "이, 다시 잡을 수 있는 " },
    { text: "마지막 골든타임", emphasis: true },
    { text: "입니다." },
  ],
} satisfies Record<string, HeadlineSegment[]>;

export type HeadlineVariant = keyof typeof headlineVariants;

/**
 * 히어로 배경 슬라이드에 공통으로 적용하는 블러 강도(단일 소스).
 *
 * 두 슬라이드 배경(메인 사진 ↔ 뉴스 교실 배경)의 흐림 인상을 한 곳에서 동일하게 관리한다.
 * 현재는 뉴스 슬라이드의 교실 배경(bgImage)에만 적용되어 인포그래픽이 그 위에서 도드라지게 한다.
 * (메인 사진은 헤드라인 가독성을 위해 현행 유지 — 추후 동일 인상이 필요하면 이 값을 그대로 메인 배경에도 쓰면 된다.)
 *
 * 블러를 더/덜 흐리게 하려면 여기 px 값 하나만 바꾸면 양쪽 배경에 일관되게 반영된다.
 */
export const heroBgBlur = "blur(8px)";

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

  /** 메인 비주얼(이미지1) — 선생님-학생 1:1 장면 */
  mainImage: {
    src: "/images/hero-main.png",
    alt: "교실에서 선생님이 학생의 교재를 짚어가며 1:1로 설명하는 모습",
  } satisfies HeroImage,

  /** 보조 비주얼(이미지2) — 2028 대입 개편 안내, 긴급성 환기용 */
  newsImage: {
    src: "/images/hero-news.png",
    alt: "2028 대학입시제도 개편 주요 내용을 정리한 안내 이미지",
    caption: "2028 대입 개편 — 달라지는 입시, 방향부터 잡아야 합니다.",
  } satisfies HeroNewsImage,

  /**
   * 보조 비주얼(이미지2) 인셋 카드 노출 여부.
   * (현재 Hero 는 이미지2를 2번 슬라이드로 승격해 사용하므로 인셋 카드는 미사용.
   *  데이터 정의는 추후 재사용 위해 유지한다.)
   */
  showNewsInset: true,

  /**
   * 히어로 배경 슬라이드.
   * 슬라이드1(main)=사진(cover) + 오버레이 표시, 슬라이드2(news)=인포그래픽(contain) + 오버레이 숨김.
   * 전환: PC hover / 터치 탭·점. (자동전환 없음)
   */
  heroSlides: [
    {
      id: "main",
      src: "/images/hero-main.png",
      alt: "교실에서 선생님이 학생의 교재를 짚어가며 1:1로 설명하는 모습",
      fit: "cover",
      // 인물을 우측으로 약간 밀어 좌측 텍스트 공간 확보(인물이 잘리면 미세조정)
      objectPosition: "65% center",
      showOverlay: true,
    },
    {
      id: "news",
      src: "/images/hero-news.png",
      alt: "2028 대학입시제도 개편 주요 내용을 정리한 안내 이미지",
      // 인포그래픽은 전체가 보이게 contain + 히어로 영역에 거의 꽉 차게(가장자리 약간 여백).
      // 너무 흐려지면 widthPct 를 낮춘다.
      fit: "contain",
      // 인포그래픽/배너 뒤에 까는 풀배경 교실 사진 — heroBgBlur 로 블러 처리(배경에만).
      bgImage: "/images/hero-news-bg.png",
      widthPct: 90,
      maxHeightPct: 85,
      showOverlay: false,
    },
  ] satisfies HeroSlide[],

  /** 크로스페이드 전환 시간(ms) — 쉽게 조절 가능한 상수. */
  fadeMs: 500,
} as const;
