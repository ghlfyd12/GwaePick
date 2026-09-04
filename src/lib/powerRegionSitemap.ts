/**
 * /power 지역 축(963 + 확장) 사이트맵 분할 — 학교 청크와 동일 관례(청크당 40,000 URL).
 *
 * by-region 과목 페이지가 코어(id 0) 40,000 한도를 넘기므로 별도 shard 로 분리한다.
 * (sitemap.ts: id 0 코어 → 1..S 학교 청크 → S+1..S+P 파워 지역 청크.)
 */
import {
  SITEMAP_URLS_PER_FILE,
  SCHOOL_SITEMAP_CHUNKS,
  SCHOOL_HUB_SITEMAP_CHUNKS,
} from "@/lib/schoolSitemap";
import { allByRegionPairs } from "@/data/byRegionSubject";
import { allByExamPairs } from "@/data/byRegionExam";
import { provinceExpansionDongPairs } from "@/data/cityDong";
import { subjects as detailSubjects } from "@/data/subjects";
import { GUMJUNG_SITEMAP_CHUNKS } from "@/lib/gumjungSitemap";
import { HIGH_DETAIL_SITEMAP_CHUNKS } from "@/lib/highDetailSitemap";

/** 지역 축 전체 (지역×과목) 조합 — 모듈 1회 계산. */
export const POWER_REGION_PAIRS = allByRegionPairs();
export const POWER_REGION_PAIR_COUNT = POWER_REGION_PAIRS.length;

/** 파워 지역 청크 수(최소 1). */
export const POWER_REGION_SITEMAP_CHUNKS = Math.max(
  1,
  Math.ceil(POWER_REGION_PAIR_COUNT / SITEMAP_URLS_PER_FILE),
);

/** 어학시험 축 전체 (지역×시험) 조합 — 253 시군구 × 13시험. 모듈 1회 계산. */
export const POWER_EXAM_PAIRS = allByExamPairs();
export const POWER_EXAM_PAIR_COUNT = POWER_EXAM_PAIRS.length;

/** 어학시험 청크 수(최소 1) — 기존 청크 뒤에 append(기존 id 불변). */
export const POWER_EXAM_SITEMAP_CHUNKS = Math.max(
  1,
  Math.ceil(POWER_EXAM_PAIR_COUNT / SITEMAP_URLS_PER_FILE),
);

/** 도 지역 동×과목 축(3차) URL 수 — 기초 동(+명소 복구) × 8과목. 모듈 1회 계산. */
export const PROVINCE_DONG_URL_COUNT =
  provinceExpansionDongPairs.length * detailSubjects.length;

/** 도 지역 dong 청크 수(최소 1) — 항상 맨 뒤 id 라 기존 shard id 불변. */
export const PROVINCE_DONG_SITEMAP_CHUNKS = Math.max(
  1,
  Math.ceil(PROVINCE_DONG_URL_COUNT / SITEMAP_URLS_PER_FILE),
);

/**
 * 전체 사이트맵 파일 수(단일 소스) = 코어 1 + 학교 청크 + 파워 지역 청크 + 어학시험 청크
 * + 도 지역 dong 청크 + 고교 허브 청크. robots·index·sitemap 공유.
 * 새 청크는 항상 맨 뒤 id 라 기존 shard id 불변.
 */
export const TOTAL_SITEMAP_COUNT =
  1 +
  SCHOOL_SITEMAP_CHUNKS +
  POWER_REGION_SITEMAP_CHUNKS +
  POWER_EXAM_SITEMAP_CHUNKS +
  PROVINCE_DONG_SITEMAP_CHUNKS +
  SCHOOL_HUB_SITEMAP_CHUNKS +
  GUMJUNG_SITEMAP_CHUNKS +
  HIGH_DETAIL_SITEMAP_CHUNKS;
