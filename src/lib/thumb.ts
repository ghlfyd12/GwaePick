/**
 * pSEO 동적 썸네일(파일럿) 공통 규칙 단일 소스.
 *
 * 대상: 고등학교(level "high") × 핵심 5과목(국어/영어/수학/사회/과학).
 * 생성 라우트(/api/thumb)·메타 og:image(lib/seo)·히어로 <img>(SchoolSubjectDetail)가
 * 모두 이 파일의 판정/경로/alt 를 공유해 파일럿 범위를 한 곳에서 관리한다.
 * (중·초등·지역·타 과목 전면 적용은 실측 후 별도 승인 — 여기 THUMB_SUBJECTS/조건만 넓히면 됨.)
 */

/** 파일럿 과목 slug(subjects.ts 앞 5개). */
export const THUMB_SUBJECTS = new Set([
  "korean",
  "english",
  "math",
  "social",
  "science",
]);

/** 썸네일 생성 대상인가 — 고교 × 핵심5과목만. level 은 schools.ts 의 코드값("high"). */
export function isThumbEligible(level: string, subjectSlug: string): boolean {
  return level === "high" && THUMB_SUBJECTS.has(subjectSlug);
}

/** 생성 라우트 경로(상대). metadataBase/원점 기준으로 절대화된다. */
export function thumbPath(schoolSlug: string, subjectSlug: string): string {
  return `/api/thumb/school/${schoolSlug}/${subjectSlug}`;
}

/** 이미지 대체 텍스트 — 금지어·느낌표 없이 "{이름} {과목} 1:1 과외 안내". */
export function thumbAlt(name: string, subjectLabel: string): string {
  return `${name} ${subjectLabel} 1:1 과외 안내`;
}

/** 출력 규격(라우트·og:image 공통). */
export const THUMB_SIZE = { width: 800, height: 600 } as const;
