/**
 * pSEO 동적 썸네일 공통 규칙 단일 소스.
 *
 * 대상(확장): 학교×과목(초·중·고 전체 × 8과목) · 지역(동)×과목 · 과목 상세 8종 · 지역 랜딩.
 * 생성 라우트(/api/thumb)·메타 og:image(lib/seo)·히어로 <img>(SchoolSubjectDetail)가 이 파일의
 * 판정/경로/alt 를 공유한다. 디자인·규격·캐시·폰트는 불변(허용 범위와 연결만 확장).
 *
 * 텍스트 규칙(라우트 layout 참조): 중·고=학교명(≤4자)/"{과목}과외"(≥5자 "1:1" 폴백),
 * 초등=시군구/"1:1 {과목}과외", 지역(동)=동명/"{과목}과외", 과목=" {과목}과외"/"1:1 내신 기출",
 * 랜딩=지명/"1:1 과외". 코랄 #FF6B4A, 느낌표·서비스어 금지.
 */

/** 썸네일 대상 과목 slug — subjects.ts 8과목 전체. */
export const THUMB_SUBJECTS = new Set([
  "korean",
  "english",
  "math",
  "social",
  "science",
  "history",
  "essay",
  "coding",
]);

/**
 * 학교×과목 썸네일 대상인가 — 초·중·고 전체 × 8과목(레벨 제한 없음).
 * (기존 고교×핵심5 은 이 집합의 부분집합이라 og:image URL 이 동일 → diff 0.)
 */
export function isThumbEligible(_level: string, subjectSlug: string): boolean {
  return THUMB_SUBJECTS.has(subjectSlug);
}

/* ── 경로 빌더(상대 — metadataBase 로 절대화) ────────────────────────────── */

/** 학교×과목: /api/thumb/school/{학교slug}/{과목slug}. */
export function thumbPath(schoolSlug: string, subjectSlug: string): string {
  return `/api/thumb/school/${schoolSlug}/${subjectSlug}`;
}

/** 지역(동)×과목: /api/thumb/region/{sido~시군구~동}/{과목slug}. sido/sg/dong 은 페이지 세그먼트 slug. */
export function regionThumbPath(
  sidoSlug: string,
  sigunguSlug: string,
  dongSlug: string,
  subjectSlug: string,
): string {
  const packed = `${sidoSlug}~${sigunguSlug}~${dongSlug}`;
  return `/api/thumb/region/${encodeURIComponent(packed)}/${subjectSlug}`;
}

/** 과목 상세: /api/thumb/subject/{과목slug}/_ (3번째 세그먼트는 자리표시자). */
export function subjectThumbPath(subjectSlug: string): string {
  return `/api/thumb/subject/${subjectSlug}/_`;
}

/** 지역 랜딩: /api/thumb/landing/{regionId}/_ (regionId 는 한글 id, 예 "서울-노원구"·"은행사거리"). */
export function landingThumbPath(regionId: string): string {
  return `/api/thumb/landing/${encodeURIComponent(regionId)}/_`;
}

/* ── alt 텍스트(금지어·느낌표 없이) ─────────────────────────────────────── */

/** 학교 alt — 기존 형식 유지("{이름} {과목} 1:1 과외 안내")로 고교×5 diff 0. */
export function thumbAlt(name: string, subjectLabel: string): string {
  return `${name} ${subjectLabel} 1:1 과외 안내`;
}

/** 지역(동)×과목 alt. */
export function regionThumbAlt(dongName: string, subjectLabel: string): string {
  return `${dongName} ${subjectLabel} 과외 안내`;
}

/** 과목 상세 alt. */
export function subjectThumbAlt(subjectLabel: string): string {
  return `${subjectLabel} 1:1 과외 안내`;
}

/** 지역 랜딩 alt. */
export function landingThumbAlt(regionName: string): string {
  return `${regionName} 과외 안내`;
}

/** 출력 규격(라우트·og:image 공통) — 불변. */
export const THUMB_SIZE = { width: 800, height: 600 } as const;
