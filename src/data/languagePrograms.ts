/**
 * 어학 전문 상담 랜딩(/power) 콘텐츠 단일 소스(하드코딩 금지).
 *
 * Hero 카피 · 학습자 유형 · 언어별 안내 카드(영어/중국어/일본어) · 공통 4단계 흐름 ·
 * 희망 메시지를 모두 여기서 가져온다. 카피는 초안이며 확정 전까지 이 파일에서 자유롭게 교체한다.
 *
 * 워딩 규칙: "선생님 / 상담 선생님 / 직접 가르쳐 온 선생님 / 관리 / 설계" 로 통일.
 *   "컨설턴트 / 컨설팅 / 코치 / 코칭 / 멘토" 및 느낌표(!)는 사용하지 않는다.
 *   특정 연령(초등/성인/시니어 등)을 나열하지 않고 "학습자 / 누구나 / 목표만 있으면" 으로 표현한다.
 * 포인트 컬러는 accent 토큰(유틸: text-accent/bg-accent…). /power 는 .power-theme 스코프에서
 *   accent 가 퍼플(#7D0096)로 자동 오버라이드된다 — 여기 카피는 색과 무관하게 톤만 지킨다.
 */

/** 후기 필터 기준 — reviewItems.ts 의 subject 값 중 어학에 해당하는 과목만. */
export const languageReviewSubjects = ["영어", "중국어", "일본어"] as const;

/** Hero 안의 헤드라인 강조 조각(강조 부분만 코랄로 렌더). */
export type HeadlineSegment = { text: string; emphasis?: boolean };

export const powerHero = {
  /** 작은 머리표시 */
  eyebrow: "어학 전문 1:1 상담",
  /** 페이지 유일의 h1 — 강조 조각만 코랄 처리 */
  headline: [
    { text: "외국어, 혼자 외우다 멈춘 아이에게 필요한 건 " },
    { text: "함께 말해 줄 한 사람", emphasis: true },
    { text: "입니다." },
  ] as HeadlineSegment[],
  /** 서브 카피 */
  sub: "회화부터 어학시험, 입시 영어까지 — 아이의 현재 수준을 먼저 보고, 가장 잘 맞는 선생님과 호흡을 맞춰 수업할 수 있도록 해드립니다.",
  /** 신뢰 뱃지 3종 */
  badges: ["검증 선생님", "무료 체험", "교체 무료"] as const,
} as const;

/**
 * 2번 섹션 — "왜 원어민 1:1 어학 수업인가" 특징 4블록.
 * 좌측 카피(intro) + 우측 특징 블록(features). icon 은 장식 이모지, 의미는 title·desc.
 * (기존 "어떤 학습자인가" 공감 블록을 특징 블록으로 대체.)
 */
export const powerWhyIntro = {
  eyebrow: "왜 원어민 1:1 어학 수업인가",
  title: "요즘, 외국어는 원어민 선생님과 직접 말하며 배웁니다",
  sub: "휴대폰 하나로 어디서든, 원어민·교포 선생님과 1:1로. 회화부터 시험·입시까지 목표에 맞춰 진행합니다.",
} as const;

export const powerWhyFeatures = [
  {
    icon: "🗣️",
    title: "원어민·교포 선생님과 1:1 맞춤 수업",
    desc: "그룹 수업이 아니라, 맞는 선생님 한 분과 매일 짧고 집중된 1:1로 진행합니다.",
  },
  {
    icon: "⏰",
    title: "원하는 시간에 맞춘 수업",
    desc: "오전 6시부터 밤 12시까지, 일정에 맞춰 유동적으로 조정합니다.",
  },
  {
    icon: "📘",
    title: "수준에 맞춘 온라인 교재",
    desc: "기초부터 고급까지, 학습자의 레벨과 목표에 맞춰 수업을 설계합니다.",
  },
  {
    icon: "🔁",
    title: "복습까지 한 번에",
    desc: "수업 녹음·발음 교정·과제로 배운 내용을 다음 수업으로 이어 갑니다.",
  },
] as const;

/**
 * 3번 섹션 — 언어별 안내 헤더 카피.
 * "누구나" 뉘앙스: 연령을 나열하지 않고 목표만 있으면 시작할 수 있음을 강조한다.
 */
export const languageSectionCopy = {
  title: "언어별로, 지금 필요한 만큼",
  sub: "영어 · 중국어 · 일본어 모두 같은 흐름으로 — 지금 수준을 먼저 보고, 회화 · 시험 · 입시 중 필요한 목표에 맞춰 수업합니다. 처음이든 오래됐든, 목표만 있으면 시작할 수 있습니다.",
} as const;

/** 모든 언어가 공유하는 커리큘럼 4단계 흐름. */
export const languageSharedFlow = [
  { step: "레벨 진단", desc: "현재 수준과 목표를 먼저 확인합니다." },
  {
    step: "기초 다지기",
    desc: "발음·문법·어휘의 약한 곳부터 다시 잡습니다.",
  },
  {
    step: "목표별 실전",
    desc: "회화 · 시험 · 입시 중 필요한 목표에 맞춰 훈련합니다.",
  },
  {
    step: "점검·피드백",
    desc: "수업마다 확인하고 다음 수업의 출발점으로 이어 갑니다.",
  },
] as const;

/** 언어별 안내 카드 1장의 데이터. */
export type LanguageProgram = {
  /** 카드 식별자 */
  id: "english" | "chinese" | "japanese";
  /** 언어명 */
  name: string;
  /** 장식 이모지 */
  emoji: string;
  /** "이런 학습자에게" — 한 줄 요약 + 세부 항목 */
  forLearners: string[];
  /** "이렇게 도와드립니다" — 회화/시험/입시 영역 */
  areas: { label: string; detail: string }[];
  /** 수업 방식 한 단락 */
  method: string;
};

export const languagePrograms: LanguageProgram[] = [
  {
    id: "english",
    name: "영어",
    emoji: "🇬🇧",
    forLearners: [
      "단어는 외우는데 말이 안 나오는 학습자",
      "어학시험 점수가 정체된 학습자",
      "내신·수능 영어가 흔들리는 학습자",
    ],
    areas: [
      { label: "회화", detail: "원어민·교포 선생님과 1:1로 실제 상황 대화" },
      { label: "어학시험", detail: "토익·토플·오픽을 유형별 전략으로 관리" },
      { label: "입시 영어", detail: "내신·수능 기출로 나눠 관리" },
    ],
    method:
      "문장을 끊어 읽고 직접 말해 보는 훈련을 중심으로 합니다. 회화는 실제 상황 대화로, 시험은 유형별 전략으로, 입시는 내신·수능 기출로 나눠 관리합니다.",
  },
  {
    id: "chinese",
    name: "중국어",
    emoji: "🇨🇳",
    forLearners: [
      "성조·발음이 어려운 학습자",
      "HSK 급수를 올리고 싶은 학습자",
      "처음 시작하는 학습자",
    ],
    areas: [
      { label: "회화", detail: "원어민·교포 선생님과 1:1로 일상 표현 누적" },
      { label: "어학시험", detail: "HSK 급수별 어휘·독해를 단계로 관리" },
    ],
    method:
      "성조와 발음부터 바로잡습니다. 회화는 일상 표현을 누적하고, HSK는 급수별 어휘·독해를 단계로 나눠 관리합니다.",
  },
  {
    id: "japanese",
    name: "일본어",
    emoji: "🇯🇵",
    forLearners: [
      "기초 문형부터 다시 잡고 싶은 학습자",
      "JLPT를 준비하는 학습자",
      "회화 실력을 늘리고 싶은 학습자",
    ],
    areas: [
      { label: "회화", detail: "원어민·교포 선생님과 1:1로 실생활 표현 중심" },
      { label: "어학시험", detail: "JLPT N급수별 문법·청해를 단계로 관리" },
    ],
    method:
      "히라가나·문형 기초부터 시작합니다. 회화는 실생활 표현 중심으로, JLPT는 N급수별 문법·청해를 단계로 나눠 관리합니다.",
  },
];

/** 최종 CTA 섹션의 희망 메시지. */
export const powerClosing = {
  message:
    "지금 막힌 한 곳도, 함께 말하다 보면 충분히 달라집니다. 변화는 맞는 선생님을 만나는 것에서 시작됩니다. 오늘 상담으로 그 첫걸음을 시작하세요.",
} as const;
