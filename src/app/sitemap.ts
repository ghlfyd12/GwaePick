import type { MetadataRoute } from "next";
import { regions } from "@/data/regions";
import { site } from "@/data/site";

/*
 * 동적 sitemap.xml — /sitemap.xml 로 노출.
 * 메인(/) + 모든 지역 랜딩(/[id])을 나열해 네이버 서치어드바이저/구글 색인을 돕는다.
 * 절대경로 기준 도메인은 site.url 한 곳에서 가져온다.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = site.url.replace(/\/$/, "");
  const lastModified = new Date();

  const home: MetadataRoute.Sitemap = [
    {
      url: `${base}/`,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
  ];

  const regionPages: MetadataRoute.Sitemap = regions.map((r) => ({
    // 한글 슬러그는 인코딩해 안전한 URL 로 출력
    url: `${base}/${encodeURIComponent(r.id)}`,
    lastModified,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...home, ...regionPages];
}
