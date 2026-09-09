/**
 * 검고의참견 지역×검정고시 축(253장) — 페이지 콘텐츠·메타·내부링크 단일 소스.
 *
 * 지역축은 어학시험축과 동일한 전국 253 시군구를 쓰므로, 이미 검증된 examRegions(byRegionExam)를
 * 그대로 재사용한다(재클론 금지). 라우트 slug·표기·충돌 처리(광역시 동명 구)가 자동으로 일치한다.
 * 지역 페이지는 급별 안내 요약 + 급별 상세 내부링크만 담고, 시험 정보 전문은 급별 상세에만 둔다(중복 방지).
 *
 * 워딩 절대 규칙 준수(성과·기간 보장 금지, 느낌표·금지어 없음). 색은 accent 토큰(청록).
 */
import type { Metadata } from "next";
import { site } from "@/data/site";
import { examRegions, isExamRegionSlug } from "@/data/byRegionExam";
import { GUMJUNG_LEVELS } from "@/data/gumjung/levels";
import { gumjungScheduleSlugForSidoLabel } from "@/data/gumjung/schedule";
import { GUMJUNG_MODIFIED } from "@/data/contentMeta";

const SITE_NAME = site.gumjung.name;
const isoKST = (d: string) => `${d}T00:00:00+09:00`;

const nfc = (s: string) => s.normalize("NFC");
const slugKey = (s: string): string => {
  try {
    return decodeURIComponent(s).normalize("NFC");
  } catch {
    return nfc(s);
  }
};

/** 라우트 slug → 표기명(253 시군구, examRegions 재사용). */
const regionNameBySlug = new Map(examRegions.map((r) => [nfc(r.slug), r.name]));

/** 시도별 시군구 그룹(examRegions 순서 유지) — 인근 시군구 클러스터용. */
const bySido = (() => {
  const m = new Map<string, { slug: string; name: string }[]>();
  for (const r of examRegions) {
    if (!m.has(r.sidoLabel)) m.set(r.sidoLabel, []);
    m.get(r.sidoLabel)!.push({ slug: r.slug, name: r.name });
  }
  return m;
})();
const sidoBySlug = new Map(examRegions.map((r) => [nfc(r.slug), r.sidoLabel]));

export type GumjungRegionLink = { label: string; href: string };

/**
 * 같은 시도 내 인근 시군구 4~6곳(내부링크 클러스터). examRegions 가나다 순 인접분에서 wrap 선택.
 * 데이터 재사용이라 빌드 영향 없음. 실재 slug 만 반환(404 없음).
 */
export function gumjungNearbyRegions(regionParam: string, count = 5): GumjungRegionLink[] {
  const key = slugKey(regionParam);
  const sido = sidoBySlug.get(key);
  if (!sido) return [];
  const list = bySido.get(sido) ?? [];
  if (list.length <= 1) return [];
  const idx = list.findIndex((r) => nfc(r.slug) === key);
  if (idx === -1) return [];
  const out: GumjungRegionLink[] = [];
  const n = Math.min(count, list.length - 1);
  for (let step = 1; out.length < n; step++) {
    const r = list[(idx + step) % list.length];
    if (nfc(r.slug) === key) break;
    out.push({ label: r.name, href: `/gumjung/by-region/${encodeURIComponent(r.slug)}` });
  }
  return out;
}

/**
 * 지역 title(브랜드명 없음, 검색 롱테일). 길면 뒤에서부터 탈락: "시험 일정" → "초졸".
 * 표시 상한 40자(한글 기준) — 긴 복합 시군구 대응.
 */
// title: "{지역} 검정고시" 앞머리 고정, "일정" 미포함. 급별(고졸·중졸) + 대상(자퇴생·성인) + 방식(화상).
// cap 40 — 길면 뒤에서부터 탈락: 화상 앞 조합 → 성인 → 자퇴생. (후보안은 검증 보고 참조, 1안 적용.)
function buildRegionTitle(regionName: string): string {
  const base = `${regionName} 검정고시 과외 - 고졸 중졸`;
  const full = `${base} 자퇴생 성인 1:1 화상`;
  if ([...full].length <= 40) return full;
  const drop1 = `${base} 자퇴생 1:1 화상`;
  if ([...drop1].length <= 40) return drop1;
  return `${base} 1:1 화상`;
}

// 빌드 검증: 최장 지역명 기준 title ≤40자 + 앞머리 "{지역} 검정고시" 고정(네이버 앞 25자 노출).
{
  const longest = examRegions.reduce((a, r) => (r.name.length > a.length ? r.name : a), "");
  const t = buildRegionTitle(longest);
  if ([...t].length > 40) throw new Error(`[byRegionGumjung] title >40자(${[...t].length}): ${t}`);
  if (!t.startsWith(`${longest} 검정고시`))
    throw new Error(`[byRegionGumjung] title 앞머리 "{지역} 검정고시" 규칙 위반: ${t}`);
}

/** 지역 파라미터가 검정고시 지역축(253 시군구)에 속하는지 — 어학시험축과 동일 판정 재사용. */
export function isGumjungRegionSlug(regionParam: string): boolean {
  return isExamRegionSlug(regionParam);
}

/** 지역 파라미터 → 표기명(축에 있으면 표준 표기명, 없으면 디코드값). */
export function gumjungRegionName(regionParam: string): string {
  return regionNameBySlug.get(slugKey(regionParam)) ?? slugKey(regionParam);
}

export type GumjungLevelLink = { label: string; href: string; note: string };

/** 급별 앵커 섹션(지역 페이지 — 요약 + 과목명 1줄 + 급별 상세 링크. 시험 전문은 급별 상세 전용). */
export type GumjungLevelSection = {
  slug: string;
  name: string; // "고졸" 등
  subjectsLine: string; // "국어·수학·영어·사회·과학·한국사"
  summary: string; // 1~2문장 요약(지역명·과목 포함, 전문 복제 없음)
  href: string;
};

export type GumjungRegionData = {
  regionSlug: string;
  regionName: string;
  sidoLabel: string; // 소속 시도(도/광역시) — 지역 변별 문맥용
  sidoContext: string; // 시도 문맥 1줄
  head: string; // "{지역} 검정고시"
  metaTitle: string;
  metaDescription: string;
  intro: string;
  /** 급별 요약 링크(고졸/중졸/초졸 상세). */
  levelLinks: GumjungLevelLink[];
  /** 급별 앵커 섹션(과목 키워드 자연 배치 + 상세 링크). */
  levelSections: GumjungLevelSection[];
  /** 일정·접수 섹션(소속 시도 일정 축 위임). scheduleSlug 없으면 허브로 링크. */
  scheduleBody: string;
  scheduleHref: string;
  /** Q&A 2문항(FAQPage 구조화 대상 — 실제 렌더). */
  faq: { q: string; a: string }[];
};

/** 급별 요약 노트(지역 페이지 요약용 — 시험 전문은 급별 상세에). */
const LEVEL_SUMMARY: Record<string, string> = {
  gojol: "필수 6과목 + 선택 1과목",
  jungjol: "필수 5과목 + 선택 1과목",
  chojol: "필수 4과목 + 선택 2과목",
};

/** (지역) → 페이지 데이터. 지역축 밖이면 null(라우트에서 notFound). */
export function buildGumjungRegionData(regionParam: string): GumjungRegionData | null {
  if (!isExamRegionSlug(regionParam)) return null;
  const regionSlug = slugKey(regionParam);
  const regionName = gumjungRegionName(regionParam);

  const sidoLabel = sidoBySlug.get(nfc(regionSlug)) ?? "";
  const head = `${regionName} 검정고시`;
  // title 은 브랜드명 없이 검색 롱테일(길이 초과 시 뒤에서부터 탈락).
  const metaTitle = buildRegionTitle(regionName);
  // desc: 급별 3 + 자퇴생·성인 + 전과목 1:1 + 방문·화상 + 일정·접수 안내(≤160, slice 안전망).
  const metaDescription =
    `${regionName} 고졸·중졸·초졸 검정고시(검고) 과외. 자퇴생부터 성인까지 전과목 1:1 방문·화상 수업으로 준비합니다. ${sidoLabel || regionName} 검정고시 일정·접수 안내와 급별 공부법을 확인하고 무료 상담으로 시작하세요.`.slice(
      0,
      160,
    );
  const intro =
    `${regionName}에서 검정고시를 준비하는 이유는 저마다 다릅니다. 검정고시(검고)는 출제 범위가 정해져 있어 방향만 잡으면 혼자보다 빠르게 준비할 수 있습니다. ` +
    `상담에서 현재 상황과 목표 시기를 확인하고 맞는 선생님을 1:1로 연결해 드립니다.`;
  // 시도 문맥 1줄 — 253장 지역 변별 강화(급별·과목 키워드 자연 포함).
  const sidoContext = sidoLabel
    ? `${sidoLabel} ${regionName}에서 고졸·중졸·초졸 검정고시를 급별로, 국어·수학·영어 등 필요한 과목부터 1:1로 안내합니다.`
    : `${regionName}에서 고졸·중졸·초졸 검정고시를 급별로, 국어·수학·영어 등 필요한 과목부터 1:1로 안내합니다.`;

  const levelLinks: GumjungLevelLink[] = GUMJUNG_LEVELS.map((l) => ({
    label: `${l.name} 검정고시`,
    href: `/gumjung/${l.slug}`,
    note: LEVEL_SUMMARY[l.slug] ?? "",
  }));

  // 급별 앵커 섹션 — 과목명 1줄 + 요약(전문 복제 없음) + 급별 상세 링크.
  const levelSections: GumjungLevelSection[] = GUMJUNG_LEVELS.map((l) => {
    const subjectsLine = l.requiredSubjects.map((s) => s.label).join("·");
    return {
      slug: l.slug,
      name: l.name,
      subjectsLine,
      summary:
        `${regionName} ${l.name} 검정고시는 ${subjectsLine} ${l.requiredSubjects.length}과목을 준비합니다. ` +
        `지금 막히는 과목부터 1:1로 짚어 준비 기간을 줄입니다. 시험 범위·응시 자격 등 자세한 정보는 급별 상세에서 확인하세요.`,
      href: `/gumjung/${l.slug}`,
    };
  });

  // 일정·접수 섹션 — 소속 시도 일정 축으로 위임(전문 복제 없음). 시도 미해석 시 허브로.
  const scheduleSlug = sidoLabel ? gumjungScheduleSlugForSidoLabel(sidoLabel) : null;
  const scheduleHref = scheduleSlug ? `/gumjung/schedule/${scheduleSlug}` : "/gumjung/schedule";
  const scheduleBody =
    `검정고시는 ${sidoLabel || "해당 시도"} 교육청이 연 2회(상반기·하반기) 시행합니다. ` +
    `회차마다 공고 → 원서접수 → 시험 → 합격 발표 순으로 진행되며, 구체적인 날짜는 해당 회차 공고에서 확인할 수 있습니다.`;

  // Q&A 2문항(FAQPage 구조화 대상 — 자퇴 답변은 확인된 사실만).
  const faq = [
    {
      q: `${regionName} 검정고시 시험 일정은 언제인가요?`,
      a: `검정고시는 ${sidoLabel || "해당 시도"} 교육청 주관으로 연 2회 시행됩니다. 상반기·하반기 각 회차의 접수 기간과 시험일은 해당 회차 공고에서 확인할 수 있으며, ${sidoLabel || regionName} 일정 페이지에서 안내해 드립니다.`,
    },
    {
      q: "자퇴 후 언제 시험을 볼 수 있나요?",
      a: "고졸 검정고시는 학교에서 제적된 날로부터 공고일 기준 6개월 이상 지나야 응시할 수 있습니다(등록 장애인은 예외). 중졸·초졸 검정고시는 이러한 경과 기간 요건이 없습니다. 자세한 기준은 해당 회차 공고에서 확인하세요.",
    },
  ];

  return {
    regionSlug,
    regionName,
    sidoLabel,
    sidoContext,
    head,
    metaTitle,
    metaDescription,
    intro,
    levelLinks,
    levelSections,
    scheduleBody,
    scheduleHref,
    faq,
  };
}

/** 지역 메타데이터 빌더. og 는 청록 동적 썸네일. */
export function buildGumjungRegionMetadata(regionParam: string): Metadata {
  const data = buildGumjungRegionData(regionParam);
  if (!data) return {};
  const canonical = `/gumjung/by-region/${encodeURIComponent(data.regionSlug)}`;
  const thumb = `/api/power-thumb/gumjung-region/${encodeURIComponent(data.regionSlug)}/base?v=4`;
  const thumbAlt = `${data.head} 과외 안내`;
  return {
    title: { absolute: data.metaTitle },
    description: data.metaDescription,
    alternates: { canonical },
    robots: { index: true, follow: true },
    // 검색 신선도 신호 — 발행일=수정일=GUMJUNG_MODIFIED(신규 축). 화면 표기는 하지 않음.
    other: {
      "article:published_time": isoKST(GUMJUNG_MODIFIED),
      "article:modified_time": isoKST(GUMJUNG_MODIFIED),
    },
    openGraph: {
      title: data.metaTitle,
      description: data.metaDescription,
      url: canonical,
      type: "website",
      locale: "ko_KR",
      siteName: SITE_NAME,
      images: [
        { url: thumb, width: 1200, height: 630, alt: thumbAlt },
        { url: `${thumb}&r=sq`, width: 1080, height: 1080, alt: thumbAlt },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: data.metaTitle,
      description: data.metaDescription,
      // 네이버 썸네일 수집 안정 — twitter:image 치수·alt 명시(메인축과 동일 형식).
      images: [{ url: thumb, width: 1200, height: 630, alt: thumbAlt }],
    },
  };
}

/** 파일럿 SSG 지역 slug — 앞 20개 시군구(나머지는 ISR). */
export function gumjungRegionPilotSlugs(): string[] {
  return examRegions.slice(0, 20).map((r) => r.slug);
}

/** sitemap 용 전체 지역 slug(253). */
export function allGumjungRegionSlugs(): string[] {
  return examRegions.map((r) => r.slug);
}
