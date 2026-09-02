/**
 * 검고의참견 콘텐츠 보강 카피 단일 소스 — 지역·급별·가이드 신규 섹션.
 *
 * 게이트 1 승인본 그대로. 절대 규칙 준수: 느낌표·성과 및 기간 보장·후기·출처 없는 수치·특정 학교 및
 * 전형·심리 상담 표현 금지. 지도자 호칭은 "선생님"만(코치·코칭·컨설턴트·멘토·강사 미사용).
 * 과목·문항·배점은 확정 사실(levels.ts)만 참조 — 벤치마크 수치 미사용.
 */
import type { GumjungLevelSlug } from "@/data/gumjung/levels";

/* ── 수업 진행 4단계 (지역·급별 공통 확정 카피) ─────────────────── */
export const GUMJUNG_STEPS = {
  heading: "수업은 이렇게 진행됩니다",
  steps: [
    { n: 1, title: "무료 상담", body: "현재 상황과 목표 시기를 확인합니다." },
    { n: 2, title: "수준 진단", body: "급별·과목별 현재 수준을 파악합니다." },
    { n: 3, title: "맞춤 계획", body: "시험 일정에 맞춰 과목별 준비 순서를 정합니다." },
    { n: 4, title: "1:1 수업", body: "틀린 문제를 바로 확인하며 필요한 부분부터 채웁니다." },
  ],
} as const;

/* ── 준비 방법 비교표 (급별 공통, 중립 서술) ───────────────────── */
export const GUMJUNG_METHOD_COMPARE = {
  heading: "준비 방법 비교",
  rows: [
    { method: "독학", pro: "비용 부담이 적음", note: "계획·리듬을 스스로 잡아야 함" },
    { method: "인강", pro: "원하는 시간에 수강", note: "모르는 부분을 바로 묻기 어려움" },
    { method: "학원", pro: "정해진 일정으로 관리", note: "진도가 개인 속도와 다를 수 있음" },
    { method: "1:1 과외", pro: "내 수준에서 시작, 바로 질문", note: "—" },
  ],
} as const;

/* ── 준비하면서 흔한 어려움 3가지 (서술형) ─────────────────────── */
export const GUMJUNG_DIFFICULTIES = {
  heading: "준비하면서 흔히 겪는 점",
  items: [
    "혼자 공부 리듬을 유지하기 어려운 경우가 많습니다.",
    "강의를 듣기만 하고 직접 풀거나 질문하지 않으면 실전에서 막히기 쉽습니다.",
    "접수 시기를 놓쳐 다음 회차로 미뤄지는 경우가 있습니다.",
  ],
} as const;

/* ── 준비 흐름 (개월 수 명시 금지) ─────────────────────────────── */
export const GUMJUNG_FLOW = {
  heading: "준비는 이렇게 이어집니다",
  body: "목표 회차를 정하고 역산해 준비합니다. 진단으로 현재 수준을 확인하고, 과목별 계획을 세우고, 1:1 수업으로 채우고, 기출로 실전 점검을 합니다. 남은 기간에 맞춰 과목 우선순위를 조정합니다.",
} as const;

/* ── 보호자 안내 (학습 환경만, 심리·정서 케어 표현 금지) ──────────── */
export const GUMJUNG_GUARDIAN = {
  heading: "보호자를 위한 안내",
  body: "준비를 도우실 때는 학습 환경을 함께 챙겨 주시면 도움이 됩니다. 목표 회차와 접수 일정을 함께 확인하고, 정해진 수업 시간을 지켜 학습 리듬을 만드는 것이 중요합니다. 진도와 준비 상황은 상담에서 안내해 드립니다.",
} as const;

/* ── 급별 상세 신규 FAQ 2문항 (확정 카피) ─────────────────────── */
export const GUMJUNG_LEVEL_FAQ_EXTRA: { q: string; a: string }[] = [
  {
    q: "과목합격제는 어떻게 활용하나요?",
    a: "60점 이상 받은 과목은 과목합격으로 인정되어 다음 회차에서 면제 신청이 가능합니다. 한 번에 전 과목을 준비하기 어려우면 회차를 나눠 준비할 수 있습니다.",
  },
  {
    q: "언제부터 준비를 시작하는 것이 좋나요?",
    a: "목표 회차와 현재 수준에 따라 다릅니다. 시험은 연 2회 시행되므로, 상담에서 목표 시기를 정하고 역산해 준비 순서를 잡습니다.",
  },
];

/* ── 지역 FAQ 3문항 ({지역} 변수) ─────────────────────────────── */
export function gumjungRegionFaq(regionName: string): { q: string; a: string }[] {
  return [
    {
      q: `${regionName}에서 검정고시 과외가 가능한가요?`,
      a: `네. ${regionName}에서 방문 또는 화상 1:1 수업으로 진행할 수 있습니다. 상담에서 지역과 일정에 맞는 선생님을 확인해 드립니다.`,
    },
    {
      q: "방문과 화상 중 어떤 방식이 좋나요?",
      a: "학생의 성향과 일정에 따라 다릅니다. 두 방식 모두 1:1로 진행되며, 상담에서 상황에 맞는 방식을 함께 정합니다.",
    },
    {
      q: "어떤 과목부터 시작해야 하나요?",
      a: "급별 필수과목 중 현재 수준과 격차가 큰 과목부터 시작하는 경우가 많습니다. 수준 진단 후 준비 순서를 정합니다.",
    },
  ];
}

/* ── 지역 수업 형태 안내 (사실 범위, 지역 표기) ────────────────── */
export function gumjungRegionLessonBody(regionName: string): string {
  return `${regionName}에서는 방문 수업과 화상 수업 모두 1:1로 진행할 수 있습니다. 이동이 어려우면 화상으로, 대면이 편하면 방문으로 — 상담에서 지역과 일정에 맞는 방식을 함께 정합니다.`;
}

/* ── B-3 합격 기준 + 과목별 전략 (급별 과목 반영) ─────────────── */
const STRATEGY_ACCUM: Record<GumjungLevelSlug, string> = {
  gojol: "수학·영어",
  jungjol: "수학·영어",
  chojol: "수학",
};
const STRATEGY_MEMO: Record<GumjungLevelSlug, string> = {
  gojol: "사회·한국사",
  jungjol: "사회",
  chojol: "사회",
};
export function gumjungStrategyBody(slug: GumjungLevelSlug): string {
  return (
    "전 과목 평균 60점 이상이면 합격입니다. 결시한 과목이 있으면 평균이 60점이어도 합격으로 인정되지 않습니다. " +
    `그래서 과목마다 접근을 달리합니다. 개념이 쌓여야 하는 ${STRATEGY_ACCUM[slug]}은 기초부터 순서대로, ` +
    `암기 비중이 큰 ${STRATEGY_MEMO[slug]}는 기출 회독으로 준비하는 경우가 많습니다. ` +
    "어느 과목에 시간을 더 쓸지는 학생마다 다르므로, 진단 후 함께 정합니다."
  );
}

/* ── B-4 응시 자격·접수 (급별별 사실, 공고 확인 위임) ──────────── */
export const GUMJUNG_ELIGIBILITY: Record<GumjungLevelSlug, string> = {
  gojol:
    "고졸 검정고시는 중학교 졸업(또는 동등 학력) 이후 응시할 수 있습니다. 고등학교 재학 중에는 응시할 수 없고, 자퇴(제적) 후 일정 기간이 지나야 하는 경우가 있습니다(통상 6개월). 시험은 연 2회(통상 4월·8월) 시행되며, 공고 → 접수 → 시험 → 발표 순으로 진행됩니다. 접수 기간이 짧은 편이라 일정 확인이 중요합니다. 정확한 응시 요건과 회차별 일정은 해당 회차 시·도 교육청 공고에서 확인해 주세요.",
  jungjol:
    "중졸 검정고시는 초등학교 졸업(또는 동등 학력) 이후 응시할 수 있습니다. 중학교 재학 중에는 응시할 수 없고, 자퇴(제적) 후 일정 기간이 지나야 하는 경우가 있습니다(통상 6개월). 시험은 연 2회(통상 4월·8월) 시행되며, 공고 → 접수 → 시험 → 발표 순으로 진행됩니다. 접수 기간이 짧은 편이라 일정 확인이 중요합니다. 정확한 응시 요건과 회차별 일정은 해당 회차 시·도 교육청 공고에서 확인해 주세요.",
  chojol:
    "초졸 검정고시는 초등학교 과정을 마치지 않은 경우 응시할 수 있으며, 학교 재학 중에는 응시할 수 없습니다. 시험은 연 2회(통상 4월·8월) 시행되며, 공고 → 접수 → 시험 → 발표 순으로 진행됩니다. 접수 기간이 짧은 편이라 일정 확인이 중요합니다. 정확한 응시 요건과 회차별 일정은 해당 회차 시·도 교육청 공고에서 확인해 주세요.",
};

/* ── B-10 합격 이후의 길 (급별 분기, 특정 학교·전형 금지) ──────── */
export const GUMJUNG_AFTER: Record<
  GumjungLevelSlug,
  { body: string; link: { label: string; href: string } }
> = {
  gojol: {
    body: "고졸 검정고시 합격 이후에는 대학 진학을 준비하거나 취업·자격 준비로 이어갈 수 있습니다. 대입에서의 활용은 전형에 따라 다르므로 상담에서 확인합니다.",
    link: { label: "대입 전략 가이드", href: "/gumjung/guide/daeip-strategy" },
  },
  jungjol: {
    body: "중졸 검정고시 합격은 고등학교 입학 자격이 됩니다. 진학 방법과 일정은 학교 유형과 지역에 따라 다르므로 상담에서 확인합니다.",
    link: { label: "고입 준비 가이드", href: "/gumjung/guide/goip" },
  },
  chojol: {
    body: "초졸 검정고시 합격 이후에는 중졸 검정고시 준비로 이어가는 경우가 많습니다. 현재 수준에서 다음 단계를 함께 계획합니다.",
    link: { label: "중졸 검정고시 안내", href: "/gumjung/jungjol" },
  },
};

/* ── B-6 과목별 공부 포인트 (필수과목 one-liner) ──────────────── */
export const GUMJUNG_SUBJECT_POINT: Record<string, string> = {
  korean: "지문을 정확히 읽고 유형을 익히면 안정적입니다.",
  math: "막히는 개념부터 순서대로 채우면 시간을 아낄 수 있습니다.",
  english: "기초 문법·어휘가 받쳐 줘야 지문이 읽힙니다.",
  social: "개념의 흐름부터 정리합니다.",
  science: "개념과 자료 해석을 유형으로 익힙니다.",
  history: "흐름과 주요 사건을 연결해 이해합니다.",
};

/* ── 관련 검색어 태그 (장식용 span, 클릭 불가) ────────────────── */
export function gumjungRegionTags(regionName: string): string[] {
  return [
    `${regionName} 검정고시`,
    `${regionName} 검정고시 과외`,
    `${regionName} 고졸 검정고시`,
    `${regionName} 중졸 검정고시`,
    "검정고시 1:1",
    `${regionName} 검정고시 공부법`,
  ];
}
export function gumjungLevelTags(levelName: string, slug: GumjungLevelSlug): string[] {
  const base = [
    `${levelName} 검정고시`,
    `${levelName} 검정고시 과목`,
    `${levelName} 검정고시 과외`,
    `${levelName} 검정고시 가이드`,
    "검정고시 공부법",
    "검정고시 1:1",
  ];
  if (slug === "gojol") base.push("검정고시 수능");
  if (slug === "jungjol") base.push("검정고시 고입");
  return base;
}
export function gumjungGuideTags(navLabel: string): string[] {
  return [`${navLabel} 검정고시`, "검정고시 공부법", "검정고시 가이드", "검정고시 1:1 개인과외"];
}
