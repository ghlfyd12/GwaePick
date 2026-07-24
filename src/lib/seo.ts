/**
 * pSEO 메타데이터 + JSON-LD 구조화 데이터 단일 소스.
 *
 * 3개 페이지 유형(학교×과목 / 지역×과목 / 과목)의 title·description·canonical·robots·OG 를
 * 이 파일의 buildSchoolMeta / buildRegionMeta / buildSubjectMeta 로만 생성한다(라우트 하드코딩 금지).
 * JSON-LD(Service·BreadcrumbList·FAQPage)도 여기서 만들어 <JsonLd> 로 삽입한다.
 *
 * 원칙:
 *  - 사이트명·도메인·상담 경로는 site.ts 중앙 설정에서만 가져온다(중복 정의·하드코딩 금지).
 *  - 도메인은 site.url(=배포 기준 URL). sitemap·OG·robots 가 이미 이 값을 쓰므로 canonical 도 동일하게 맞춘다.
 *  - description 은 유형별 2~3종을 canonical 경로 해시로 회전해 대량 중복을 피한다(배포 간 안정적).
 *  - title 뒷부분 검색 키워드 문구는 data/titleKeywords.ts(페이지 유형×학교급) + data/seoTitlePhrases.ts
 *    (논술·코딩처럼 "○○과외"가 문구에 포함된 full 타입) 단일 소스. 여기에 하드코딩 금지.
 *  - 느낌표·영업성 대체 호칭 미사용(선생님/상담 통일). 평점·후기 수 등 허위 수치 미기재.
 */
import type { Metadata } from "next";
import { site } from "@/data/site";
import {
  resolveTitlePhrase,
  REGION_HUB_TITLE_PHRASE,
  type TitleLevel,
} from "@/data/seoTitlePhrases";
import { resolveTitleKeyword, type TitlePageType } from "@/data/titleKeywords";

const SITE_NAME = site.name; // 지식의참견
const SITE_URL = site.url.replace(/\/$/, ""); // 배포 기준 도메인(단일 소스)
const OG_IMAGE = site.ogImage;
/** 무료 상담 절대 URL — availableChannel(JSON-LD)용. site.cta.href 단일 소스. */
const CONSULT_URL = new URL(site.cta.href, `${SITE_URL}/`).toString();

/** 상대경로 → 배포 도메인 기준 절대 URL(한글 세그먼트 자동 인코딩). JSON-LD 전용. */
export const absUrl = (path: string) =>
  new URL(path, `${SITE_URL}/`).toString();

/**
 * 시군구 라벨 → title 용 짧은 지역명(끝 시/군/구 제거).
 * "성남시 분당구" → "분당", "고양시" → "고양", "가평군" → "가평".
 */
export function shortRegion(sigunguName: string): string {
  const last = sigunguName.trim().split(/\s+/).pop() ?? sigunguName;
  return last.replace(/(특별자치시|특별자치도|특별시|광역시)$/, "").replace(/[시군구]$/, "") || last;
}

/* ── description 회전(경로 해시 기반, 배포 간 안정) ───────────────────── */
function hashSlug(s: string): number {
  let h = 0;
  for (const ch of s) h = (h * 31 + (ch.codePointAt(0) ?? 0)) >>> 0;
  return h;
}
const pick = <T>(arr: readonly T[], key: string): T => arr[hashSlug(key) % arr.length];

/* ── description 템플릿(120~155자, 핵심 키워드 앞 40자, 느낌표·금지어 없음) ── */
/* 고등 기본 description — title 의 "기출·교과서·출제경향" 키워드를 문장으로 받는다. */
const SCHOOL_DESC: ReadonlyArray<(p: SchoolMetaInput) => string> = [
  ({ schoolName: S, subjectLabel: J, regionShort: R }) =>
    `${R ? R + " " : ""}${S} ${J}과외를 찾고 계신가요. 직접 가르쳐 온 상담 선생님이 아이의 학년과 성향, ${S} 기출과 내신 출제경향을 먼저 파악하고 호흡이 잘 맞는 ${J} 선생님을 1:1로 연결해 드립니다. 첫 상담은 무료이니 부담 없이 문의하세요.`,
  ({ schoolName: S, subjectLabel: J, regionShort: R }) =>
    `${R ? R + " " : ""}${S} ${J} 내신이 학원 단체 수업으로 잡히지 않는다면 1:1 맞춤 과외가 답입니다. 상담 선생님이 ${S} 기출과 교과서 진도를 함께 살펴 시험 범위와 출제경향에 맞춰 수업할 선생님을 찾아 연결해 드립니다. 무료 상담으로 시작하세요.`,
  ({ schoolName: S, subjectLabel: J, regionShort: R }) =>
    `${R ? R + " " : ""}${S} ${J}과외, 지식의참견이 맞는 선생님을 연결합니다. 직접 가르쳐 본 상담 선생님이 학생의 실력과 ${S} 기출 출제경향을 함께 살펴 어울리는 ${J} 선생님을 1:1로 소개해 드립니다. 잘 맞지 않으면 다시 연결해 드리며 첫 상담은 무료입니다.`,
];

/* 중등 전용 description — 수능·정시 대신 교과서 진도·출제경향·선행 프레이밍. */
const SCHOOL_DESC_MIDDLE: ReadonlyArray<(p: SchoolMetaInput) => string> = [
  ({ schoolName: S, subjectLabel: J, regionShort: R }) =>
    `${R ? R + " " : ""}${S} ${J}과외를 찾고 계신가요. 직접 가르쳐 온 상담 선생님이 아이의 학년과 성향, ${S} 교과서 진도와 내신 출제경향을 먼저 파악하고 선행이 필요한 부분까지 짚어 ${J} 선생님을 1:1로 연결해 드립니다. 첫 상담은 무료입니다.`,
  ({ schoolName: S, subjectLabel: J, regionShort: R }) =>
    `${R ? R + " " : ""}${S} ${J} 내신이 학원 단체 수업으로 잡히지 않는다면 1:1 맞춤 과외가 답입니다. 상담 선생님이 ${S} 교과서 범위와 출제경향을 확인하고 현행 보완과 선행 속도를 함께 잡아 줄 선생님을 연결해 드립니다. 무료 상담으로 시작하세요.`,
  ({ schoolName: S, subjectLabel: J, regionShort: R }) =>
    `${R ? R + " " : ""}${S} ${J}과외, 지식의참견이 맞는 선생님을 연결합니다. 직접 가르쳐 본 상담 선생님이 학생의 실력과 ${S} 교과서 출제경향을 듣고 선행과 내신을 함께 준비할 ${J} 선생님을 1:1로 소개해 드립니다. 잘 맞지 않으면 다시 연결해 드립니다.`,
];

/* 초등 전용 description — 내신·중간·기말·모의고사·등급 대신 학교 진도·단원평가·사고력·학습 습관 프레이밍. */
const SCHOOL_DESC_ELEM: ReadonlyArray<(p: SchoolMetaInput) => string> = [
  ({ schoolName: S, subjectLabel: J, regionShort: R }) =>
    `${R ? R + " " : ""}${S} ${J}과외를 찾고 계신가요. 직접 가르쳐 온 상담 선생님이 아이의 학년과 성향, ${S} 학교 진도와 단원평가 유형을 먼저 살피고 사고력을 키워 줄 ${J} 선생님을 1:1로 연결해 드립니다. 첫 상담은 무료이니 부담 없이 문의하세요.`,
  ({ schoolName: S, subjectLabel: J, regionShort: R }) =>
    `${R ? R + " " : ""}${S} ${J} 공부가 학원 단체 수업으로 잡히지 않는다면 1:1 맞춤 과외가 답입니다. 상담 선생님이 ${S} 학생을 먼저 이해하고 학교 진도와 단원평가에 맞춰 기초부터 사고력까지 잡아 줄 선생님을 연결해 드립니다. 무료 상담으로 시작하세요.`,
  ({ schoolName: S, subjectLabel: J, regionShort: R }) =>
    `${R ? R + " " : ""}${S} ${J}과외, 지식의참견이 맞는 선생님을 연결합니다. 직접 가르쳐 본 상담 선생님이 학생의 현재 수준과 학습 습관, ${S} 단원평가 결과를 듣고 사고력까지 함께 다질 ${J} 선생님을 1:1로 소개해 드립니다. 첫 상담은 무료입니다.`,
];

type RegionDescInput = { regionName: string; subjectPhrase: string };

/* 지역 기본(고등 기준) description — title 의 "모의고사·수능·정시·개별진도" 를 문장으로 받는다. */
const REGION_DESC: ReadonlyArray<(p: RegionDescInput) => string> = [
  ({ regionName: G, subjectPhrase: P }) =>
    `${G} ${P}과외를 찾고 계신가요. 직접 가르쳐 온 상담 선생님이 학생의 학년과 실력, 성향을 듣고 ${G}에서 내신과 모의고사를 함께 챙겨 줄 ${P} 선생님을 1:1로 연결해 드립니다. 학원 단체 수업과 달리 한 명에게 맞춘 개별 진도로 시작하며 첫 상담은 무료입니다.`,
  ({ regionName: G, subjectPhrase: P }) =>
    `${G} ${P}과외, 지식의참견이 맞는 선생님을 연결합니다. 상담 선생님이 아이의 상황을 먼저 이해하고 ${G} 학생에게 맞는 ${P} 선생님을 1:1로 소개해 드립니다. 내신과 모의고사 진도를 개별 속도에 맞춰 잡아 가며 잘 맞지 않으면 추가 비용 없이 다시 연결해 드립니다.`,
  ({ regionName: G, subjectPhrase: P }) =>
    `${G}에서 ${P}과외 선생님을 찾고 있다면 직접 가르쳐 본 상담 선생님이 도와드립니다. 학생의 수준과 성향, 내신과 모의고사 일정에 맞춰 ${G} ${P} 1:1 수업이 가능한 선생님을 연결하고 첫 수업을 체험한 뒤 결정하실 수 있습니다. 무료 상담으로 시작하세요.`,
];

/* 지역 중등 — 수능·정시 대신 선행·예비고1 프레이밍(학년 세그먼트가 있는 경로에서만 사용). */
const REGION_DESC_MIDDLE: ReadonlyArray<(p: RegionDescInput) => string> = [
  ({ regionName: G, subjectPhrase: P }) =>
    `${G} ${P}과외를 찾고 계신가요. 직접 가르쳐 온 상담 선생님이 학생의 학년과 실력, 성향을 듣고 ${G}에서 내신과 선행을 함께 챙겨 줄 ${P} 선생님을 1:1로 연결해 드립니다. 학원 단체 수업과 달리 한 명에게 맞춘 진도로 시작하며 첫 상담은 무료입니다.`,
  ({ regionName: G, subjectPhrase: P }) =>
    `${G} ${P}과외, 지식의참견이 맞는 선생님을 연결합니다. 상담 선생님이 아이의 상황을 먼저 이해하고 ${G} 학생에게 맞는 ${P} 선생님을 1:1로 소개해 드립니다. 기초가 비어 있다면 처음부터, 예비고1 준비가 필요하다면 선행까지 속도를 맞춰 갑니다.`,
  ({ regionName: G, subjectPhrase: P }) =>
    `${G}에서 ${P}과외 선생님을 찾고 있다면 직접 가르쳐 본 상담 선생님이 도와드립니다. 내신 일정과 선행 속도, 예비고1 준비까지 고려해 ${G} ${P} 1:1 수업이 가능한 선생님을 연결하고 첫 수업을 체험한 뒤 결정하실 수 있습니다. 무료 상담으로 시작하세요.`,
];

/* 지역 초등 — 내신·수능 대신 단원평가·개념이해·사고력 프레이밍. */
const REGION_DESC_ELEM: ReadonlyArray<(p: RegionDescInput) => string> = [
  ({ regionName: G, subjectPhrase: P }) =>
    `${G} ${P}과외를 찾고 계신가요. 직접 가르쳐 온 상담 선생님이 아이의 학년과 성향을 듣고 ${G}에서 학교 진도와 단원평가를 함께 챙겨 줄 ${P} 선생님을 1:1로 연결해 드립니다. 개념 이해부터 차근히 시작하며 첫 상담은 무료입니다.`,
  ({ regionName: G, subjectPhrase: P }) =>
    `${G} ${P}과외, 지식의참견이 맞는 선생님을 연결합니다. 상담 선생님이 아이의 상황을 먼저 이해하고 ${G}에서 기초 개념과 단원평가, 사고력까지 함께 다질 ${P} 선생님을 1:1로 소개해 드립니다. 잘 맞지 않으면 추가 비용 없이 다시 연결해 드립니다.`,
  ({ regionName: G, subjectPhrase: P }) =>
    `${G}에서 ${P}과외 선생님을 찾고 있다면 직접 가르쳐 본 상담 선생님이 도와드립니다. 단원평가 결과와 학습 습관을 살펴 개념 이해와 사고력을 함께 키울 ${G} ${P} 1:1 수업 선생님을 연결하고 첫 수업을 체험한 뒤 결정하실 수 있습니다. 무료 상담으로 시작하세요.`,
];

const REGION_HUB_DESC: ReadonlyArray<(p: { regionName: string }) => string> = [
  ({ regionName: G }) =>
    `${G} 1:1 과외를 찾고 계신가요. 직접 가르쳐 온 상담 선생님이 학생의 학년과 실력, 성향을 듣고 ${G}에서 호흡이 잘 맞는 선생님을 과목별로 연결해 드립니다. 학원 단체 수업과 달리 아이 한 명에게 맞춰 시작하며 첫 상담은 무료입니다.`,
  ({ regionName: G }) =>
    `${G} 과외 선생님을 찾고 있다면 지식의참견이 도와드립니다. 상담 선생님이 아이의 상황을 먼저 듣고 ${G} 학생에게 맞는 선생님을 1:1로 소개하며 잘 맞지 않으면 추가 비용 없이 다시 연결해 드립니다. 무료 상담으로 시작하세요.`,
];

const SUBJECT_DESC: ReadonlyArray<(p: { subjectLabel: string }) => string> = [
  ({ subjectLabel: J }) =>
    `${J}과외 선생님을 찾고 계신가요. 직접 가르쳐 온 상담 선생님이 학생의 현재 수준과 성향을 먼저 진단하고 호흡이 잘 맞는 ${J} 선생님을 1:1로 연결해 드립니다. 진단부터 기초·심화·점검까지 단계별로 관리하며 첫 상담은 무료입니다.`,
  ({ subjectLabel: J }) =>
    `${J}과외, 학원 단체 수업으로 부족하다면 1:1 맞춤 수업이 답입니다. 상담 선생님이 아이를 먼저 이해하고 ${J} 내신과 서술형까지 함께 준비할 선생님을 연결해 드립니다. 잘 맞지 않으면 다시 연결하며 무료 상담으로 시작합니다.`,
  ({ subjectLabel: J }) =>
    `${J}과외를 제대로 시작하고 싶다면 지식의참견이 맞는 선생님을 연결합니다. 직접 가르쳐 본 상담 선생님이 학생 수준에 맞춰 ${J} 1:1 수업이 가능한 선생님을 소개하고 첫 수업을 체험한 뒤 결정하실 수 있습니다. 첫 상담은 무료입니다.`,
];

/* ── 공통 Metadata 조립 ──────────────────────────────────────────────── */
function baseMetadata(title: string, description: string, canonicalPath: string): Metadata {
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: canonicalPath },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: canonicalPath,
      siteName: SITE_NAME,
      locale: "ko_KR",
      type: "website",
      images: [OG_IMAGE],
    },
    twitter: { card: "summary", title, description, images: [OG_IMAGE] },
  };
}

/* ── 유형별 Metadata 빌더 ────────────────────────────────────────────── */
/**
 * title 문구 조립 — 문구 타입에 따라 두 갈래.
 *  - suffix: "{앞부분} {과목}과외 {문구}"  ← 문구는 titleKeywords.ts(페이지 유형×학교급) 에서 온다.
 *  - full  : "{앞부분} {문구}"  (논술·코딩처럼 문구에 이미 "○○과외"가 포함됨 → 학교급 무관)
 * head 는 지역명 또는 (지역+)학교명, lead 는 과목 앞에 붙는 학년 등 수식어(선택).
 *
 * lead 생략 규칙: suffix 문구가 lead 와 같은 말로 시작하면 lead 를 빼 같은 단어가 두 번 나오지 않게 한다.
 * (예: lead="초등" + 문구="초등 단원평가 …" → "초등 수학과외 초등 단원평가 …" 가 되는 것을 방지)
 */
function composeTitle(p: {
  pageType: TitlePageType;
  head: string;
  subjectLabel: string;
  subjectSlug?: string;
  lead?: string;
  level?: TitleLevel;
}): string {
  const phrase = resolveTitlePhrase({
    slug: p.subjectSlug,
    label: p.subjectLabel,
    level: p.level,
  });
  if (phrase.type === "full") {
    const lead = p.lead ? `${p.lead} ` : "";
    return `${p.head} ${lead}${phrase.text} | ${SITE_NAME}`;
  }
  const keyword = resolveTitleKeyword(p.pageType, p.level);
  // 문구가 lead 로 시작하면(예: "초등 단원평가 …" + lead "초등") 중복이므로 lead 를 생략한다.
  const dropLead = !!p.lead && keyword.startsWith(`${p.lead} `);
  const lead = p.lead && !dropLead ? `${p.lead} ` : "";
  return `${p.head} ${lead}${p.subjectLabel}과외 ${keyword} | ${SITE_NAME}`;
}

export interface SchoolMetaInput {
  schoolName: string;
  subjectLabel: string;
  /** subjects.ts 의 과목 slug — title 문구 조회 키. */
  subjectSlug?: string;
  /** 동명이교(지역 접미사) 학교만 지정 — title 앞에 짧은 지역명이 붙는다. */
  regionShort?: string;
  /** 학교급 — description 프레이밍 + title 문구(초·중 override) 선택에 쓰인다. 미지정 시 고등 기준. */
  level?: TitleLevel;
  canonicalPath: string;
}
export function buildSchoolMeta(p: SchoolMetaInput): Metadata {
  const prefix = p.regionShort ? `${p.regionShort} ` : "";
  const title = composeTitle({
    pageType: "school",
    head: `${prefix}${p.schoolName}`,
    subjectLabel: p.subjectLabel,
    subjectSlug: p.subjectSlug,
    level: p.level,
  });
  // 학교급별 description — 미지정(판별 불가)은 고등 기준 기본 세트.
  const descSet =
    p.level === "elem"
      ? SCHOOL_DESC_ELEM
      : p.level === "middle"
        ? SCHOOL_DESC_MIDDLE
        : SCHOOL_DESC;
  const description = pick(descSet, p.canonicalPath)(p);
  return baseMetadata(title, description, p.canonicalPath);
}

export interface RegionMetaInput {
  regionName: string;
  /** 과목 라벨. 없으면 과목 없는 지역 허브(구·동 허브) 메타. */
  subjectLabel?: string;
  /** subjects.ts 의 과목 slug — title 문구 조회 키(경기 레거시는 생략, 라벨로 역매핑). */
  subjectSlug?: string;
  /** 학년 라벨(초등/중등/고등) — 학년 세그먼트가 있는 경로에서만. */
  gradeLabel?: string;
  /** 학교급 — 학년을 알 수 있는 경로에서만 지정(지역 페이지 기본은 고등 기준). */
  level?: TitleLevel;
  canonicalPath: string;
}
export function buildRegionMeta(p: RegionMetaInput): Metadata {
  if (p.subjectLabel) {
    // description 은 기존과 동일하게 "학년 과목" 결합 문구를 쓴다.
    const subjectPhrase = p.gradeLabel
      ? `${p.gradeLabel} ${p.subjectLabel}`
      : p.subjectLabel;
    const title = composeTitle({
      pageType: "region",
      head: p.regionName,
      subjectLabel: p.subjectLabel,
      subjectSlug: p.subjectSlug,
      lead: p.gradeLabel,
      level: p.level,
    });
    // 학년 세그먼트가 있는 경로만 초·중 세트, 나머지(학년 차원 없음)는 고등 기준 기본 세트.
    const regionDescSet =
      p.level === "elem"
        ? REGION_DESC_ELEM
        : p.level === "middle"
          ? REGION_DESC_MIDDLE
          : REGION_DESC;
    const description = pick(regionDescSet, p.canonicalPath)({
      regionName: p.regionName,
      subjectPhrase,
    });
    return baseMetadata(title, description, p.canonicalPath);
  }
  const title = `${p.regionName} ${REGION_HUB_TITLE_PHRASE} | ${SITE_NAME}`;
  const description = pick(REGION_HUB_DESC, p.canonicalPath)({ regionName: p.regionName });
  return baseMetadata(title, description, p.canonicalPath);
}

export interface SubjectMetaInput {
  subjectLabel: string;
  canonicalPath: string;
}
export function buildSubjectMeta(p: SubjectMetaInput): Metadata {
  const title = `${p.subjectLabel}과외 1:1 맞춤 매칭 | ${SITE_NAME}`;
  const description = pick(SUBJECT_DESC, p.canonicalPath)(p);
  return baseMetadata(title, description, p.canonicalPath);
}

/* ── JSON-LD 빌더 ────────────────────────────────────────────────────── */
type Json = Record<string, unknown>;

/**
 * Service — 과외 선생님 매칭 서비스. provider=Organization, 무료 상담 채널 포함.
 * areaServed 는 학교/지역 페이지의 지역명(과목 단독 페이지는 생략).
 */
export function serviceJsonLd(p: {
  subjectLabel?: string;
  areaServed?: string;
  canonicalPath: string;
}): Json {
  const serviceType = p.subjectLabel
    ? `${p.subjectLabel} 1:1 과외 선생님 매칭`
    : "1:1 과외 선생님 매칭";
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType,
    provider: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    ...(p.areaServed ? { areaServed: { "@type": "Place", name: p.areaServed } } : {}),
    url: absUrl(p.canonicalPath),
    availableChannel: {
      "@type": "ServiceChannel",
      name: "무료 상담",
      serviceUrl: CONSULT_URL,
    },
  };
}

export type Crumb = { name: string; path?: string };
/** BreadcrumbList — 홈 → 상위 분류 → 현재. 마지막(현재) 항목은 path 생략 가능. */
export function breadcrumbJsonLd(items: Crumb[]): Json {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      ...(it.path ? { item: absUrl(it.path) } : {}),
    })),
  };
}

/** 페이지가 이미 쓰는 {label, href?} 브레드크럼 배열을 그대로 BreadcrumbList 로 변환. */
export function breadcrumbJsonLdFromNav(
  items: { label: string; href?: string }[],
): Json {
  return breadcrumbJsonLd(items.map((b) => ({ name: b.label, path: b.href })));
}

/** FAQPage — 페이지에 실제 렌더링되는 Q&A 로만 구성(허위 문항 금지). */
export function faqJsonLd(faq: { q: string; a: string }[]): Json {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}
