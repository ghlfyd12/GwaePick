/**
 * 학교×과목 pSEO 페이지 날짜 메타 단일 소스.
 *
 * 검색결과 신선도("N일 전") 신호용 발행일/수정일. 정직한 값만 사용한다.
 *
 * ⚠️ 갱신 규칙: SCHOOL_MODIFIED 는 **학교 페이지 콘텐츠(schools/subjects 등 데이터,
 *    카피, 상세 템플릿)가 실제로 변경될 때에만** 손으로 갱신한다.
 *    콘텐츠 불변인데 배포·빌드만으로 날짜를 굴리는 가짜 갱신은 금지.
 * SCHOOL_PUBLISHED 는 학교×과목 페이지 유형의 최초 발행일(고정, 변경 없음).
 *
 * 날짜는 ISO(YYYY-MM-DD, KST 자정 기준). article:*_time · JSON-LD dateModified 등에 사용.
 */
export const SCHOOL_PUBLISHED = "2026-06-24";
export const SCHOOL_MODIFIED = "2026-08-07";

/**
 * sitemap lastmod 단일 소스 — 페이지 유형별 정직한 최종 콘텐츠 변경일(ISO, KST 자정 기준).
 *
 * ⚠️ 갱신 기준(공통): 해당 유형 고유의 **본문·카피·메타·구조화데이터·렌더되는 내부링크
 *    구성**이 실제로 바뀐 배포에서만 손으로 갱신한다. 공유 크롬(Header/Footer/공통 신뢰섹션)·
 *    폰트 서브셋·이미지 최적화·빌드/성능 변경은 어떤 값도 올리지 않는다(가짜 신선도 금지).
 *    신규 페이지 유형을 sitemap 에 편입하면 그 유형 상수를 새로 추가해 해당 그룹에만 적용한다.
 */
/** 홈·신청(/apply)·개인정보처리방침(/privacy) 본문. */
export const CORE_MODIFIED = "2026-07-29";
/** 지역 랜딩 /[region] (템플릿·regions.ts 데이터). */
export const REGION_MODIFIED = "2026-06-24";
/** 신도시 키워드 보강된 시군구 랜딩(regionLandmarks 대상)만 — description 실변경일. 나머지 랜딩은 REGION_MODIFIED 유지. */
export const REGION_LANDMARK_MODIFIED = "2026-08-22";
/** 경기 pSEO(시도×과목·시군구×과목) — PseoLanding·regionContent·경기 데이터·렌더 링크 구성. */
export const GYEONGGI_PSEO_MODIFIED = "2026-08-13";
/** 영어 동(洞) pSEO pilot(동×과목) — DongSubjectDetail·DongHub 본문·메타. */
export const DONG_PSEO_MODIFIED = "2026-08-05";
/** 과목 단독 상세 /tutoring/by-subject/[과목] — SubjectDetail 카피·데이터. */
export const SUBJECT_MODIFIED = "2026-07-31";
/** 어학의참견(/power) 전 유형 — 지역랜딩·언어·schools·regions·performance·by-school·회화·시험 상세. */
export const POWER_MODIFIED = "2026-07-31";
