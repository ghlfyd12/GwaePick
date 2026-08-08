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
