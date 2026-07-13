/**
 * 지역(시도+시군구) → 소속 학교 역인덱스 — 지역 페이지에서 학교 페이지로 링크하기 위한 조회용.
 *
 * 설계:
 *  - 모듈 스코프에서 SCHOOLS 를 1회 순회해 Map 을 만든다(렌더마다 전체 스캔 금지).
 *  - 키는 `${sidoSlug}/${sigunguSlug}` — 시군구 slug 는 시도 간 중복될 수 있어 시도로 스코프한다.
 *  - schools.ts 와 sidoRegions.ts 의 시군구 slug 가 정확히 일치할 때만 매칭된다(추측 매핑 금지).
 *    학교 데이터에 동(洞) 단위가 없으므로 매칭 가능한 최소 단위는 시군구다.
 *  - 학교는 이름 가나다순(결정론적). 매칭 없으면 빈 배열 → 호출부에서 블록 미노출.
 */
import { SCHOOLS } from "@/data/schools";
import type { SchoolLevel } from "@/data/schools";
import { resolveSchoolSigunguSlug } from "@/data/sigunguSlugMap";

export type IndexedSchool = { name: string; slug: string; level: SchoolLevel };

const bySigungu = new Map<string, IndexedSchool[]>();
for (const sido of SCHOOLS) {
  for (const sg of sido.sigungu) {
    const list: IndexedSchool[] = sg.schools
      .map((s) => ({ name: s.name, slug: s.slug, level: s.level }))
      .sort((a, b) => a.name.localeCompare(b.name, "ko"));
    bySigungu.set(`${sido.slug}/${sg.slug}`, list);
  }
}

/**
 * 해당 시도+시군구에 속한 학교(가나다순). 매칭 없으면 빈 배열.
 * 조회 순서: 직접 slug 일치 우선 → 미스 시 SIGUNGU_SLUG_MAP 경유(같은 시도 내 학교 시군구 slug 로 변환).
 */
export function schoolsInSigungu(
  sidoSlug: string,
  sigunguSlug: string,
): IndexedSchool[] {
  const direct = bySigungu.get(`${sidoSlug}/${sigunguSlug}`);
  if (direct) return direct;
  const mapped = resolveSchoolSigunguSlug(sidoSlug, sigunguSlug);
  if (mapped) return bySigungu.get(`${sidoSlug}/${mapped}`) ?? [];
  return [];
}
