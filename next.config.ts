import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return {
      // 파일시스템 라우팅보다 먼저 적용 — /sitemap.xml 을 사이트맵 인덱스 라우트로 서빙.
      // (generateSitemaps 는 /sitemap/[id].xml 청크만 만들고 /sitemap.xml 은 제공하지 않음)
      beforeFiles: [
        { source: "/sitemap.xml", destination: "/sitemap-index.xml" },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
