import type { MetadataRoute } from "next";
import { regions } from "@/data/regions";
import { site } from "@/data/site";
import { subjects } from "@/data/pseo";
import { gyeonggi } from "@/data/gyeonggi";
import { getSido } from "@/data/sidoRegions";
import { subjects as detailSubjects } from "@/data/subjects";
import { PILOT } from "@/data/dongPageCopy";
import { powerRegionSlugs } from "@/data/powerRegions";
import {
  SITEMAP_URLS_PER_FILE,
  SCHOOL_PAIR_COUNT,
  TOTAL_SITEMAP_COUNT,
  schoolPairAt,
} from "@/lib/schoolSitemap";

/*
 * 동적 sitemap — 분할 구조(/sitemap/[id].xml). robots.txt 가 각 파일 URL 을 모두 가리킨다.
 *
 *  - id 0  : 코어(메인 + 지역 랜딩 + pSEO + 과목 단독 + 동×과목 파일럿 + 파워 지역).
 *  - id 1~N: 학교×과목 상세(/tutoring/by-school/{학교}/{과목}) — 약 12,097개 학교 × 8과목.
 *            URL 5만 개 한도(사이트맵당)에 걸리므로 청크로 분할한다.
 *
 * 한글 슬러그는 encodeURIComponent 로 안전 출력. 도메인은 site.url 단일 소스.
 * 학교 페이지는 ISR(온디맨드) 이지만, 사이트맵에 모두 실어 색인 후보로 노출한다(정직한 실제 페이지).
 */

const base = site.url.replace(/\/$/, "");
const enc = (s: string) => encodeURIComponent(s);

/**
 * 사이트맵 파일 구성: id 0(코어) + 학교 청크 1..N.
 * Next.js 가 /sitemap/[id].xml 로 개별 파일을 생성한다(robots.txt 에서 전부 참조).
 */
export async function generateSitemaps() {
  return Array.from({ length: TOTAL_SITEMAP_COUNT }, (_, i) => ({ id: i }));
}

/** id 0 — 학교 외 기존 페이지 전부. */
function coreSitemap(lastModified: Date): MetadataRoute.Sitemap {
  const home: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified, changeFrequency: "weekly", priority: 1 },
  ];

  const regionPages: MetadataRoute.Sitemap = regions.map((r) => ({
    url: `${base}/${enc(r.id)}`,
    lastModified,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // pSEO: 경기 시도×과목 (5) + 시군구×과목 (시군구 수 × 5)
  const sido = gyeonggi.sidoLabel; // "경기"
  const pseoPages: MetadataRoute.Sitemap = [];
  for (const subj of subjects) {
    pseoPages.push({
      url: `${base}/tutoring/by-region/${enc(sido)}/${enc(subj.slug)}`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.7,
    });
    for (const sg of gyeonggi.sigungu) {
      pseoPages.push({
        url: `${base}/tutoring/by-region/${enc(sido)}/${enc(sg.slug)}/${enc(subj.slug)}`,
        lastModified,
        changeFrequency: "weekly",
        priority: 0.6,
      });
    }
  }

  // 과목 단독 상세 — /tutoring/by-subject/[과목] 8개(영문 slug)
  const subjectDetailPages: MetadataRoute.Sitemap = detailSubjects.map((subj) => ({
    url: `${base}/tutoring/by-subject/${subj.slug}`,
    lastModified,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  // 동×과목 상세 — 파일럿(서울 4구·고양 3구)만 등록(전국 일괄 금지)
  const pilotDetail: MetadataRoute.Sitemap = [];
  for (const p of PILOT) {
    const sd = getSido(p.sido);
    if (!sd) continue;
    for (const sgSlug of p.sigungu) {
      const sg = sd.sigungu.find((s) => s.slug === sgSlug);
      if (!sg) continue;
      for (const dong of sg.dong)
        for (const subj of detailSubjects)
          pilotDetail.push({
            url: `${base}/tutoring/by-region/${p.sido}/${sg.slug}/${dong.slug}/${subj.slug}`,
            lastModified,
            changeFrequency: "weekly",
            priority: 0.5,
          });
    }
  }

  // 파워 홈페이지 지역별 영어회화 — /power/[지역명]
  const powerRegionPages: MetadataRoute.Sitemap = powerRegionSlugs.map((slug) => ({
    url: `${base}/power/${enc(slug)}`,
    lastModified,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [
    ...home,
    ...regionPages,
    ...subjectDetailPages,
    ...pseoPages,
    ...pilotDetail,
    ...powerRegionPages,
  ];
}

/** id 1..N — 학교×과목 상세 한 청크. 평탄화된 (학교,과목) 쌍을 슬라이스로만 생성(메모리 안전). */
function schoolSitemap(chunk: number, lastModified: Date): MetadataRoute.Sitemap {
  const start = chunk * SITEMAP_URLS_PER_FILE;
  const end = Math.min(start + SITEMAP_URLS_PER_FILE, SCHOOL_PAIR_COUNT);
  const out: MetadataRoute.Sitemap = [];
  for (let p = start; p < end; p++) {
    const { school, subject } = schoolPairAt(p);
    out.push({
      url: `${base}/tutoring/by-school/${enc(school.slug)}/${subject.slug}`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }
  return out;
}

export default async function sitemap({
  id,
}: {
  // Next.js 16: 사이트맵 id 는 Promise 로 전달되므로 await 해서 쓴다.
  id: Promise<number> | number;
}): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const n = Number(await id);
  // id 0 = 코어, id 1..N = 학교 청크(0-based chunk = n - 1).
  return n <= 0 ? coreSitemap(lastModified) : schoolSitemap(n - 1, lastModified);
}
