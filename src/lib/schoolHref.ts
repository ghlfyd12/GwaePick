import type { SchoolLevel } from "@/data/schools";

/*
 * 학교 링크 헬퍼(타입만 import — 데이터 미포함, 클라이언트 번들 안전).
 * - schoolDetailHref: 학교×과목 상세 페이지 경로.
 * - schoolHref: 학교 목록 카드 클릭 → 기본 과목(math) 상세로. 과목 전환은 상세의 '다른 과목'에서.
 */
const BASE = "/tutoring/by-school";
const DEFAULT_SUBJECT = "math";

export function schoolDetailHref(schoolSlug: string, subjectSlug: string) {
  return `${BASE}/${encodeURIComponent(schoolSlug)}/${subjectSlug}`;
}

export function schoolHref(
  _sidoSlug: string,
  _sigunguSlug: string,
  school: { slug: string; level: SchoolLevel },
) {
  return schoolDetailHref(school.slug, DEFAULT_SUBJECT);
}
