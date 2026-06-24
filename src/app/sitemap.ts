import type { MetadataRoute } from "next";
import { regions } from "@/data/regions";
import { site } from "@/data/site";
import { subjects } from "@/data/pseo";
import { gyeonggi } from "@/data/gyeonggi";
import { getSido } from "@/data/sidoRegions";
import { subjects as detailSubjects } from "@/data/subjects";
import { PILOT } from "@/data/dongPageCopy";

/*
 * 동적 sitemap.xml — /sitemap.xml 로 노출.
 * 메인(/) + 기존 지역 랜딩(/[id]) + pSEO 시도×과목·시군구×과목(경기) 을 나열.
 * 동/학년 레벨(수만 페이지)은 ②에서 별도 sitemap index 로 분리 예정.
 * 한글 슬러그는 encodeURIComponent 로 안전 출력. 도메인은 site.url 단일 소스.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = site.url.replace(/\/$/, "");
  const lastModified = new Date();
  const enc = (s: string) => encodeURIComponent(s);

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

  return [...home, ...regionPages, ...pseoPages, ...pilotDetail];
}
