import { regions } from "@/data/regions";
import { site } from "@/data/site";
import {
  RSS_DEFAULT_DATE,
  rssStaticDates,
  rssRegionDates,
  toRfc822,
} from "@/data/rssFeed";

/*
 * 동적 RSS 2.0 피드 — /rss.xml 로 노출.
 * 메인(/) + 주요 정적 섹션 페이지 + 지역 랜딩(/[id]) 을 항목(item)으로 나열한다.
 * 수천 개 pSEO 조합(시도×과목 등)은 sitemap.xml 에만 두고 RSS 에서는 제외한다.
 * 도메인은 site.url 단일 소스. 한글 슬러그는 encodeURIComponent 로 안전 출력.
 *
 * pubDate 는 요청 시각이 아니라 data/rssFeed.ts 의 고정 날짜(항목별)를 RFC 822 로 출력한다.
 * lastBuildDate 만 피드 재생성 시각(생성 시점 1회)으로 둔다.
 */

// 정적 재생성(ISR) — 1시간마다 갱신. 같은 캐시 창에서는 동일 XML 을 반환한다.
export const revalidate = 3600;

/** XML 텍스트 노드용 최소 이스케이프. */
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

type FeedItem = {
  title: string;
  path: string;
  description: string;
};

export async function GET() {
  const base = site.url.replace(/\/$/, "");
  const enc = (s: string) => encodeURIComponent(s);
  // lastBuildDate — 피드 재생성 시각(생성 시 1회 평가, revalidate 창 동안 고정).
  const buildDate = new Date().toUTCString();

  const channelTitle = site.name;
  const channelDescription = site.description;

  const staticItems: FeedItem[] = [
    {
      title: `${site.name} — ${site.slogan}`,
      path: "/",
      description: site.description,
    },
    {
      title: "교사진 — 직접 가르쳐 온 선생님",
      path: "/teachers",
      description:
        "우리 아이를 가르칠 선생님을 직접 가르쳐 본 선생님이 1:1로 연결합니다.",
    },
    {
      title: "학교별 1:1 과외",
      path: "/tutoring/by-school",
      description: "학교별 내신·기출에 맞춘 1:1 맞춤 과외를 찾아보세요.",
    },
    {
      title: "지역별 1:1 과외",
      path: "/tutoring/by-region",
      description: "우리 동네 가까운 곳에서 만나는 1:1 맞춤 과외를 찾아보세요.",
    },
    {
      title: "과목별 1:1 과외",
      path: "/tutoring/by-subject",
      description: "취약 과목 집중 관리부터 공부 습관까지, 과목별 1:1 맞춤 과외.",
    },
  ];

  const regionItems: FeedItem[] = regions.map((r) => ({
    title: `${r.name} 1:1 맞춤 과외`,
    path: `/${enc(r.id)}`,
    description: `${r.cityQuery} 학부모를 위한 ${site.name}의 1:1 맞춤 과외 상담.`,
  }));

  // 항목별 발행일(ISO) 부여 — 정적 섹션은 path, 지역은 id 기준. 없으면 기준일.
  const staticDated = staticItems.map((it) => ({
    ...it,
    lastUpdated: rssStaticDates[it.path] ?? RSS_DEFAULT_DATE,
  }));
  const regionDated = regions.map((r, i) => ({
    ...regionItems[i],
    lastUpdated: rssRegionDates[r.id] ?? RSS_DEFAULT_DATE,
  }));
  const items = [...staticDated, ...regionDated];

  const itemsXml = items
    .map((item) => {
      const link = `${base}${item.path}`;
      return `    <item>
      <title>${esc(item.title)}</title>
      <link>${esc(link)}</link>
      <guid isPermaLink="true">${esc(link)}</guid>
      <description>${esc(item.description)}</description>
      <pubDate>${toRfc822(item.lastUpdated)}</pubDate>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(channelTitle)}</title>
    <link>${esc(base)}</link>
    <description>${esc(channelDescription)}</description>
    <language>ko-kr</language>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <atom:link href="${esc(`${base}/rss.xml`)}" rel="self" type="application/rss+xml" />
${itemsXml}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
