import type { SchoolLevel } from "@/data/schools";

/*
 * schoolHref — 학교 카드 클릭 목적지. 현재는 상담 신청(/#consult)에 학교 컨텍스트를 쿼리로 담아 이동.
 * 추후 학교×과목 상세 페이지가 생기면 이 함수만 바꿔 끼우면 된다. (타입만 import — 데이터 미포함)
 */
export function schoolHref(
  sidoSlug: string,
  sigunguSlug: string,
  school: { slug: string; level: SchoolLevel },
) {
  const q = new URLSearchParams({
    sido: sidoSlug,
    sigungu: sigunguSlug,
    school: school.slug,
    level: school.level,
  });
  return `/#consult?${q.toString()}`;
}
