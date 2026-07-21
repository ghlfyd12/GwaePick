/**
 * pSEO title 문구 단일 소스 — 지역×과목 / 학교×과목 페이지의 <title> 뒷부분 문구.
 *
 * subjects.ts 는 건드리지 않고(과목 카피 소스), 검색 의도 키워드만 이 파일에서 관리한다.
 * 문구를 바꾸고 싶으면 이 파일만 수정하면 되고 lib/seo.ts·라우트 재수정은 필요 없다.
 *
 * 문구 타입 2종:
 *  - suffix : "{지역/학교} {과목}과외 " 뒤에 붙는다.
 *  - full   : "{과목}과외" 부분까지 통째로 대체한다(문구에 이미 "○○과외"가 들어 있는 경우).
 *
 * 규칙: 느낌표·"매칭"·"선생님" 미사용(title 한정. 본문·h1 은 기존 유지).
 */
import { subjects } from "@/data/subjects";

/** 학교급 — schools.ts 의 SchoolLevel 과 동일한 값 체계. */
export type TitleLevel = "elem" | "middle" | "high";

export type TitlePhrase =
  | { type: "suffix"; text: string }
  | { type: "full"; text: string };

/** 조회 실패 시 최소 문구 — title 이 비거나 undefined 로 새지 않도록. */
export const FALLBACK_TITLE_PHRASE: TitlePhrase = { type: "suffix", text: "맞춤수업" };

/* ── 과목별 기본 문구(고등 기준). 학교급 override 가 있으면 그쪽이 우선. ── */
const HIGH_SUFFIX: TitlePhrase = { type: "suffix", text: "내신대비 수능 정시준비 맞춤수업" };

export const seoTitlePhrases: Record<string, TitlePhrase> = {
  korean: HIGH_SUFFIX,
  english: HIGH_SUFFIX,
  math: HIGH_SUFFIX,
  social: HIGH_SUFFIX,
  science: HIGH_SUFFIX,
  history: HIGH_SUFFIX,
  // 논술·코딩은 문구에 이미 "○○과외"가 들어 있어 full 타입(중복 방지). 학교급 무관 동일 문구.
  essay: { type: "full", text: "1:1 논술과외 내신대비 독서 첨삭 맞춤수업" },
  coding: {
    type: "full",
    text: "1:1 코딩과외 파이썬 자바스크립트 웹개발 게임제작 정보내신 맞춤수업",
  },
};

/* ── 학교급 override — 학교급(또는 학년)을 알 수 있는 페이지에서만 적용. ── */
const ELEM_SUFFIX: TitlePhrase = { type: "suffix", text: "기초 학습습관 맞춤수업" };
const MIDDLE_SUFFIX: TitlePhrase = { type: "suffix", text: "내신대비 고입준비 맞춤수업" };

export const seoTitlePhrasesByLevel: Record<TitleLevel, Record<string, TitlePhrase>> = {
  elem: {
    korean: ELEM_SUFFIX,
    english: ELEM_SUFFIX,
    math: ELEM_SUFFIX,
    social: ELEM_SUFFIX,
    science: ELEM_SUFFIX,
    history: ELEM_SUFFIX,
  },
  middle: {
    korean: MIDDLE_SUFFIX,
    english: MIDDLE_SUFFIX,
    math: MIDDLE_SUFFIX,
    social: MIDDLE_SUFFIX,
    science: MIDDLE_SUFFIX,
    history: MIDDLE_SUFFIX,
  },
  // high 는 기본값(seoTitlePhrases) 그대로 사용.
  high: {},
};

/** 과목이 없는 지역 허브(구 허브·동 허브) title 문구. */
export const REGION_HUB_TITLE_PHRASE = "1:1 초등 중등 고등학생 개인 맞춤수업 전문";

/** 학년 라벨(경기 레거시 pSEO 의 초등/중등/고등) → 학교급 키. */
export const titleLevelByGradeLabel: Record<string, TitleLevel> = {
  초등: "elem",
  중등: "middle",
  고등: "high",
};

/**
 * 과목 라벨 → subjects.ts slug.
 * 경기 레거시 라우트는 한글 slug(pseo.ts)를 쓰므로 라벨로 역매핑해 같은 문구 표를 공유한다.
 */
const slugByLabel: Record<string, string> = Object.fromEntries(
  subjects.map((s) => [s.label, s.slug]),
);

/**
 * 과목 slug(영문) 또는 라벨(한글)로 title 문구를 찾는다.
 * 학교급이 주어지면 override 를 먼저 보고, 없으면 기본값, 그것도 없으면 fallback.
 */
export function resolveTitlePhrase(p: {
  slug?: string;
  label?: string;
  level?: TitleLevel;
}): TitlePhrase {
  const key =
    (p.slug && seoTitlePhrases[p.slug] ? p.slug : undefined) ??
    (p.label ? slugByLabel[p.label] : undefined) ??
    p.slug;
  if (!key) return FALLBACK_TITLE_PHRASE;
  const override = p.level ? seoTitlePhrasesByLevel[p.level]?.[key] : undefined;
  return override ?? seoTitlePhrases[key] ?? FALLBACK_TITLE_PHRASE;
}
