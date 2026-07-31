/*
 * 과목 상세(by-subject) 히어로 이미지 오버라이드 — subjects.ts 와 분리된 별도 소스.
 * slug 로 조회해 있으면 과목별 이미지, 없으면 컴포넌트의 공용 fallback 을 쓴다.
 * 신규 과목은 여기 한 줄만 추가하면 되며 subjects.ts 는 건드리지 않는다.
 */
export const subjectHeroImages: Record<string, { src: string; alt: string }> = {
  korean: { src: "/images/subjects/korean.webp", alt: "국어 1:1 과외 수업 장면" },
  english: { src: "/images/subjects/english.webp", alt: "영어 1:1 과외 수업 장면" },
  math: { src: "/images/subjects/math.webp", alt: "수학 1:1 과외 수업 장면" },
  social: { src: "/images/subjects/social.webp", alt: "사회 1:1 과외 수업 장면" },
  science: { src: "/images/subjects/science.webp", alt: "과학 1:1 과외 수업 장면" },
  history: { src: "/images/subjects/history.webp", alt: "역사 1:1 과외 수업 장면" },
  essay: { src: "/images/subjects/essay.webp", alt: "논술 1:1 과외 수업 장면" },
  coding: { src: "/images/subjects/coding.webp", alt: "코딩 1:1 과외 수업 장면" },
};
