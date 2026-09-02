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

const SITE_NAME = site.gumjung.name;

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
  const metaTitle = `${regionName} 검정고시 과외 - 고졸 중졸 1:1 | ${SITE_NAME}`;
  const metaDescription =
    `${regionName}에서 고졸·중졸·초졸 검정고시를 준비하는 1:1 맞춤 과외. 급별 안내와 출제 범위를 확인하고 맞는 선생님을 연결해 드립니다. 첫 상담은 무료입니다.`.slice(
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
