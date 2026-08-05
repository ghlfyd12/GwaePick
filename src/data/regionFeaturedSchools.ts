/**
 * 시군구별 "대표 학교" 수동 오버라이드 — 지역×과목 pSEO 의 인근 학교 노출에 우선 적용.
 *
 * 사용:
 *  - key 는 `${sidoSlug}/${sigunguSlug}` (sidoRegions.ts route slug 기준). 예: "seoul/gangnamgu".
 *  - middle/high 각각 학교 slug 배열(schools.ts 의 slug 기준), 학교급당 최대 2개.
 *  - 지정 시 그 학교를 우선 사용하고, 2개에 못 미치면 가나다순 학교로 부족분을 채운다.
 *  - 미지정(키 없음)이면 전적으로 가나다순 폴백 → lib/regionSchoolPick.ts 가 처리.
 *
 * 선정 규칙(내신 일반고 우선): 교명에 특성화·특목 문자열(공업/상업/정보/예술/체육/외고/과학고/국제/
 *   마이스터/디자인/인공지능 등)이 포함된 학교는 제외하고 남은 일반계 중 가나다순 상위 2개.
 *   교명 필터를 통과했더라도 교명 변경 이력이 의심되면 사용자 확인 후 확정한다.
 *   (예: 안양 근명고 → 특성화고(구 근명여자정보고) 확인되어 제외, 다음 후보 동안고로 교체.)
 *
 * 경기 시 단위 주의: schools.ts 는 성남·고양·안양·수원을 시 단위로 저장하지만 route 는 구 단위이므로,
 *   한 시의 모든 구 slug 에 같은 대표 학교 세트를 반복 지정한다(시 단위 적용).
 *
 * schools.ts 는 수정하지 않는다 — 오버라이드는 이 파일에서만.
 */

// 시 단위 세트(경기) — 여러 구 route 에 동일 적용.
const SEONGNAM = { middle: ["geumgwangjung", "nagwonjung"], high: ["naksaenggo", "neulpureungo"] };
const GOYANG = { middle: ["garamjung", "goyangsongsanjung"], high: ["gajwago", "goyanggo"] };
const ANYANG = { middle: ["gwanyangjung", "gwiinjung"], high: ["gwanyanggo", "dongango"] };
const SUWON = { middle: ["gosaekjung", "gokbanjung"], high: ["gyemyeonggo", "gosaekgo"] };

export const regionFeaturedSchools: Record<
  string,
  { middle?: string[]; high?: string[] }
> = {
  // 서울 노원구 — 고등 가나다 상위가 공고·인공지능고라 일반고로 교체.
  "seoul/nowongu": { middle: ["gongreungjung", "gwangunjung"], high: ["nowongo", "daejingo"] },

  // 경기 성남시 (분당·수정·중원) — 중등 가나다 상위 예술중 제외.
  "gyeonggi/seongnamsibundanggu": SEONGNAM,
  "gyeonggi/seongnamsisujeonggu": SEONGNAM,
  "gyeonggi/seongnamsijungwongu": SEONGNAM,

  // 경기 고양시 (덕양·일산동·일산서) — 고등 가나다 상위 영상과학고 제외.
  "gyeonggi/goyangsideogyanggu": GOYANG,
  "gyeonggi/goyangsiilsandonggu": GOYANG,
  "gyeonggi/goyangsiilsanseogu": GOYANG,

  // 경기 안양시 (동안·만안) — 고등 가나다 상위 마이스터고 제외, 근명고(특성화) 교체 → 동안고.
  "gyeonggi/anyangsidongangu": ANYANG,
  "gyeonggi/anyangsimanangu": ANYANG,

  // 경기 수원시 (권선·영통·장안·팔달) — 중등 체육중·고등 과학고/체육고 제외.
  "gyeonggi/suwonsigwonseongu": SUWON,
  "gyeonggi/suwonsiyeongtonggu": SUWON,
  "gyeonggi/suwonsijangangu": SUWON,
  "gyeonggi/suwonsipaldalgu": SUWON,
};
