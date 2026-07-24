/**
 * 어학의참견(/power) 유형 A — 학교×어학과목 상세페이지 콘텐츠·메타 단일 소스.
 *
 * /power/by-school/[school]/[subject] 라우트가 쓴다. 타겟은 입학 준비생·재학생의 어학 수업 수요.
 * 유형 B(수행평가)와 검색 의도를 분리한다 → title·h1·본문에 "수행평가" 단어를 쓰지 않는다
 *   (유형 B 페이지로 가는 내부 링크 앵커 텍스트에서만 허용).
 *
 * 메인 pSEO(lib/seo.ts)는 재사용하지 않는다 — /power 전용 톤·"어학의참견" 접미사·퍼플 스코프.
 * 워딩 규칙: "선생님 / 상담 선생님 / 원어민 선생님 / 원어민·교포 선생님" 로 통일.
 *   금지어(컨설턴트·컨설팅·코치·코칭·멘토·강사)·느낌표·성과 보장 문구 미사용.
 *   "원어민 강사"(X) → "원어민 선생님"(O). 색은 accent 토큰(퍼플)만, 코랄 하드코딩 금지.
 */
import type { Metadata } from "next";
import { site } from "@/data/site";
import { findSchoolBySlug } from "@/lib/findSchool";
import {
  getPowerSchoolEntry,
  powerSchoolDepts,
  POWER_LANG_LABEL,
  type PowerLang,
  type PowerSchoolKind,
} from "@/data/powerSchoolDepts";

export type PowerSubjectType = "conversation" | "tutoring";

export interface PowerSubject {
  /** URL slug — 하이픈 표기(기존 /power 언어 slug english/chinese/japanese 와 충돌 없음). */
  slug: string;
  /** 개설 판정 언어(powerSchoolDepts 게이트 키). */
  lang: PowerLang;
  type: PowerSubjectType;
  /** 화면 표기 과목명(영어회화·중국어회화·중국어과외·일본어회화·일본어과외). */
  label: string;
  /** title 뒤 검색 키워드(단일 소스 — 이 값만 바꾸면 전 페이지 반영). 느낌표·금지어 없음. */
  keyword: string;
}

/** 어학과목 5종 — 영어는 회화만, 중국어·일본어는 회화+과외. */
export const POWER_SUBJECTS: PowerSubject[] = [
  {
    slug: "english-conversation",
    lang: "english",
    type: "conversation",
    label: "영어회화",
    keyword: "원어민 1:1 영어회화 발음 프리토킹 내신 대비",
  },
  {
    slug: "chinese-conversation",
    lang: "chinese",
    type: "conversation",
    label: "중국어회화",
    keyword: "원어민 1:1 중국어회화 성조 발음 HSKK 대비",
  },
  {
    slug: "chinese-tutoring",
    lang: "chinese",
    type: "tutoring",
    label: "중국어과외",
    keyword: "1:1 중국어과외 병음 성조 HSK 내신 맞춤",
  },
  {
    slug: "japanese-conversation",
    lang: "japanese",
    type: "conversation",
    label: "일본어회화",
    keyword: "원어민 1:1 일본어회화 발음 프리토킹 JLPT",
  },
  {
    slug: "japanese-tutoring",
    lang: "japanese",
    type: "tutoring",
    label: "일본어과외",
    keyword: "1:1 일본어과외 히라가나 문법 JLPT 내신",
  },
];

const subjectBySlug = new Map(POWER_SUBJECTS.map((s) => [s.slug, s]));

/** 특정 언어에 속한 어학과목들(내부 링크·역링크용). */
export function subjectsForLang(lang: PowerLang): PowerSubject[] {
  return POWER_SUBJECTS.filter((s) => s.lang === lang);
}

/* ── 과목별 특화 카드 3종(롱테일 키워드를 본문에 심는다. "수행평가" 단어 미사용). ── */
export type SubjectCard = { title: string; desc: string };

const SUBJECT_CARDS: Record<string, SubjectCard[]> = {
  "english-conversation": [
    { title: "발음·강세 교정", desc: "원어민 선생님과 발음과 강세를 바로잡아 자연스러운 소리부터 만듭니다." },
    { title: "프리토킹·실전 회화", desc: "정해진 대본 없이 주제로 대화하며 말하는 자신감을 키웁니다." },
    { title: "내신 말하기 대비", desc: "학교 말하기 과제와 인터뷰형 발표를 1:1로 실전 연습합니다." },
  ],
  "chinese-conversation": [
    { title: "성조·발음", desc: "성조와 병음 발음을 원어민 선생님과 바로잡아 정확한 소리를 익힙니다." },
    { title: "수준별 프리토킹", desc: "주제로 대화하며 실전 중국어 말하기에 익숙해집니다." },
    { title: "HSKK 말하기 대비", desc: "회화 자격시험 HSKK 유형을 함께 연습합니다." },
  ],
  "chinese-tutoring": [
    { title: "병음·성조 기초", desc: "병음과 성조부터 차근히 잡아 기초를 다집니다." },
    { title: "어법·독해", desc: "어법과 어휘, 독해를 단계별로 채웁니다." },
    { title: "HSK·내신 대비", desc: "HSK 급수와 학교 내신을 함께 준비합니다." },
  ],
  "japanese-conversation": [
    { title: "발음·억양", desc: "발음과 억양을 원어민 선생님과 맞춰 자연스럽게 말합니다." },
    { title: "상황별 프리토킹", desc: "상황별 회화로 말하는 자신감을 키웁니다." },
    { title: "JLPT 회화·청해", desc: "JLPT 청해와 회화 감각을 함께 다집니다." },
  ],
  "japanese-tutoring": [
    { title: "히라가나·가타카나", desc: "글자 기초부터 시작해 표기를 정확히 익힙니다." },
    { title: "문법·한자", desc: "문형과 한자를 단계별로 채웁니다." },
    { title: "JLPT·내신 대비", desc: "JLPT 급수와 학교 내신을 함께 준비합니다." },
  ],
};

/** description 에 자연스럽게 넣을 과목별 핵심어 2개(문장으로 풀어 씀). */
const SUBJECT_TERMS: Record<string, string> = {
  "english-conversation": "발음과 프리토킹",
  "chinese-conversation": "성조와 발음",
  "chinese-tutoring": "병음과 성조",
  "japanese-conversation": "발음과 프리토킹",
  "japanese-tutoring": "히라가나와 문법",
};

/** 학과명을 본문에 넣을 수 있는 실제 학과인지(…과 로 끝나는 명칭만). */
function realDept(deptLabel?: string): string | null {
  return deptLabel && deptLabel.endsWith("과") ? deptLabel : null;
}

function hashSlug(s: string): number {
  let h = 0;
  for (const ch of s) h = (h * 31 + (ch.codePointAt(0) ?? 0)) >>> 0;
  return h;
}

/** 목적격 조사 을/를 — 마지막 글자의 받침 유무로 결정(한글 완성형 기준). */
export function objJosa(word: string): string {
  const last = word.charCodeAt(word.length - 1);
  if (last < 0xac00 || last > 0xd7a3) return "를"; // 한글 완성형 아님 → 기본 를
  return (last - 0xac00) % 28 !== 0 ? "을" : "를";
}

export type BySchoolPageData = {
  schoolSlug: string;
  subjectSlug: string;
  lang: PowerLang;
  label: string;
  type: PowerSubjectType;
  schoolName: string;
  regionName: string;
  deptLabel: string | null;
  kind: PowerSchoolKind;
  /** h1 = 학교 + 과목명. */
  head: string;
  keyword: string;
  metaTitle: string;
  metaDescription: string;
  intro: string;
  cards: SubjectCard[];
  faq: { q: string; a: string }[];
  /** 같은 학교의 다른 어학과목 링크. */
  otherSubjects: { href: string; label: string }[];
  /** 같은 학교·같은 언어의 수행평가(유형 B) 페이지 링크(앵커에만 "수행평가" 표기 허용). */
  performanceLink: { href: string; label: string };
};

function buildDescriptions(p: {
  schoolName: string;
  label: string;
  terms: string;
  type: PowerSubjectType;
}): string[] {
  const { schoolName: S, label: L, terms: T, type } = p;
  const teacher = type === "conversation" ? "원어민·교포 선생님" : "선생님";
  return [
    `${S} ${L}를 찾고 계신가요. 직접 가르쳐 온 상담 선생님이 지금 수준과 목표를 먼저 듣고, ${T}까지 호흡이 맞는 ${teacher}을 1:1로 연결해 드립니다. 첫 상담은 무료입니다.`,
    `${S} 재학생과 입학 준비생의 ${L}를 1:1로 돕습니다. 상담 선생님이 학교 진도와 목표를 확인하고 ${T}${objJosa(T)} 포함해 수업할 ${teacher}을 연결해 드립니다. 무료 상담으로 시작하세요.`,
    `${S} ${L}가 학원 단체 수업으로 부족하다면 1:1 맞춤이 답입니다. 상담 선생님이 ${T}까지 함께 잡아 줄 ${teacher}을 찾아 연결하며, 잘 맞지 않으면 다시 연결해 드립니다.`,
  ];
}

function buildFaq(p: { schoolName: string; label: string }): { q: string; a: string }[] {
  const { schoolName: S, label: L } = p;
  return [
    {
      q: `${S} ${L} 수업은 어떻게 진행되나요.`,
      a: `지금 수준을 먼저 진단한 뒤 발음·회화·자격증·내신 중 필요한 것부터 1:1로 설계합니다. 상담 선생님이 호흡이 맞는 선생님을 연결해 드립니다.`,
    },
    {
      q: `원어민 선생님과 교포 선생님 중 누구와 하나요.`,
      a: `발음과 회화는 원어민 선생님, 문법과 설명은 한국어로 짚어 주는 교포 선생님 중에서 목표에 맞는 분을 연결해 드립니다.`,
    },
    {
      q: `기초가 부족해도 시작할 수 있나요.`,
      a: `지금 수준부터 시작합니다. 문자·발음 기초가 필요하면 거기서부터, 자격증이 급하면 해당 대비부터 잡아 갑니다. 먼저 무료 상담으로 알려 주세요.`,
    },
  ];
}

/** (학교, 과목) → 페이지 데이터. 대상이 아니면 null(라우트에서 notFound). */
export function buildBySchoolData(
  schoolSlug: string,
  subjectSlug: string,
): BySchoolPageData | null {
  const subject = subjectBySlug.get(subjectSlug);
  if (!subject) return null;

  const entry = getPowerSchoolEntry(schoolSlug);
  if (!entry) return null;
  const info = entry.langs[subject.lang];
  if (!info.offered || !info.verified) return null;

  const ctx = findSchoolBySlug(schoolSlug);
  if (!ctx) return null;

  const schoolName = ctx.school.name;
  const regionName = ctx.sigunguName;
  const langLabel = POWER_LANG_LABEL[subject.lang];
  const deptLabel = realDept(info.deptLabel);
  const kind = entry.kind;
  const head = `${schoolName} ${subject.label}`;
  // title = "{학교} {키워드}" — 키워드에 과목명이 이미 포함되어 학교명만 앞에 둔다(중복 없음).
  const metaTitle = `${schoolName} ${subject.keyword} | 어학의참견`;

  const terms = SUBJECT_TERMS[subjectSlug];
  const metaDescription = buildDescriptions({
    schoolName,
    label: subject.label,
    terms,
    type: subject.type,
  })[hashSlug(`${schoolSlug}/${subjectSlug}`) % 3];

  const openingSubject = deptLabel
    ? `${schoolName} ${deptLabel} 재학생이나 입학을 준비한다면`
    : `${schoolName} 재학생이나 입학을 준비한다면 영어 중심 교육과정 속에서`;
  const strength =
    kind === "foreign"
      ? "전공어 심화 수업의 강도를 아는 선생님과 준비하면 흔들리지 않습니다."
      : "영어 내신과 실전 회화를 함께 아는 선생님과 준비하면 흔들리지 않습니다.";
  const intro = `${openingSubject} ${subject.label} 실력이 학교생활의 큰 축입니다. ${strength} 지식의참견 상담 선생님이 지금 상황을 먼저 듣고 원어민·교포 선생님 중 맞는 분을 1:1로 연결해 드립니다.`;

  const otherSubjects = POWER_SUBJECTS.filter((s) => {
    if (s.slug === subjectSlug) return false;
    const i = entry.langs[s.lang];
    return i.offered && i.verified;
  }).map((s) => ({
    href: `/power/by-school/${schoolSlug}/${s.slug}`,
    label: `${schoolName} ${s.label}`,
  }));

  const performanceLink = {
    href: `/power/performance/${schoolSlug}/${subject.lang}`,
    label: `${schoolName} ${langLabel} 수행평가`,
  };

  return {
    schoolSlug,
    subjectSlug,
    lang: subject.lang,
    label: subject.label,
    type: subject.type,
    schoolName,
    regionName,
    deptLabel,
    kind,
    head,
    keyword: subject.keyword,
    metaTitle,
    metaDescription,
    intro,
    cards: SUBJECT_CARDS[subjectSlug],
    faq: buildFaq({ schoolName, label: subject.label }),
    otherSubjects,
    performanceLink,
  };
}

/** (학교, 과목) 조합이 생성 대상인지 — 제외 아님 + 해당 언어 offered && verified. */
export function isBySchoolAllowed(schoolSlug: string, subjectSlug: string): boolean {
  const subject = subjectBySlug.get(subjectSlug);
  if (!subject) return false;
  const entry = getPowerSchoolEntry(schoolSlug);
  if (!entry) return false;
  const info = entry.langs[subject.lang];
  return info.offered && info.verified;
}

/** 정적 생성용 전체 (학교, 과목) 조합 — generateStaticParams·sitemap 단일 소스. */
export function allBySchoolPairs(): { school: string; subject: string }[] {
  const out: { school: string; subject: string }[] = [];
  for (const entry of powerSchoolDepts) {
    // getPowerSchoolEntry 가 제외 학교를 null 로 걸러 준다(isBySchoolAllowed 내부).
    for (const s of POWER_SUBJECTS) {
      if (isBySchoolAllowed(entry.schoolSlug, s.slug))
        out.push({ school: entry.schoolSlug, subject: s.slug });
    }
  }
  return out;
}

/** /power 전용 메타데이터 빌더 — 언어 상세·유형 B 와 같은 형식. */
export function buildBySchoolMetadata(
  schoolSlug: string,
  subjectSlug: string,
): Metadata {
  const data = buildBySchoolData(schoolSlug, subjectSlug);
  if (!data) return {};
  const canonical = `/power/by-school/${schoolSlug}/${subjectSlug}`;
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
