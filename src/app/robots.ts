import type { MetadataRoute } from "next";
import { site } from "@/data/site";

/*
 * 동적 robots.txt — /robots.txt 로 노출.
 * 전체 색인 허용(학교 페이지 포함) + 사이트맵 인덱스(/sitemap.xml) 한 곳을 가리킨다.
 * 인덱스는 next.config.ts rewrite 로 /sitemap-index.xml(<sitemapindex>) 을 서빙하며,
 * 개별 청크(/sitemap/[id].xml)는 그 인덱스가 나열한다(구글·네이버 모두 인덱스만 제출하면 됨).
 */
export default function robots(): MetadataRoute.Robots {
  const base = site.url.replace(/\/$/, "");
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // 추적 파라미터가 붙은 중복 URL 은 색인에서 제외(정규 URL = canonical).
      disallow: ["/*?*utm_", "/*?*fbclid", "/*?*gclid"],
    },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
