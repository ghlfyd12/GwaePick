/**
 * 과목 × 학교급 단원/시험 키워드 — 지역×과목 pSEO 페이지의 title·description·본문에
 * 학년 맥락 검색어를 넣기 위한 단일 소스.
 *
 * 원칙:
 *  - 검증 가능한 교과 단원명·시험 명칭만 담는다(과장·허위·"기출 분석" 등 단정 금지).
 *  - 중등은 단원 중심, 고등은 수능/과목 중심. 과목 키는 subjects.ts 영문 slug.
 *  - subjects.ts 는 수정하지 않는다 — 확장은 이 파일에서만.
 */
export const subjectUnits: Record<string, { middle: string[]; high: string[] }> = {
  math: { middle: ["일차함수", "연립방정식"], high: ["미적분", "수열"] },
  english: { middle: ["구문독해", "내신문법"], high: ["수능독해", "어법"] },
  korean: { middle: ["문법", "비문학독해"], high: ["문학", "화법과작문"] },
  social: { middle: ["일반사회", "지리"], high: ["생활과윤리", "사회문화"] },
  science: { middle: ["물리", "화학"], high: ["통합과학", "물리학"] },
};

/** 매핑 없는 과목 폴백 — 단원 대신 일반 프레이밍. */
export const SUBJECT_UNITS_FALLBACK = { middle: ["내신·기초"], high: ["내신·수능"] } as const;

/** 과목 slug → {middle, high} 키워드. 미등록이면 폴백. */
export function getSubjectUnits(slug: string): { middle: string[]; high: string[] } {
  const u = subjectUnits[slug];
  return u ?? { middle: [...SUBJECT_UNITS_FALLBACK.middle], high: [...SUBJECT_UNITS_FALLBACK.high] };
}
