/**
 * 검고의참견(/gumjung) 사이트맵 URL 목록·청크 — 278장(급별 3 + 급별×과목 15 + 지역 253 + 가이드 7).
 *
 * 항상 사이트맵 맨 뒤 id 로 append 하므로 기존 shard id(코어·학교·파워·도dong·고교허브)는 불변이다.
 * 지역 세그먼트(한글)는 여기서 encodeURIComponent 로 안전 처리해 담는다(렌더 시 추가 인코딩 불필요).
 */
import { SITEMAP_URLS_PER_FILE } from "@/lib/schoolSitemap";
import { GUMJUNG_LEVELS } from "@/data/gumjung/levels";
import { allGumjungSubjectPairs } from "@/data/gumjung/subjects";
import { allGumjungRegionSlugs } from "@/data/byRegionGumjung";
import { GUMJUNG_GUIDE_SLUGS } from "@/data/gumjung/guides";

const enc = (s: string) => encodeURIComponent(s);

/** 전체 검고 페이지 경로(도메인 제외). 모듈 1회 계산. */
export const GUMJUNG_PATHS: string[] = (() => {
  const out: string[] = [];
  // 급별 상세 3
  for (const l of GUMJUNG_LEVELS) out.push(`/gumjung/${l.slug}`);
  // 급별×과목 15
  for (const { level, subject } of allGumjungSubjectPairs())
    out.push(`/gumjung/${level}/${subject}`);
  // 지역×검정고시 253(한글 slug 인코딩)
  for (const slug of allGumjungRegionSlugs())
    out.push(`/gumjung/by-region/${enc(slug)}`);
  // 유형 가이드 7
  for (const g of GUMJUNG_GUIDE_SLUGS) out.push(`/gumjung/guide/${g}`);
  return out;
})();

export const GUMJUNG_URL_COUNT = GUMJUNG_PATHS.length;

/** 검고 청크 수(최소 1) — 항상 맨 뒤 id 라 기존 shard id 불변. */
export const GUMJUNG_SITEMAP_CHUNKS = Math.max(
  1,
  Math.ceil(GUMJUNG_URL_COUNT / SITEMAP_URLS_PER_FILE),
);
