/**
 * 학교 ↔ 지역 상호 링크 블록의 섹션 카피(순수 함수). 컴포넌트 하드코딩 금지.
 *  - 지역 페이지 → 학교 링크 블록 제목(과목 유무 분기).
 *  - 학교 페이지 → 지역 링크 블록 제목·앵커.
 * 학교 데이터가 시군구까지만 매핑되므로 제목은 시군구/시도 단위로만 표기한다(동 단위 단정 금지).
 */

/** 지역 페이지에 붙는 "이 시군구 학교" 블록 제목. subjectLabel 있으면 과목 문맥 포함. */
export const regionSchoolsTitle = (sigunguName: string, subjectLabel?: string) =>
  subjectLabel
    ? `${sigunguName} 학교별 ${subjectLabel} 과외`
    : `${sigunguName} 학교별 과외`;

/** 학교 페이지에 붙는 "지역으로 찾기" 블록 제목. */
export const schoolRegionTitle = (sidoLabel: string) => `${sidoLabel} 지역별 과외`;

/** 학교 페이지 → 시도 지역 허브 앵커 텍스트. */
export const schoolRegionLinkLabel = (sidoLabel: string) => `${sidoLabel} 지역 과외`;
