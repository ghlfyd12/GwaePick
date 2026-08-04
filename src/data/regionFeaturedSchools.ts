/**
 * 시군구별 "대표 학교" 수동 오버라이드 — 지역×과목 pSEO 의 인근 학교 노출에 우선 적용.
 *
 * 사용:
 *  - key 는 `${sidoSlug}/${sigunguSlug}` (sidoRegions.ts 기준 slug). 예: "seoul/gangnamgu".
 *  - middle/high 각각 학교 slug 배열(schools.ts 의 slug 기준), 학교급당 최대 2개.
 *  - 지정 시 그 학교를 우선 사용하고, 2개에 못 미치면 가나다순 학교로 부족분을 채운다.
 *  - 미지정(키 없음)이면 전적으로 가나다순 폴백 → lib/regionSchoolPick.ts 가 처리.
 *
 * 현재는 빈 상태(구조만). 대표 학교 데이터 채우기는 후속 작업에서 진행한다.
 * schools.ts 는 수정하지 않는다 — 오버라이드는 이 파일에서만.
 */
export const regionFeaturedSchools: Record<
  string,
  { middle?: string[]; high?: string[] }
> = {};
