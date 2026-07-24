/**
 * 어학의참견(/power) 유형 B — 학교×언어 수행평가 상세페이지 콘텐츠·메타 단일 소스.
 *
 * /power/performance/[school]/[lang] 라우트가 이 파일의 빌더를 쓴다.
 * 메인 pSEO(lib/seo.ts)는 재사용하지 않는다 — /power 전용 톤·"어학의참견" 접미사·퍼플 스코프가 다르다.
 * (언어 상세 languageDetail.ts 와 같은 패턴: 데이터 + build*Metadata 빌더.)
 *
 * 워딩 규칙: "선생님 / 상담 선생님 / 원어민 선생님" 로 통일. 금지어(컨설턴트·컨설팅·코치·코칭·
 *   멘토·강사)·느낌표·성과 보장 문구 미사용. 색은 accent 토큰(퍼플)만, 코랄 하드코딩 금지.
 */
import type { Metadata } from "next";
import { site } from "@/data/site";
import { findSchoolBySlug } from "@/lib/findSchool";
import {
  getPowerSchoolEntry,
  offeredLangs,
  type PowerLang,
  type PowerSchoolKind,
} from "@/data/powerSchoolDepts";

/** 언어 slug → 화면 표기 언어명. */
export const POWER_LANG_LABEL: Record<PowerLang, string> = {
  english: "영어",
  chinese: "중국어",
  japanese: "일본어",
};

/**
 * title 뒤에 붙는 검색 키워드(단일 소스 — 사용자가 이 두 상수만 바꾸면 전 페이지 반영).
 * 문구가 "수행평가"로 시작하므로 title 조립 시 "{학교} {언어} " 뒤에 그대로 붙여
 * "수행평가"가 한 번만 나오게 한다(중복 방지). 느낌표·금지어 없음.
 */
export const PERFORMANCE_KEYWORD: Record<"foreign" | "intl", string> = {
  foreign: "수행평가 내신 말하기 에세이 원어민 1:1",
  intl: "수행평가 내신 에세이 발표 원어민 1:1",
};

const keywordFor = (kind: PowerSchoolKind): string =>
  kind === "foreign" ? PERFORMANCE_KEYWORD.foreign : PERFORMANCE_KEYWORD.intl;

/** 학과명을 본문에 자연스럽게 넣을 수 있는 실제 학과인지(…과 로 끝나는 명칭만). */
function realDept(deptLabel?: string): string | null {
  return deptLabel && deptLabel.endsWith("과") ? deptLabel : null;
}

/* ── 언어별 수행평가 특화 콘텐츠(롱테일 키워드를 본문·FAQ에 심는다) ── */
export type PerfEvalType = { title: string; desc: string };

const EVAL_TYPES: Record<PowerLang, PerfEvalType[]> = {
  english: [
    { title: "말하기·프레젠테이션", desc: "주제 발표와 인터뷰형 말하기, 즉석 질의응답까지 원어민 선생님과 실전으로 연습합니다." },
    { title: "에세이·서술형 쓰기", desc: "개요 잡기부터 논지 전개, 문단 구성과 첨삭까지 에세이 수행평가의 흐름을 함께 다집니다." },
    { title: "듣기·독해 통합", desc: "지문 이해와 요약, 근거 찾기를 반복해 듣기·독해가 함께 걸린 과제에 대비합니다." },
  ],
  chinese: [
    { title: "말하기·성조·발음", desc: "성조와 병음 발음을 원어민 선생님과 바로잡아, 말하기 수행평가에서 자연스럽게 이어 말하도록 연습합니다." },
    { title: "듣기·받아쓰기", desc: "익힌 어휘로 문장을 듣고 옮겨 적는 연습을 반복해, 듣기·받아쓰기 과제의 정확도를 올립니다." },
    { title: "작문·서술형", desc: "어법에 맞춘 짧은 글쓰기부터 주제 작문까지, 서술형 평가의 문장 구성을 단계별로 익힙니다." },
  ],
  japanese: [
    { title: "말하기·회화", desc: "발음과 억양을 원어민 선생님과 맞추고, 상황별 회화로 말하기 수행평가를 준비합니다." },
    { title: "히라가나·가타카나·한자", desc: "글자와 한자 쓰기의 기초를 다지고, 표기 정확도가 걸린 과제를 차근히 대비합니다." },
    { title: "경어·서술형 표현", desc: "정중한 경어 표현과 문형을 익혀, 서술형·작문 평가에서 상황에 맞는 문장을 쓰도록 연습합니다." },
  ],
};

/** 언어별 특화어 2개 — description 에 자연스럽게 넣을 키워드(문장으로 풀어 씀). */
const LANG_TERMS: Record<PowerLang, string> = {
  english: "에세이와 발표",
  chinese: "성조와 발음",
  japanese: "히라가나와 경어 표현",
};

export type PerformancePageData = {
  schoolSlug: string;
  lang: PowerLang;
  langLabel: string;
  kind: PowerSchoolKind;
  /** schools.ts 약칭 그대로(검색어 일치). */
  schoolName: string;
  regionName: string;
  /** 본문에 표기할 실제 학과명(없으면 null — 국제고·중·영어 중심 교육과정). */
  deptLabel: string | null;
  /** title 앞부분 = h1. */
  head: string;
  keyword: string;
  metaTitle: string;
  metaDescription: string;
  evalTypes: PerfEvalType[];
  intro: string;
  faq: { q: string; a: string }[];
  /** 같은 학교의 다른 생성 언어(상호 링크). */
  siblingLangs: { lang: PowerLang; label: string }[];
};

/** description 회전(경로 해시 기반, 배포 간 안정) — 전 변형에 수행평가·내신 + 언어 특화어 포함. */
function hashSlug(s: string): number {
  let h = 0;
  for (const ch of s) h = (h * 31 + (ch.codePointAt(0) ?? 0)) >>> 0;
  return h;
}

function buildDescriptions(p: {
  schoolName: string;
  langLabel: string;
  terms: string;
}): string[] {
  const { schoolName: S, langLabel: L, terms: T } = p;
  return [
    `${S} ${L} 수행평가와 내신을 함께 준비하고 계신가요. 직접 가르쳐 온 상담 선생님이 학교 진도와 평가 유형을 먼저 파악하고, ${T}까지 호흡이 맞는 선생님을 1:1로 연결해 드립니다. 첫 상담은 무료입니다.`,
    `${S} 재학생의 ${L} 수행평가·내신 관리를 1:1로 돕습니다. 상담 선생님이 학교 평가 방식을 확인하고 ${T}를 포함한 과제 흐름에 맞춰 수업할 선생님을 연결해 드립니다. 무료 상담으로 시작하세요.`,
    `${S} ${L} 수행평가가 학원 단체 수업으로 잡히지 않는다면 1:1 맞춤이 답입니다. 상담 선생님이 내신과 ${T}까지 함께 챙길 선생님을 찾아 연결해 드리며, 잘 맞지 않으면 다시 연결해 드립니다.`,
  ];
}

/** (학교, 언어) → 페이지 데이터. 대상이 아니면 null(라우트에서 notFound). */
export function buildPerformanceData(
  schoolSlug: string,
  lang: PowerLang,
): PerformancePageData | null {
  const entry = getPowerSchoolEntry(schoolSlug);
  if (!entry) return null;
  const info = entry.langs[lang];
  if (!info.offered || !info.verified) return null;

  const ctx = findSchoolBySlug(schoolSlug);
  if (!ctx) return null;

  const schoolName = ctx.school.name;
  const regionName = ctx.sigunguName;
  const langLabel = POWER_LANG_LABEL[lang];
  const deptLabel = realDept(info.deptLabel);
  const kind = entry.kind;
  const keyword = keywordFor(kind);
  const head = `${schoolName} ${langLabel} 수행평가`;
  const metaTitle = `${head} ${keyword.replace(/^수행평가\s*/, "")} | 어학의참견`;
  // 위 조립은 "{학교} {언어} 수행평가 {키워드에서 수행평가 뒤}" → 수행평가 1회.

  const terms = LANG_TERMS[lang];
  const metaDescription = buildDescriptions({ schoolName, langLabel, terms })[
    hashSlug(`${schoolSlug}/${lang}`) % 3
  ];

  // 도입 2~3문장 — 국제고·중은 학과 언급 없이, 외고 통합과형은 deptLabel 자연 표기.
  const kindWord = kind === "intl-middle" ? "국제중" : kind === "intl-high" ? "국제고" : "외고";
  const openingSubject = deptLabel
    ? `${schoolName} ${deptLabel} 재학생이라면`
    : `${schoolName} 재학생이라면`;
  const intro =
    kind === "foreign"
      ? `${openingSubject} ${langLabel} 수행평가와 내신 관리가 늘 함께 걸립니다. 말하기와 쓰기, 발표가 한 학기에 몰리는 ${kindWord} 평가 특성상, 학교 진도와 출제 방식을 아는 선생님과 1:1로 준비하는 편이 안전합니다. 지식의참견 상담 선생님이 지금 상황을 먼저 듣고 맞는 선생님을 연결해 드립니다.`
      : `${openingSubject} 영어 수행평가와 내신이 학교생활의 큰 축입니다. 에세이와 발표, 토론이 자주 걸리는 ${kindWord} 평가 특성상, 학교 진도와 평가 방식을 아는 선생님과 1:1로 준비하는 편이 안전합니다. 지식의참견 상담 선생님이 지금 상황을 먼저 듣고 맞는 선생님을 연결해 드립니다.`;

  const faq = buildFaq({ schoolName, langLabel, kind });

  const siblingLangs = offeredLangs(schoolSlug)
    .filter((l) => l !== lang)
    .map((l) => ({ lang: l, label: POWER_LANG_LABEL[l] }));

  return {
    schoolSlug,
    lang,
    langLabel,
    kind,
    schoolName,
    regionName,
    deptLabel,
    head,
    keyword,
    metaTitle,
    metaDescription,
    evalTypes: EVAL_TYPES[lang],
    intro,
    faq,
    siblingLangs,
  };
}

function buildFaq(p: {
  schoolName: string;
  langLabel: string;
  kind: PowerSchoolKind;
}): { q: string; a: string }[] {
  const { schoolName: S, langLabel: L } = p;
  return [
    {
      q: `${S} ${L} 수행평가는 어떻게 준비하나요.`,
      a: `학교 진도와 평가 유형을 먼저 확인한 뒤, 말하기·쓰기·발표 등 실제로 걸리는 과제 중심으로 1:1 수업을 설계합니다. 상담 선생님이 지금 수준을 듣고 호흡이 맞는 선생님을 연결해 드립니다.`,
    },
    {
      q: `내신과 수행평가를 같이 볼 수 있나요.`,
      a: `네. 정기고사 대비와 수행평가 준비를 한 선생님이 함께 관리하도록 연결해 드립니다. 시험 기간에는 내신에, 과제 기간에는 수행평가에 시간을 나눠 진행합니다.`,
    },
    {
      q: `기초가 부족해도 시작할 수 있나요.`,
      a: `지금 수준부터 시작합니다. 기초가 필요하면 개념부터, 과제가 급하면 해당 평가부터 잡아 갑니다. 먼저 무료 상담으로 상황을 알려 주시면 맞는 선생님을 찾아 드립니다.`,
    },
  ];
}

/** /power 전용 메타데이터 빌더 — 언어 상세(buildLanguageMetadata)와 같은 형식. */
export function buildPerformanceMetadata(
  schoolSlug: string,
  lang: PowerLang,
): Metadata {
  const data = buildPerformanceData(schoolSlug, lang);
  if (!data) return {};
  const canonical = `/power/performance/${schoolSlug}/${lang}`;
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
      siteName: site.name,
      images: [site.ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: data.metaTitle,
      description: data.metaDescription,
      images: [site.ogImage],
    },
  };
}
