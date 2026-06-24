import { SCHOOLS } from "@/data/schools";
import type { School } from "@/data/schools";

/*
 * 학교 slug 로 학교 + 소속 지역(시도/시군구)을 찾는다(서버 전용 — SCHOOLS 730KB 순회).
 * 학교 상세 라우트가 slug 만 받으므로 전체 검색. slug 충돌 시 첫 매칭 사용.
 */
export type SchoolContext = {
  school: School;
  sidoLabel: string;
  sidoSlug: string;
  sigunguName: string;
  sigunguSlug: string;
};

export function findSchoolBySlug(slug: string): SchoolContext | null {
  for (const sido of SCHOOLS) {
    for (const sg of sido.sigungu) {
      const school = sg.schools.find((s) => s.slug === slug);
      if (school)
        return {
          school,
          sidoLabel: sido.label,
          sidoSlug: sido.slug,
          sigunguName: sg.name,
          sigunguSlug: sg.slug,
        };
    }
  }
  return null;
}

/**
 * 같은 시군구의 다른 학교(현재 제외). 같은 학교급 우선, 부족하면 같은 시군구 전체에서 보충.
 * 가나다순. limit 개까지.
 */
export function sameRegionSchools(
  ctx: SchoolContext,
  limit = 12,
): { name: string; slug: string }[] {
  const sido = SCHOOLS.find((s) => s.slug === ctx.sidoSlug);
  const sg = sido?.sigungu.find((s) => s.slug === ctx.sigunguSlug);
  if (!sg) return [];
  const others = sg.schools.filter((s) => s.slug !== ctx.school.slug);
  const sameLevel = others.filter((s) => s.level === ctx.school.level);
  const rest = others.filter((s) => s.level !== ctx.school.level);
  return [...sameLevel, ...rest]
    .slice(0, limit)
    .map((s) => ({ name: s.name, slug: s.slug }));
}
