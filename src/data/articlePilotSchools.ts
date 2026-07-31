/**
 * 아티클형 목차 파일럿 대상 학교 집합 — 전환 우선 지역(서울 강남·양천·송파) 고등학교.
 *
 * 네이버 수집요청 front-load(scripts/reorder-naver-submission-highschool.ts 의 PRIORITY_GU)와
 * 동일 기준을 런타임에서 재현한다. SCHOOLS(읽기전용)에서 파생하므로 schools.ts 는 수정하지 않는다.
 *
 * 이 집합에 속한 학교의 핵심 5과목 페이지에만 상단 목차 + 소제목(H2) 섹션이 추가된다.
 * 집합 밖 학교·비핵심 과목 페이지는 렌더 결과가 기존과 동일하다.
 */
import { SCHOOLS } from "@/data/schools";

const SEOUL_SLUG = "seoul";
/** 전환 우선 시군구 slug — 네이버 front-load 기준과 동일. */
const PRIORITY_GU = ["gangnamgu", "yangcheongu", "songpagu"] as const;

/** 파일럿 고등학교 slug 집합(서울 강남·양천·송파 × level:"high"). */
const pilotHighSlugs: ReadonlySet<string> = (() => {
  const set = new Set<string>();
  const seoul = SCHOOLS.find((s) => s.slug === SEOUL_SLUG);
  if (!seoul) return set;
  for (const guSlug of PRIORITY_GU) {
    const sg = seoul.sigungu.find((s) => s.slug === guSlug);
    if (!sg) continue;
    for (const sc of sg.schools) if (sc.level === "high") set.add(sc.slug);
  }
  return set;
})();

/** 아티클 목차 파일럿 대상 학교인지(정확 일치). */
export function isArticlePilotSchool(schoolSlug: string): boolean {
  return pilotHighSlugs.has(schoolSlug);
}

/** 파일럿 학교 slug 전체(정적 생성 샘플·검증용). */
export function articlePilotSchoolSlugs(): string[] {
  return [...pilotHighSlugs];
}
