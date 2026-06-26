/**
 * pSEO 과목/학년 데이터 + 공통 상수.
 *
 * slug 는 한글(URL 자동 인코딩). 컴포넌트/페이지에 하드코딩 금지 — 이 파일에서만 사용.
 */
export interface Subject {
  slug: string;
  label: string;
}
export const subjects: Subject[] = [
  { slug: "국어", label: "국어" },
  { slug: "영어", label: "영어" },
  { slug: "수학", label: "수학" },
  { slug: "사회", label: "사회" },
  { slug: "과학", label: "과학" },
  { slug: "역사", label: "역사" },
  { slug: "논술", label: "논술" },
  { slug: "코딩", label: "코딩" },
];
export const subjectBySlug: Record<string, Subject> = Object.fromEntries(
  subjects.map((s) => [s.slug, s]),
);

export interface Grade {
  slug: string;
  label: string;
}
export const grades: Grade[] = [
  { slug: "초등", label: "초등" },
  { slug: "중등", label: "중등" },
  { slug: "고등", label: "고등" },
];
export const gradeBySlug: Record<string, Grade> = Object.fromEntries(
  grades.map((g) => [g.slug, g]),
);

/** 지도/입구에서 지역만 클릭했을 때 진입하는 기본 과목. */
export const DEFAULT_SUBJECT = "수학";

/** pSEO 경로의 1번째 세그먼트(한글 시도 라벨). 현재 경기만 데이터 보유. */
export const PSEO_SIDO = "경기";

/** URL 파라미터를 데이터 slug 와 비교 가능한 형태로(퍼센트 디코딩 + 한글 NFC). */
export const slugKey = (s: string) => {
  try {
    return decodeURIComponent(s).normalize("NFC");
  } catch {
    return s.normalize("NFC");
  }
};

/** pSEO 경로 빌더 — 1번째 세그먼트는 한글 시도 라벨(PSEO_SIDO). */
const BASE = "/tutoring/by-region";
export const pseoHref = {
  sidoSubject: (subject: string) => `${BASE}/${PSEO_SIDO}/${subject}`,
  sigunguSubject: (sigunguSlug: string, subject: string) =>
    `${BASE}/${PSEO_SIDO}/${sigunguSlug}/${subject}`,
  dongSubject: (sigunguSlug: string, dongSlug: string, subject: string) =>
    `${BASE}/${PSEO_SIDO}/${sigunguSlug}/${dongSlug}/${subject}`,
  dongGradeSubject: (
    sigunguSlug: string,
    dongSlug: string,
    grade: string,
    subject: string,
  ) => `${BASE}/${PSEO_SIDO}/${sigunguSlug}/${dongSlug}/${grade}/${subject}`,
};
