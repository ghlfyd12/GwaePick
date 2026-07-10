/**
 * 학교급×과목 고유 콘텐츠의 변형(variant) 결정론적 선택.
 *
 * 규칙: 학교 slug 문자열의 문자코드 합을 해시로 삼아 변형을 고른다.
 *   - Math.random() 등 비결정 로직 금지 — ISR 재생성 시에도 같은 학교는 항상 같은 콘텐츠가 나와야 한다.
 *   - 같은 학교 slug + 같은 과목이면 언제 호출해도 같은 변형이 선택된다.
 */

import {
  schoolContent,
  type SchoolContentVariant,
  type ContentLevel,
} from "@/data/schoolContent";

/** 학교 slug → 문자코드 합. 결정론적 해시(정렬·순서 무관하게 slug 문자열 고정). */
export function hashSlug(slug: string): number {
  let sum = 0;
  for (let i = 0; i < slug.length; i += 1) {
    sum += slug.charCodeAt(i);
  }
  return sum;
}

/** LEVEL_LABEL("초등학교"/"중학교"/"고등학교") → 콘텐츠 레벨 키. */
const LEVEL_KEY: Record<string, ContentLevel> = {
  초등학교: "elem",
  중학교: "middle",
  고등학교: "high",
};

/**
 * 학교급(levelLabel)×과목(subjectSlug)에 맞는 변형 하나를 결정론적으로 반환.
 * 해당 조합 데이터가 없으면 null(컴포넌트에서 섹션 미표시).
 */
export function selectSchoolContent(
  schoolSlug: string,
  levelLabel: string,
  subjectSlug: string,
): SchoolContentVariant | null {
  const level = LEVEL_KEY[levelLabel];
  if (!level) return null;
  const variants = schoolContent[level]?.[subjectSlug];
  if (!variants || variants.length === 0) return null;
  const index = hashSlug(schoolSlug) % variants.length;
  return variants[index];
}
