/**
 * 지역(시군구) → 인근 학교(중2·고2) 선택 + 지역×과목 title 조립(길이 폴백 포함).
 *
 * 선택 규칙:
 *  1) regionFeaturedSchools 에 지정된 학교 slug 를 우선 사용(지정 순서 유지).
 *  2) 2개에 못 미치면 schoolsInSigungu 가나다순으로 부족분을 채운다(중복 제외).
 *  3) 학교 데이터는 시군구까지만 매핑되므로(동 단위 없음), 같은 시군구의 동은 같은 목록을 공유한다.
 *
 * title 길이 폴백(학교세그먼트 기준):
 *  - "중1·고1" 세그먼트가 SEGMENT_MAX 초과 → 중학교 1개만 노출.
 *  - 그 단일 학교명도 SEGMENT_MAX 초과 → 학교 생략(시군구 폴백 title).
 */
import { schoolsInSigungu, type IndexedSchool } from "@/lib/schoolRegionIndex";
import { regionFeaturedSchools } from "@/data/regionFeaturedSchools";

const GRADE_TAIL = "중1 중2 중3 고1 고2 고3 1:1";
/** 학교세그먼트("중1·고1") 최대 길이(공백 포함 글자수). 초과 시 폴백. */
const SEGMENT_MAX = 10;

export type RegionSchoolPick = {
  middleSchools: IndexedSchool[];
  highSchools: IndexedSchool[];
};

/** 오버라이드(지정 slug) → 가나다순 폴백으로 학교급별 최대 2개를 채운다. */
function pickLevel(
  pool: IndexedSchool[],
  overrideSlugs: string[] | undefined,
  max = 2,
): IndexedSchool[] {
  const bySlug = new Map(pool.map((s) => [s.slug, s]));
  const picked: IndexedSchool[] = [];
  const used = new Set<string>();
  for (const slug of overrideSlugs ?? []) {
    const s = bySlug.get(slug);
    if (s && !used.has(s.slug)) {
      picked.push(s);
      used.add(s.slug);
    }
    if (picked.length >= max) break;
  }
  // 부족분은 가나다순(pool 은 schoolRegionIndex 에서 이미 가나다순) 으로 보충.
  for (const s of pool) {
    if (picked.length >= max) break;
    if (!used.has(s.slug)) {
      picked.push(s);
      used.add(s.slug);
    }
  }
  return picked;
}

/** 시군구의 인근 학교 — 중2·고2(오버라이드 우선 → 가나다순). */
export function pickRegionSchools(
  sidoSlug: string,
  sigunguSlug: string,
): RegionSchoolPick {
  const pool = schoolsInSigungu(sidoSlug, sigunguSlug);
  const override = regionFeaturedSchools[`${sidoSlug}/${sigunguSlug}`];
  const middlePool = pool.filter((s) => s.level === "middle");
  const highPool = pool.filter((s) => s.level === "high");
  return {
    middleSchools: pickLevel(middlePool, override?.middle),
    highSchools: pickLevel(highPool, override?.high),
  };
}

/**
 * 지역×과목 title — A안: "{동} {과목}과외 | {중1}·{고1} 내신 대비 {학년꼬리}".
 * 학교세그먼트 길이 폴백 → 중학교 1개만 → 학교 생략(시군구 폴백).
 */
export function buildRegionDongTitle(p: {
  dong: string;
  subjectLabel: string;
  sigunguName: string;
  mid1?: string;
  high1?: string;
}): string {
  const base = `${p.dong} ${p.subjectLabel}과외`;
  const both = p.mid1 && p.high1 ? `${p.mid1}·${p.high1}` : "";
  if (both && both.length <= SEGMENT_MAX) {
    return `${base} | ${both} 내신 대비 ${GRADE_TAIL}`;
  }
  // 단일 학교(중학교 우선, 없으면 고등학교)로 축약 시도.
  const single = p.mid1 ?? p.high1;
  if (single && single.length <= SEGMENT_MAX) {
    return `${base} | ${single} 내신 대비 ${GRADE_TAIL}`;
  }
  // 학교 생략 — 시군구 폴백.
  return `${base} | ${p.sigunguName} 중1 중2 중3 고1 고2 고3 내신·기초 1:1`;
}
