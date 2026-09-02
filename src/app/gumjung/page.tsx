import type { Metadata } from "next";
import Link from "next/link";
import ConsultForm from "@/components/ConsultForm";
import JsonLd from "@/components/JsonLd";
import GumjungHero from "@/components/gumjung/GumjungHero";
import { site } from "@/data/site";
import { GUMJUNG_LEVELS } from "@/data/gumjung/levels";
import { GUMJUNG_GUIDES } from "@/data/gumjung/guides";

/*
 * /gumjung — 검고의참견 홈(축 진입 허브).
 * 급별 3 + 유형 가이드 7(#guides) + 지역 안내 + 상담. 헤더·푸터·플로팅은 검고 스코프(청록) 자동 상속.
 */

const SITE_URL = site.url.replace(/\/$/, "");
const abs = (p: string) => `${SITE_URL}${p}`;
const CONSULT_ANCHOR = "#consult";

const PAGE_TITLE = "검고의참견 - 고졸 중졸 초졸 검정고시 1:1 맞춤 과외";
const PAGE_DESCRIPTION =
  "학교 밖에서 나에게 맞는 속도로 준비하는 검정고시 1:1 맞춤 과외. 고졸·중졸·초졸 급별 안내와 지역·유형별 가이드, 직접 가르쳐 온 선생님 상담을 모았습니다.";

export const metadata: Metadata = {
  title: { absolute: PAGE_TITLE },
  description: PAGE_DESCRIPTION,
  alternates: { canonical: "/gumjung" },
  robots: { index: true, follow: true },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: "/gumjung",
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

const LEVEL_NOTE: Record<string, string> = {
  gojol: "필수 6과목 + 선택 1과목",
  jungjol: "필수 5과목 + 선택 1과목",
  chojol: "필수 4과목 + 선택 2과목",
};

export default function GumjungHomePage() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "검고의참견", item: abs("/gumjung") },
      ],
    },
  ];

  return (
    <>
      <JsonLd data={jsonLd} />

      {/* Hero (개편) */}
      <GumjungHero
        eyebrow="검고의참견"
        title="검정고시, 나에게 맞는 속도로"
        sub="방향이 정해지면 준비는 단순해집니다. 1:1로 시작합니다."
        ctaHref={CONSULT_ANCHOR}
        ctaLabel={site.cta.label}
      />

      <div className="mx-auto max-w-3xl space-y-16 px-5 py-14 sm:px-6 sm:py-20">
        {/* 도입 본문(기존 히어로 서브 문단 이동 — SEO 텍스트 보존) */}
        <p className="break-keep text-base leading-relaxed text-muted sm:text-lg">
          학교 밖에서 공부하는 이유는 저마다 다릅니다. 검정고시는 출제 범위가 정해져 있어 방향만 잡으면 혼자보다 빠르게 준비할 수 있습니다. 직접 가르쳐 온 선생님이 상담으로 맞는 선생님을 1:1로 연결해 드립니다.
        </p>

        {/* 급별 3 */}
        <section aria-labelledby="levels-heading">
          <h2 id="levels-heading" className="break-keep text-2xl font-bold text-ink sm:text-3xl">
            급별로 준비하기
          </h2>
          <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {GUMJUNG_LEVELS.map((l) => (
              <li key={l.slug}>
                <Link
                  href={`/gumjung/${l.slug}`}
                  className="flex h-full flex-col rounded-3xl border border-line bg-white p-6 shadow-sm transition-colors hover:border-accent"
                >
                  <span className="break-keep text-lg font-bold text-accent">
                    {l.name} 검정고시
                  </span>
                  <span className="mt-2 break-keep text-sm leading-relaxed text-muted">
                    {LEVEL_NOTE[l.slug]}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* 유형 가이드 7 (#guides) */}
        <section id="guides" aria-labelledby="guides-heading" className="scroll-mt-24">
          <h2 id="guides-heading" className="break-keep text-2xl font-bold text-ink sm:text-3xl">
            유형별 준비 가이드
          </h2>
          <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {GUMJUNG_GUIDES.map((g) => (
              <li key={g.slug}>
                <Link
                  href={`/gumjung/guide/${g.slug}`}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-white px-5 py-4 transition-colors hover:border-accent"
                >
                  <span className="break-keep text-base font-semibold text-ink">{g.navLabel}</span>
                  <span aria-hidden className="text-accent">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* 지역 안내 */}
        <section aria-labelledby="region-heading" className="rounded-3xl bg-accent/10 px-6 py-10 text-center">
          <h2 id="region-heading" className="break-keep text-2xl font-bold text-ink sm:text-3xl">
            우리 지역에서 준비하기
          </h2>
          <p className="mx-auto mt-3 max-w-xl break-keep text-base leading-relaxed text-muted sm:text-lg">
            전국 시·군·구별 검정고시 안내를 모았습니다. 전화·화상으로도 준비할 수 있습니다.
          </p>
          <div className="mt-6 flex justify-center">
            <Link
              href="/gumjung/regions"
              className="inline-flex min-h-12 items-center justify-center rounded-full border-2 border-accent bg-white px-6 text-base font-bold text-accent transition-colors hover:bg-accent/5"
            >
              지역별 검정고시 보기 →
            </Link>
          </div>
        </section>
      </div>

      <ConsultForm defaultMessage="검정고시 1:1 상담 문의드립니다." />
    </>
  );
}
