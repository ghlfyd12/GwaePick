/**
 * 학교급별 학년 키워드 구(句) — 학교×과목 pSEO description 의 "학년 포함 검색어"(예 "○○고 고2 수학과외")
 * 대응을 위한 단일 소스. lib/seo.ts 의 buildSchoolMeta 가 학교급으로 골라 description 앞부분에 삽입한다.
 *
 * 원칙:
 *  - subjects.ts 등 공유 데이터 파일과 분리 — 학년 문구 변경은 이 파일만 수정한다.
 *  - 느낌표·과장·성과 보장·대체 호칭(컨설턴트/멘토/강사) 없이 학년 토큰만 자연스러운 구로 제공.
 *  - 토큰 완전성(고1·고2·고3 등 각 학년 문자열 보존)으로 부분일치 검색을 넓힌다.
 */
import type { TitleLevel } from "@/data/seoTitlePhrases";

export const SCHOOL_GRADE_PHRASE: Record<TitleLevel, string> = {
  high: "고1·고2·고3, 예비고1까지",
  middle: "중1·중2·중3, 예비중1·예비고1까지",
  elem: "초등 저학년부터 고학년, 예비중1까지",
};
