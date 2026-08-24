import { SCHOOLS } from "@/data/schools";
import type { School } from "@/data/schools";
import { overrideSchoolLevel } from "@/data/schoolLevelOverrides";

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

/**
 * 전국에서 같은 이름이 2곳 이상인 학교명 집합(모듈 1회 계산, 캐시).
 * slug 에 지역 접미사가 붙는 이유가 바로 이 동명이교 충돌이므로,
 * title 에 지역명을 덧붙일지 판단하는 기준으로 쓴다.
 */
let ambiguousNames: Set<string> | null = null;
export function isAmbiguousSchoolName(name: string): boolean {
  if (!ambiguousNames) {
    const count = new Map<string, number>();
    for (const sido of SCHOOLS)
      for (const sg of sido.sigungu)
        for (const s of sg.schools) count.set(s.name, (count.get(s.name) ?? 0) + 1);
    ambiguousNames = new Set(
      [...count].filter(([, n]) => n > 1).map(([n]) => n),
    );
  }
  return ambiguousNames.has(name);
}

export function findSchoolBySlug(slug: string): SchoolContext | null {
  for (const sido of SCHOOLS) {
    for (const sg of sido.sigungu) {
      const school = sg.schools.find((s) => s.slug === slug);
      if (school) {
        // 동명 학교 dedup 과정의 level 오배정 교정(schools.ts 원본 불변, slug 단위 덮어쓰기).
        const fixedLevel = overrideSchoolLevel(school.slug);
        const resolvedSchool = fixedLevel ? { ...school, level: fixedLevel } : school;
        return {
          school: resolvedSchool,
          sidoLabel: sido.label,
          sidoSlug: sido.slug,
          sigunguName: sg.name,
          sigunguSlug: sg.slug,
        };
      }
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

/**
 * 같은 시군구의 같은 학교급 학교만(현재 제외). 가나다순, limit 개까지.
 * 학교 허브(고교만 존재)에서 인접 링크가 허브 없는 학교급으로 404 나지 않게 쓴다.
 */
export function sameRegionSchoolsByLevel(
  ctx: SchoolContext,
  level: SchoolContext["school"]["level"],
  limit = 12,
): { name: string; slug: string }[] {
  const sido = SCHOOLS.find((s) => s.slug === ctx.sidoSlug);
  const sg = sido?.sigungu.find((s) => s.slug === ctx.sigunguSlug);
  if (!sg) return [];
  return sg.schools
    .filter(
      (s) =>
        s.slug !== ctx.school.slug &&
        (overrideSchoolLevel(s.slug) ?? s.level) === level,
    )
    .slice(0, limit)
    .map((s) => ({ name: s.name, slug: s.slug }));
}
