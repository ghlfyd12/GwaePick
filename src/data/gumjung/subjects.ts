/**
 * 검고의참견 급별×과목(15장) 데이터 — 승인 골격/예시 A·B 톤을 데이터로 전개.
 *
 * 페이지화 대상은 급별 필수 과목만(선택 과목은 급별 상세 안내만). 조합 검증(isGumjungSubjectAllowed)으로
 * 허용쌍만 렌더하고 그 외는 404. 워딩 절대 규칙 준수(성과·기간 보장 금지, 느낌표·금지어 없음).
 */
import type { Metadata } from "next";
import { site } from "@/data/site";
import {
  GUMJUNG_LEVELS,
  getGumjungLevel,
  type GumjungLevel,
  type GumjungSubjectRef,
} from "@/data/gumjung/levels";

const SITE_NAME = site.gumjung.name;

/** 과목별 소개 훅·h1 꼬리(예시 A/B 톤). 페이지화 6과목 전부 커버. */
const SUBJECT_COPY: Record<
  string,
  { h1Tail: string; intro: string }
> = {
  korean: {
    h1Tail: "지문 독해부터 1:1로",
    intro:
      "국어는 지문을 정확히 읽고 핵심을 잡는 연습이 중요합니다. 검정고시 국어는 출제 유형이 정해져 있어, 자주 나오는 유형부터 익히면 차근히 준비할 수 있습니다.",
  },
  math: {
    h1Tail: "필요한 개념부터 1:1로",
    intro:
      "수학은 개념이 쌓여야 풀리는 과목이라 혼자 준비하면 시간이 오래 걸리기 쉽습니다. 검정고시 수학은 출제 범위가 정해져 있어, 지금 막히는 지점부터 짚으면 준비 기간을 줄일 수 있습니다.",
  },
  english: {
    h1Tail: "기초 문법·어휘부터 1:1로",
    intro:
      "영어는 기초 문법과 어휘가 받쳐 줘야 지문이 읽힙니다. 검정고시 영어는 출제 범위가 정해져 있어, 지금 수준에 맞는 지점부터 채우면 됩니다.",
  },
  social: {
    h1Tail: "개념의 흐름부터 1:1로",
    intro:
      "사회는 개념의 흐름을 잡는 것이 먼저입니다. 검정고시 사회는 출제 범위가 정해져 있어, 핵심 개념부터 정리하면 넓은 범위도 준비할 수 있습니다.",
  },
  science: {
    h1Tail: "핵심 개념부터 1:1로",
    intro:
      "과학은 개념과 자료 해석을 유형으로 익히면 정해진 범위를 효율적으로 준비할 수 있습니다. 지금 아는 부분부터 확인하며 채웁니다.",
  },
  history: {
    h1Tail: "흐름을 잡아 1:1로",
    intro:
      "한국사는 흐름과 주요 사건을 연결해 이해하면 오래 기억에 남습니다. 검정고시 한국사는 출제 범위가 정해져 있어 핵심 사건부터 정리합니다.",
  },
};

/** 과목별 title/description 검색 키워드(전 급별 공통). 중졸 사회만 "한국사 포함" 추가. */
const SUBJECT_META_KW: Record<string, string> = {
  korean: "기출 독해",
  math: "기초부터 개념",
  english: "단어 문법 기초",
  social: "개념 정리 암기",
  science: "개념 유형 정리",
  history: "흐름 정리 암기",
};
function subjectMetaKw(levelSlug: string, subjectSlug: string): string {
  if (levelSlug === "jungjol" && subjectSlug === "social")
    return "한국사 포함 개념 정리 암기";
  return SUBJECT_META_KW[subjectSlug] ?? "";
}

/** 급별×과목 특이 범위 안내(사실). 없으면 빈 문자열. */
function subjectScopeNote(levelSlug: string, subjectSlug: string): string {
  if (levelSlug === "gojol" && subjectSlug === "social")
    return " 고졸 사회는 통합사회 범위입니다.";
  if (levelSlug === "gojol" && subjectSlug === "science")
    return " 고졸 과학은 통합과학 범위입니다.";
  if (levelSlug === "jungjol" && subjectSlug === "social")
    return " 중졸 사회는 한국사를 포함하며 세계사는 제외됩니다.";
  return "";
}

/** 급별×과목 문항·배점 사실. */
function subjectStructure(level: GumjungLevel, subjectSlug: string): string {
  const perItem =
    level.slug === "chojol"
      ? "20문항, 문항당 5점"
      : subjectSlug === "math"
        ? "20문항, 문항당 5점"
        : "25문항, 문항당 4점";
  return (
    `${level.name} 검정고시 ${labelOf(level, subjectSlug)}은 ${perItem}으로 출제됩니다` +
    `(2015 개정 교육과정 기반, 시행 공고에 따라 달라질 수 있습니다).` +
    subjectScopeNote(level.slug, subjectSlug)
  );
}

function labelOf(level: GumjungLevel, subjectSlug: string): string {
  return (
    level.requiredSubjects.find((s) => s.slug === subjectSlug)?.label ??
    subjectSlug
  );
}

export type GumjungSubjectData = {
  levelSlug: string;
  levelName: string;
  subjectSlug: string;
  subjectLabel: string;
  head: string; // "{급별} 검정고시 {과목}"
  h1: string;
  intro: string;
  structure: string;
  prepBody: string;
  metaTitle: string;
  metaDescription: string;
};

const PREP_BODY =
  "상담에서 현재 수준을 확인하고, 자주 틀리는 유형부터 단계적으로 채웁니다. 틀린 문제를 바로 확인하는 방식이라 필요한 부분에 시간을 집중할 수 있습니다.";

/** (급별, 과목)이 페이지 생성 대상인지 — 급별 필수 과목만 허용. */
export function isGumjungSubjectAllowed(
  levelSlug: string,
  subjectSlug: string,
): boolean {
  const level = getGumjungLevel(levelSlug);
  if (!level) return false;
  return level.requiredSubjects.some((s) => s.slug === subjectSlug);
}

/** (급별, 과목) → 페이지 데이터. 대상이 아니면 null(라우트에서 notFound). */
export function buildGumjungSubjectData(
  levelSlug: string,
  subjectSlug: string,
): GumjungSubjectData | null {
  const level = getGumjungLevel(levelSlug);
  if (!level) return null;
  const ref: GumjungSubjectRef | undefined = level.requiredSubjects.find(
    (s) => s.slug === subjectSlug,
  );
  if (!ref) return null;
  const copy = SUBJECT_COPY[subjectSlug];
  if (!copy) return null;

  const head = `${level.name} 검정고시 ${ref.label}`;
  const h1 = `${head}, ${copy.h1Tail}`;
  const structure = subjectStructure(level, subjectSlug);
  const kw = subjectMetaKw(level.slug, subjectSlug);
  // title/description 은 브랜드명 없이 검색 롱테일(과목 키워드 + 1:1 개인과외 공부법).
  const metaTitle = `${head} - ${kw} 1:1 개인과외 공부법`;
  const metaDescription =
    `${head} ${kw} 중심으로 1:1 개인과외로 준비합니다. 지금 수준에서 시작하고, 무료 상담으로 시작하세요.`.slice(
      0,
      158,
    );

  return {
    levelSlug: level.slug,
    levelName: level.name,
    subjectSlug,
    subjectLabel: ref.label,
    head,
    h1,
    intro: copy.intro,
    structure,
    prepBody: PREP_BODY,
    metaTitle,
    metaDescription,
  };
}

/** 급별×과목 메타데이터 빌더. og 는 청록 동적 썸네일. */
export function buildGumjungSubjectMetadata(
  levelSlug: string,
  subjectSlug: string,
): Metadata {
  const data = buildGumjungSubjectData(levelSlug, subjectSlug);
  if (!data) return {};
  const canonical = `/gumjung/${data.levelSlug}/${data.subjectSlug}`;
  const thumb = `/api/power-thumb/gumjung-subject/${data.levelSlug}/${data.subjectSlug}`;
  const thumbAlt = `${data.head} 과외 안내`;
  return {
    title: { absolute: data.metaTitle },
    description: data.metaDescription,
    alternates: { canonical },
    robots: { index: true, follow: true },
    openGraph: {
      title: data.metaTitle,
      description: data.metaDescription,
      url: canonical,
      type: "website",
      locale: "ko_KR",
      siteName: SITE_NAME,
      images: [{ url: thumb, width: 800, height: 600, alt: thumbAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title: data.metaTitle,
      description: data.metaDescription,
      images: [thumb],
    },
  };
}

/** sitemap·SSG 용 전체 (급별, 과목) 조합 — 15장(고졸 6 + 중졸 5 + 초졸 4). */
export function allGumjungSubjectPairs(): { level: string; subject: string }[] {
  const out: { level: string; subject: string }[] = [];
  for (const l of GUMJUNG_LEVELS) {
    for (const s of l.requiredSubjects) out.push({ level: l.slug, subject: s.slug });
  }
  return out;
}
