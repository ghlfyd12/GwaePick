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
import { buildRegionDongTitle } from "@/lib/regionSchoolPick";
import { getSubjectUnits } from "@/data/subjectUnits";
import { isThumbEligible, thumbPath, thumbAlt, THUMB_SIZE } from "@/lib/thumb";
import { SCHOOL_GRADE_PHRASE } from "@/data/schoolGradeKeywords";
import {
  SCHOOL_PUBLISHED,
  SCHOOL_MODIFIED,
  SCHOOL_HUB_PUBLISHED,
  SCHOOL_HUB_MODIFIED,
} from "@/data/contentMeta";

/** ISO 날짜(YYYY-MM-DD) → KST 자정 ISO 8601 datetime. article:*_time · JSON-LD dates 용. */
const isoKST = (d: string) => `${d}T00:00:00+09:00`;

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

/**
 * 학교 description 에 학년 구를 중앙 삽입 — 회전 3종 어느 문장이 선택돼도 동일 규칙.
 * 학교명 head("{학교명} ") 직후에 학년 구를 넣어 잘린 스니펫 앞부분(≈45자 이내)에 학년 검색어를 노출하고,
 * 학년 정보와 겹치는 "아이의 학년과 성향, " 은 제거해 중복·길이 증가를 억제한다.
 * 학교명 head 를 못 찾으면(방어) 원문 그대로 반환한다.
 */
function insertGradePhrase(desc: string, schoolName: string, phrase: string): string {
  const trimmed = desc.replace("아이의 학년과 성향, ", "");
  const head = `${schoolName} `;
  const at = trimmed.indexOf(head);
  if (at < 0) return trimmed;
  const pos = at + head.length;
  return `${trimmed.slice(0, pos)}${phrase} ${trimmed.slice(pos)}`;
}

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

/* 지역 기본(고등 기준) description — title 의 "모의고사·정시·기초·하위권·노베이스" 를 문장으로 받는다. */
const REGION_DESC: ReadonlyArray<(p: RegionDescInput) => string> = [
  ({ regionName: G, subjectPhrase: P }) =>
    `${G} ${P}과외를 찾고 계신가요. 직접 가르쳐 온 상담 선생님이 학생의 학년과 실력, 성향을 듣고 ${G}에서 내신과 모의고사를 함께 챙겨 줄 ${P} 선생님을 1:1로 연결해 드립니다. 기초가 부족하거나 하위권에서 시작해도 한 명에게 맞춘 진도로 차근히 나아가며 첫 상담은 무료입니다.`,
  ({ regionName: G, subjectPhrase: P }) =>
    `${G} ${P}과외, 지식의참견이 맞는 선생님을 연결합니다. 상담 선생님이 아이의 상황을 먼저 이해하고 ${G} 학생에게 맞는 ${P} 선생님을 1:1로 소개해 드립니다. 노베이스라면 기초 개념부터, 내신과 모의고사가 급하다면 그 일정에 맞춰 진도를 잡아 갑니다.`,
  ({ regionName: G, subjectPhrase: P }) =>
    `${G}에서 ${P}과외 선생님을 찾고 있다면 직접 가르쳐 본 상담 선생님이 도와드립니다. 지금 하위권이어도 기초부터 다시 짚어 내신과 모의고사, 정시까지 이어 갈 ${G} ${P} 1:1 수업 선생님을 연결하고 첫 수업을 체험한 뒤 결정하실 수 있습니다. 무료 상담으로 시작하세요.`,
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
/** OG/트위터 이미지 형태 — 기본 정적 OG 와 동적 썸네일이 같은 모양을 공유. */
type OgImage = { url: string; width: number; height: number; alt: string };

function baseMetadata(
  title: string,
  description: string,
  canonicalPath: string,
  ogImage: OgImage = OG_IMAGE,
): Metadata {
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
      images: [ogImage],
    },
    twitter: { card: "summary", title, description, images: [ogImage] },
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
  /** 학교 slug — 동적 썸네일 og:image URL(파일럿: 고교×핵심5과목) 생성에 쓰인다. */
  schoolSlug?: string;
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
  // 학년 검색어 보강 — 학교급 학년 구를 학교명 head 직후(스니펫 앞부분)에 중앙 삽입.
  const description = insertGradePhrase(
    pick(descSet, p.canonicalPath)(p),
    p.schoolName,
    SCHOOL_GRADE_PHRASE[p.level ?? "high"],
  );
  // 파일럿: 고교×핵심5과목만 페이지별 텍스트 썸네일을 og:image 로 사용(그 외는 기본 정적 OG).
  const og: OgImage | undefined =
    p.schoolSlug && p.subjectSlug && p.level && isThumbEligible(p.level, p.subjectSlug)
      ? {
          url: thumbPath(p.schoolSlug, p.subjectSlug),
          width: THUMB_SIZE.width,
          height: THUMB_SIZE.height,
          alt: thumbAlt(p.schoolName, p.subjectLabel),
        }
      : undefined;
  // 검색결과 신선도 신호 — og:type("website")은 유지하고 article:*_time 을 raw meta 로 병기.
  // 값은 contentMeta.ts 상수(콘텐츠 실제 변경 시에만 갱신). 지역·과목 페이지는 미포함.
  const base = baseMetadata(title, description, p.canonicalPath, og);
  return {
    ...base,
    other: {
      "article:published_time": isoKST(SCHOOL_PUBLISHED),
      "article:modified_time": isoKST(SCHOOL_MODIFIED),
    },
  };
}

export interface SchoolHubMetaInput {
  /** 약칭(예: 가락고). */
  schoolName: string;
  /** 정식명(예: 가락고등학교). 없으면 약칭만. */
  schoolFullName: string | null;
  /** 동명이교(지역 접미사)만 지정 — title 앞에 짧은 지역명. */
  regionShort?: string;
  canonicalPath: string;
}
/**
 * 학교 단위 허브(과목 없음) title/description — "정식명(약칭) 과외".
 * 과목 중립. 키워드 나열 없이 자연 문장. 날짜는 SCHOOL_HUB 상수.
 */
export function buildSchoolHubMeta(p: SchoolHubMetaInput): Metadata {
  const head = p.schoolFullName
    ? `${p.schoolFullName}(${p.schoolName})`
    : p.schoolName;
  const prefix = p.regionShort ? `${p.regionShort} ` : "";
  const title = `${prefix}${head} 과외 | ${SITE_NAME}`;
  const nameForDesc = p.schoolFullName ?? p.schoolName;
  const description = `${nameForDesc} 1:1 맞춤 과외 안내. 직접 가르쳐 온 선생님이 과목별로 우리 아이에게 맞는 선생님을 상담으로 연결해 드립니다.`;
  const base = baseMetadata(title, description, p.canonicalPath);
  return {
    ...base,
    other: {
      "article:published_time": isoKST(SCHOOL_HUB_PUBLISHED),
      "article:modified_time": isoKST(SCHOOL_HUB_MODIFIED),
    },
  };
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
  /**
   * 동×과목 상세 전용 — 인근 학교(중2·고2 이름)와 시군구명.
   * 지정 시 중·고 통합형 title/description(학교·단원 주입)을 쓴다.
   * 미지정(허브·레거시·학년 세그먼트)은 기존 문구 유지.
   */
  dongSchools?: {
    sigunguName: string;
    middleSchools: string[];
    highSchools: string[];
  };
  canonicalPath: string;
}

/** 동×과목 — 중·고 학교와 과목 단원 키워드를 주입한 단일 description(회전 없음). */
function regionDongDescription(p: {
  regionName: string;
  subjectLabel: string;
  subjectSlug?: string;
  middleSchools: string[];
  highSchools: string[];
}): string {
  const units = getSubjectUnits(p.subjectSlug ?? "");
  const G = p.regionName;
  const J = p.subjectLabel;
  const midNames = p.middleSchools.join("·");
  const highNames = p.highSchools.join("·");
  const midUnits = units.middle.join("·");
  const highUnits = units.high.join("·");
  const midClause = midNames ? `${midNames} 내신과 ${midUnits}` : `${midUnits}`;
  const highClause = highNames ? `${highNames} ${highUnits}` : `${highUnits}`;
  return `${G} ${J}과외, 중1·중2·중3·고1·고2·고3 학년별 1:1 맞춤. ${midClause}, ${highClause} 대비. 직접 가르쳐 본 상담 선생님이 아이에게 맞는 ${J} 선생님을 찾아드립니다.`;
}

export function buildRegionMeta(p: RegionMetaInput): Metadata {
  // 동×과목 상세(학교 주입) — 중·고 통합형 title/description.
  if (p.subjectLabel && p.dongSchools && !p.gradeLabel) {
    const title = buildRegionDongTitle({
      dong: p.regionName,
      subjectLabel: p.subjectLabel,
      sigunguName: p.dongSchools.sigunguName,
      mid1: p.dongSchools.middleSchools[0],
      high1: p.dongSchools.highSchools[0],
    });
    const description = regionDongDescription({
      regionName: p.regionName,
      subjectLabel: p.subjectLabel,
      subjectSlug: p.subjectSlug,
      middleSchools: p.dongSchools.middleSchools,
      highSchools: p.dongSchools.highSchools,
    });
    return baseMetadata(title, description, p.canonicalPath);
  }
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

/**
 * WebPage — 검색결과 신선도(발행/수정일) 신호. 학교×과목 페이지 전용.
 * 날짜는 contentMeta.ts 상수(콘텐츠 실제 변경 시에만 갱신). 기존 Service/Breadcrumb/FAQ 와 별개 노드.
 */
export function webPageJsonLd(p: {
  name: string;
  canonicalPath: string;
  /** 유형별 정직한 날짜 override(미지정 시 학교×과목 상세 기준 SCHOOL_* 상수). */
  published?: string;
  modified?: string;
}): Json {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: p.name,
    url: absUrl(p.canonicalPath),
    datePublished: isoKST(p.published ?? SCHOOL_PUBLISHED),
    dateModified: isoKST(p.modified ?? SCHOOL_MODIFIED),
  };
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
