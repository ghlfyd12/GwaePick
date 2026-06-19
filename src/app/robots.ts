import type { MetadataRoute } from "next";
import { site } from "@/data/site";

/*
 * 동적 robots.txt — /robots.txt 로 노출.
 * 전체 색인 허용 + sitemap 위치를 명시한다(네이버 서치어드바이저/구글봇).
 */
export default function robots(): MetadataRoute.Robots {
  const base = site.url.replace(/\/$/, "");
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
