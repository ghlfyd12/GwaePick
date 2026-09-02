import type { Metadata } from "next";
import GumjungRegionsBrowser from "@/components/gumjung/GumjungRegionsBrowser";
import { gumjungRegionGroups, gumjungSidoChips } from "@/data/gumjungSearch";
import { site } from "@/data/site";

/*
 * /gumjung/regions — 검고의참견 지역별 안내 인덱스(내부 링크 허브).
 * 시도 17 그룹으로 253 시군구 링크를 초기 렌더에 포함(계층 크롤·탐색). 단일 세그라 [level] catch 보다 우선.
 * 색은 accent 토큰(청록). dynamicParams=false.
 */
export const dynamicParams = false;

const PAGE_TITLE = "지역별 검정고시 과외 - 고졸 중졸 초졸 1:1 | 검고의참견";
const PAGE_DESCRIPTION =
  "전국 시·도·시군구별 고졸·중졸·초졸 검정고시 1:1 맞춤 과외 안내. 우리 지역에서 전화·화상으로 시작할 수 있도록 지역별 검정고시 페이지를 모았습니다.";

export const metadata: Metadata = {
  title: { absolute: PAGE_TITLE },
  description: PAGE_DESCRIPTION,
  alternates: { canonical: "/gumjung/regions" },
  robots: { index: true, follow: true },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: "/gumjung/regions",
    type: "website",
    locale: "ko_KR",
    siteName: site.gumjung.name,
    images: [site.gumjung.ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    images: [site.gumjung.ogImage],
  },
};

export default function GumjungRegionsIndexPage() {
  const groups = gumjungRegionGroups();
  const totalSigungu = groups.reduce((n, g) => n + g.sigungu.length, 0);
  const sidoChips = gumjungSidoChips();

  return (
    <>
      <section className="border-b border-line bg-surface px-5 py-12 sm:px-6 sm:py-14">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent">
            검고의참견 · 지역별 안내
          </p>
          <h1 className="mt-2 break-keep text-3xl font-bold leading-snug text-ink sm:text-4xl">
            지역별 검정고시 안내
          </h1>
          <p className="mx-auto mt-4 max-w-2xl break-keep text-base leading-relaxed text-muted sm:text-lg">
            전국 17개 시·도와 {totalSigungu}개 시·군·구의 고졸·중졸·초졸 검정고시 1:1 수업 안내를 모았습니다. 지역을 검색하거나 시도를 골라 바로 시작하세요.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-5 py-12 sm:px-6 sm:py-16">
        <GumjungRegionsBrowser sidoChips={sidoChips} sigunguGroups={groups} />
      </div>
    </>
  );
}
