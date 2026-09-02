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
function buildRegionTitle(regionName: string): string {
  const full = `${regionName} 검정고시 과외 - 고졸 중졸 초졸 1:1 개인과외 공부법 시험 일정`;
  if (full.length <= 40) return full;
  const noSchedule = `${regionName} 검정고시 과외 - 고졸 중졸 초졸 1:1 개인과외 공부법`;
  if (noSchedule.length <= 40) return noSchedule;
  return `${regionName} 검정고시 과외 - 고졸 중졸 1:1 개인과외 공부법`;
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

export type GumjungRegionData = {
  regionSlug: string;
  regionName: string;
  head: string; // "{지역} 검정고시"
  metaTitle: string;
  metaDescription: string;
  intro: string;
  /** 급별 요약 링크(고졸/중졸/초졸 상세). */
  levelLinks: GumjungLevelLink[];
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

  const head = `${regionName} 검정고시`;
  // title 은 브랜드명 없이 검색 롱테일(길이 초과 시 뒤에서부터 탈락).
  const metaTitle = buildRegionTitle(regionName);
  const metaDescription =
    `${regionName}에서 고졸·중졸·초졸 검정고시를 1:1로 준비합니다. 급별 안내와 공부법을 확인하고 맞는 선생님을 연결해 드립니다. 무료 상담으로 시작하세요.`.slice(
      0,
      158,
    );
  const intro =
    `${regionName}에서 검정고시를 준비하는 이유는 저마다 다릅니다. 검정고시는 출제 범위가 정해져 있어 방향만 잡으면 혼자보다 빠르게 준비할 수 있습니다. ` +
    `상담에서 현재 상황과 목표 시기를 확인하고 맞는 선생님을 1:1로 연결해 드립니다.`;

  const levelLinks: GumjungLevelLink[] = GUMJUNG_LEVELS.map((l) => ({
    label: `${l.name} 검정고시`,
    href: `/gumjung/${l.slug}`,
    note: LEVEL_SUMMARY[l.slug] ?? "",
  }));

  return { regionSlug, regionName, head, metaTitle, metaDescription, intro, levelLinks };
}

/** 지역 메타데이터 빌더. og 는 청록 동적 썸네일. */
export function buildGumjungRegionMetadata(regionParam: string): Metadata {
  const data = buildGumjungRegionData(regionParam);
  if (!data) return {};
  const canonical = `/gumjung/by-region/${encodeURIComponent(data.regionSlug)}`;
  const thumb = `/api/power-thumb/gumjung-region/${encodeURIComponent(data.regionSlug)}/base`;
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

/** 파일럿 SSG 지역 slug — 앞 20개 시군구(나머지는 ISR). */
export function gumjungRegionPilotSlugs(): string[] {
  return examRegions.slice(0, 20).map((r) => r.slug);
}

/** sitemap 용 전체 지역 slug(253). */
export function allGumjungRegionSlugs(): string[] {
  return examRegions.map((r) => r.slug);
}
