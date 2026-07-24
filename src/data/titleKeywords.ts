/**
 * pSEO title 서브 키워드 단일 소스 — 페이지 유형(학교/지역) × 학교급(초/중/고) 6종.
 *
 * seoTitlePhrases.ts 가 "과목별" 문구를 담당한다면, 이 파일은 "페이지 유형 + 학교급"에 따라
 * title 뒷부분에 붙는 검색 의도 키워드를 결정한다(suffix 타입 문구에만 적용).
 * 논술·코딩처럼 문구 자체에 "○○과외"가 포함된 full 타입은 여기 대상이 아니다.
 *
 * 규칙: 느낌표 미사용, 성과 보장 표현 미사용, 호칭은 선생님/상담으로만.
 * subjects.ts 는 수정하지 않는다 — 확장은 이 파일에서만.
 */

/** 페이지 유형 — 학교×과목 상세 / 지역×과목 상세. */
export type TitlePageType = "school" | "region";

/** 학교급 키 — schools.ts 의 SchoolLevel("elem")과 구분해 풀네임으로 둔다. */
export type TitleKeywordLevel = "elementary" | "middle" | "high";

export const titleKeywords: Record<
  TitlePageType,
  Record<TitleKeywordLevel, string>
> = {
  school: {
    high: "내신대비 기출 교과서 출제경향 맞춤지도",
    middle: "내신대비 선행 학년 교과서 출제경향 1:1 맞춤",
    elementary: "단원평가 고학년 사고력 노베이스 일대일 맞춤과외",
  },
  region: {
    high: "내신대비 모의고사 수능 정시 개별진도",
    middle: "내신대비 선행 예비고1 노베이스 맞춤 1:1과외",
    elementary: "초등 단원평가 기초 개념이해 사고력 일대일 맞춤과외",
  },
};

/**
 * 학교급 판별 불가(= level 미지정) 시 기본값.
 * 지역 페이지는 학년 세그먼트가 있는 경로를 빼면 학년 차원이 없어 대부분 이 값을 쓴다.
 */
export const DEFAULT_TITLE_KEYWORD_LEVEL: TitleKeywordLevel = "high";

/** schools.ts / seoTitlePhrases.ts 의 짧은 학교급 키 → 이 파일의 키. */
const LEVEL_ALIAS: Record<string, TitleKeywordLevel> = {
  elem: "elementary",
  elementary: "elementary",
  middle: "middle",
  high: "high",
};

/** 학교급 키를 정규화한다. 알 수 없으면 기본값(고등). */
export function normalizeTitleKeywordLevel(level?: string): TitleKeywordLevel {
  return (level && LEVEL_ALIAS[level]) || DEFAULT_TITLE_KEYWORD_LEVEL;
}

/** 페이지 유형 + 학교급으로 title 서브 키워드를 찾는다. */
export function resolveTitleKeyword(
  pageType: TitlePageType,
  level?: string,
): string {
  return titleKeywords[pageType][normalizeTitleKeywordLevel(level)];
}
