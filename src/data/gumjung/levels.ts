/**
 * 검고의참견(/gumjung) 급별(고졸·중졸·초졸) 데이터 단일 소스.
 *
 * 급별 상세 3장 + 급별×과목·지역 페이지의 사실 데이터·내부링크가 여기서 파생된다.
 * 카피는 게이트 1 승인본 그대로. 워딩 절대 규칙(자퇴·중퇴 부정 묘사 금지, 성과·기간 보장 금지,
 * 느낌표·컨설턴트/멘토/강사 금지, 특정 학교·전형 언급 금지, 심리 상담 표현 금지)을 준수한다.
 * 색은 accent 토큰(청록)만 — 컴포넌트에서 처리(하드코딩 없음).
 */

export type GumjungLevelSlug = "gojol" | "jungjol" | "chojol";

export type GumjungSubjectRef = { slug: string; label: string };

export type GumjungLevel = {
  slug: GumjungLevelSlug;
  /** 짧은 표기(고졸/중졸/초졸). */
  name: string;
  /** 페이지 제목용 정식 표기(고졸 검정고시 …). */
  examName: string;
  /** 목록 정렬 순서(고→중→초). */
  order: number;
  /** 급별 상세 h1(승인본). */
  h1: string;
  /** 급별 상세 인트로 본문(승인본). */
  intro: string;
  /** 페이지화하는 필수 과목(급별×과목). */
  requiredSubjects: GumjungSubjectRef[];
  /** 필수 과목 수(표기용). */
  requiredCount: number;
  /** 선택 과목 수(표기용). */
  electiveCount: number;
  /** 총 과목 수. */
  totalCount: number;
  /** 선택 과목 표기(페이지 미생성 — 급별 상세 내 안내만). */
  electiveNote: string;
  /** 문항·배점 사실. */
  questionInfo: string;
};

/**
 * 검증된 시험 안내 사실(급별 상세 공통). 승인본 그대로 — 임의 수치·창작 없음.
 * 마지막 항목은 시행 공고 변동 가능 안내(필수 1줄).
 */
export const GUMJUNG_EXAM_FACTS: string[] = [
  "전 과목 100점 만점, 평균 60점 이상이면 합격입니다. 결시한 과목이 있으면 평균이 60점이어도 합격으로 인정되지 않습니다.",
  "60점 이상 받은 과목은 과목 합격으로 인정되어, 다음 회차에 면제를 신청할 수 있습니다.",
  "문항은 객관식 4지선다입니다.",
  "연 2회 시행되며, 통상 4월과 8월에 치러집니다.",
  "2026년 기준 전 과목이 2015 개정 교육과정을 바탕으로 출제됩니다.",
  "회차·과목 구성·출제 기준은 시행 공고에 따라 달라질 수 있습니다.",
];

/** 유형 섹션(급별 상세 공통 4개) — 승인본. 유형 가이드 7장으로의 링크는 컴포넌트에서 별도 배치. */
export const GUMJUNG_TYPE_SECTION = {
  heading: "이런 분들이 검정고시를 준비합니다",
  items: [
    {
      title: "빠른 대입·진로 준비",
      body: "필요한 과목에 집중해 대입 준비 시간을 확보하려는 경우. 검정고시와 이후 입시 전략을 함께 계획합니다.",
    },
    {
      title: "예체능·실기 병행",
      body: "연습 시간과 학습을 같이 가져가야 하는 경우. 실기 일정에 맞춰 학습 분량을 조절합니다.",
    },
    {
      title: "학업 공백이 긴 경우",
      body: "기초부터 다시 시작해도 괜찮습니다. 검정고시는 출제 유형이 정해져 있어 핵심부터 단계적으로 준비할 수 있습니다.",
    },
    {
      title: "성인·만학도",
      body: "일과 병행하는 일정에 맞춰 수업 시간을 조율합니다.",
    },
  ],
} as const;

/** FAQ(급별 상세 공통 3문항) — 승인본. */
export const GUMJUNG_FAQ: { q: string; a: string }[] = [
  {
    q: "인강이나 교재로 혼자 준비해도 되지 않나요?",
    a: "혼자 준비해서 합격하는 분들도 있습니다. 다만 수학·과학처럼 개념이 쌓여야 하는 과목은 혼자 하면 시간이 오래 걸리기 쉽습니다. 1:1 수업은 틀린 문제를 바로 확인하고 필요한 부분만 채우는 방식이라 준비 기간을 줄이는 데 도움이 됩니다.",
  },
  {
    q: "기초가 거의 없는데 가능한가요?",
    a: "검정고시는 출제 유형이 정해져 있어 기초가 부족해도 필요한 핵심부터 단계적으로 준비할 수 있습니다. 현재 수준에 맞춰 시작합니다.",
  },
  {
    q: "아이가 공부할 마음이 아직 없어 보여요.",
    a: "학업을 쉬었던 학생일수록 작은 분량부터 시작해 할 수 있다는 경험을 먼저 만드는 것이 중요합니다. 학생의 속도에 맞춰 진행합니다.",
  },
];

const S = {
  korean: { slug: "korean", label: "국어" },
  math: { slug: "math", label: "수학" },
  english: { slug: "english", label: "영어" },
  social: { slug: "social", label: "사회" },
  science: { slug: "science", label: "과학" },
  history: { slug: "history", label: "한국사" },
} as const;

export const GUMJUNG_LEVELS: GumjungLevel[] = [
  {
    slug: "gojol",
    name: "고졸",
    examName: "고졸 검정고시",
    order: 1,
    h1: "고졸 검정고시, 나에게 맞는 속도로 준비합니다",
    intro:
      "학교 밖에서 공부하는 이유는 저마다 다릅니다. 대입을 앞당기려는 학생, 실기와 병행하는 예체능 준비생, 오랜 공백 후 다시 시작하는 성인까지. 검정고시는 출제 범위가 정해져 있어 방향만 잡으면 혼자보다 훨씬 빠르게 준비할 수 있습니다. 상담에서 현재 상황과 목표 시기를 확인하고 맞는 선생님을 연결해 드립니다.",
    requiredSubjects: [S.korean, S.math, S.english, S.social, S.science, S.history],
    requiredCount: 6,
    electiveCount: 1,
    totalCount: 7,
    electiveNote:
      "선택 과목은 도덕·기술가정·체육·음악·미술 가운데 1과목으로, 페이지 없이 상담에서 함께 확인합니다.",
    questionInfo:
      "과목별 25문항(수학은 20문항), 문항당 4점(수학은 5점)으로 출제됩니다.",
  },
  {
    slug: "jungjol",
    name: "중졸",
    examName: "중졸 검정고시",
    order: 2,
    h1: "중졸 검정고시, 나에게 맞는 속도로 준비합니다",
    intro:
      "학교 밖에서 공부하는 이유는 저마다 다릅니다. 고등학교 진학을 준비하는 경우, 오랜 공백 후 다시 시작하는 경우까지. 검정고시는 출제 범위가 정해져 있어 방향만 잡으면 혼자보다 훨씬 빠르게 준비할 수 있습니다. 상담에서 현재 상황과 목표 시기를 확인하고 맞는 선생님을 연결해 드립니다.",
    requiredSubjects: [S.korean, S.math, S.english, S.social, S.science],
    requiredCount: 5,
    electiveCount: 1,
    totalCount: 6,
    electiveNote:
      "선택 과목은 도덕·기술가정·정보·체육·음악·미술 가운데 1과목으로, 페이지 없이 상담에서 함께 확인합니다.",
    questionInfo:
      "과목별 25문항(수학은 20문항), 문항당 4점(수학은 5점)으로 출제됩니다.",
  },
  {
    slug: "chojol",
    name: "초졸",
    examName: "초졸 검정고시",
    order: 3,
    h1: "초졸 검정고시, 나에게 맞는 속도로 준비합니다",
    intro:
      "학교 밖에서 공부하는 이유는 저마다 다릅니다. 검정고시는 출제 범위가 정해져 있어 방향만 잡으면 핵심부터 차근히 준비할 수 있습니다. 상담에서 현재 상황과 목표 시기를 확인하고 맞는 선생님을 연결해 드립니다.",
    requiredSubjects: [S.korean, S.math, S.social, S.science],
    requiredCount: 4,
    electiveCount: 2,
    totalCount: 6,
    electiveNote:
      "선택 과목은 도덕·음악·미술·체육·실과·영어 가운데 2과목으로, 페이지 없이 상담에서 함께 확인합니다.",
    questionInfo: "과목별 20문항, 문항당 5점으로 출제됩니다.",
  },
];

const bySlug = new Map<string, GumjungLevel>(
  GUMJUNG_LEVELS.map((l) => [l.slug, l]),
);

export function getGumjungLevel(slug: string): GumjungLevel | null {
  return bySlug.get(slug) ?? null;
}

export function isGumjungLevelSlug(slug: string): boolean {
  return bySlug.has(slug);
}

export const GUMJUNG_LEVEL_SLUGS: GumjungLevelSlug[] = GUMJUNG_LEVELS.map(
  (l) => l.slug,
);
