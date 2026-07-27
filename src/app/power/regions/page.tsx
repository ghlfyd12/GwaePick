import type { Metadata } from "next";
import Link from "next/link";
import { powerRegionIndexGroups } from "@/data/powerRegionsExpansion";
import { site } from "@/data/site";

/*
 * /power/regions — 어학의참견 지역별 안내 인덱스(내부 링크 허브).
 *
 * 시도 17개 그룹으로 나누고, 각 시도 블록에 [시도 허브 링크(굵게)] + 하위 시군구 링크 전량(253)을
 * 흘려보낸다(계층 크롤·탐색용). 시군구 앵커는 지역명만("성남시 분당구"), 도착 slug 와 동일.
 * 동 단위는 나열하지 않는다 — 시군구 허브가 이미 하위 동 링크를 보유한다.
 * 단일 세그(/power/regions)라 /power/[region] catch-all 보다 정적 라우트가 우선 → 충돌 없음.
 * 색은 accent 토큰만(퍼플, /power 스코프). 세로 목록.
 */
export const dynamicParams = false;

const PAGE_TITLE = "지역별 어학과외 영어회화 일본어 중국어 1:1 | 어학의참견";
const PAGE_DESCRIPTION =
  "전국 시·도·시군구별 영어·일본어·중국어 1:1 회화·과외 안내. 우리 동네에서 방문·온라인으로 시작할 수 있도록 지역별 어학 수업 페이지를 모았습니다.";

export const metadata: Metadata = {
  title: { absolute: PAGE_TITLE },
  description: PAGE_DESCRIPTION,
  alternates: { canonical: "/power/regions" },
  robots: { index: true, follow: true },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: "/power/regions",
    type: "website",
    locale: "ko_KR",
    siteName: site.name,
    images: [site.ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    images: [site.ogImage],
  },
};

export default function PowerRegionsIndexPage() {
  const groups = powerRegionIndexGroups();
  const totalSigungu = groups.reduce((n, g) => n + g.sigungu.length, 0);

  return (
    <>
      {/* Hero */}
      <section className="border-b border-line bg-surface px-5 py-12 sm:px-6 sm:py-14">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent">
            어학의참견 · 지역별 안내
          </p>
          <h1 className="mt-2 break-keep text-3xl font-bold leading-snug text-ink sm:text-4xl">
            지역별 어학과외 안내
          </h1>
          <p className="mx-auto mt-4 max-w-2xl break-keep text-base leading-relaxed text-muted sm:text-lg">
            전국 17개 시·도와 {totalSigungu}개 시·군·구의 영어·일본어·중국어 1:1 수업 안내를
            모았습니다. 우리 동네를 찾아 방문·온라인으로 바로 시작하세요.
          </p>
        </div>
      </section>

      {/* 시도별 시군구 목록 */}
      <div className="mx-auto max-w-3xl px-5 py-12 sm:px-6 sm:py-16">
        <ul className="space-y-10">
          {groups.map((group) => (
            <li key={group.sidoLabel}>
              <h2 className="break-keep border-b border-line pb-2 text-xl font-bold sm:text-2xl">
                <Link
                  href={`/power/${encodeURIComponent(group.sidoSlug)}`}
                  className="text-accent transition-colors hover:underline"
                >
                  {group.sidoLabel}
                </Link>
              </h2>
              <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
                {group.sigungu.map((sg) => (
                  <li key={sg.slug}>
                    <Link
                      href={`/power/${encodeURIComponent(sg.slug)}`}
                      className="break-keep text-[13px] font-medium text-ink transition-colors hover:text-accent hover:underline sm:text-sm"
                    >
                      {sg.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
