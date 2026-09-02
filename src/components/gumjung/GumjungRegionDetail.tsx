import Link from "next/link";
import ConsultForm from "@/components/ConsultForm";
import JsonLd from "@/components/JsonLd";
import { site } from "@/data/site";
import { buildGumjungRegionData } from "@/data/byRegionGumjung";

/*
 * GumjungRegionDetail — /gumjung/by-region/[region] 지역×검정고시 상세(253장) 공용 템플릿.
 * 급별 안내 요약 + 급별 상세 내부링크 + CTA + 상담폼. 시험 정보 전문은 급별 상세에만(중복 방지).
 * accent 토큰만(청록).
 */

const CONSULT_ANCHOR = "#consult";
const SITE_URL = site.url.replace(/\/$/, "");
const abs = (path: string) => `${SITE_URL}${path}`;

export default function GumjungRegionDetail({ regionParam }: { regionParam: string }) {
  const data = buildGumjungRegionData(regionParam);
  if (!data) return null;

  const canonical = `/gumjung/by-region/${encodeURIComponent(data.regionSlug)}`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "검고의참견", item: abs("/gumjung") },
        { "@type": "ListItem", position: 2, name: data.head, item: abs(canonical) },
      ],
    },
  ];

  return (
    <>
      <JsonLd data={jsonLd} />

      {/* Hero */}
      <section className="border-b border-line bg-surface px-5 py-12 sm:px-6 md:px-10 md:py-14">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent">
            검고의참견 · {data.regionName}
          </p>
          <h1 className="mt-2 break-keep text-[1.7rem] font-bold leading-snug text-ink sm:text-4xl sm:leading-tight">
            {data.head} 과외
          </h1>
          <p className="mx-auto mt-4 max-w-2xl break-keep text-base leading-relaxed text-muted sm:text-lg">
            {data.intro}
          </p>
          <div className="mt-6 flex justify-center">
            <a
              href={CONSULT_ANCHOR}
              className="inline-flex min-h-14 w-full max-w-xs items-center justify-center rounded-full bg-accent px-8 text-base font-semibold text-white shadow-md transition-colors hover:bg-accent-dark sm:w-auto sm:text-lg"
            >
              {site.cta.label}
            </a>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-3xl space-y-14 px-5 py-14 sm:px-6 sm:py-20">
        {/* 급별 요약 링크 — 시험 정보 전문은 급별 상세에 */}
        <section aria-labelledby="levels-heading">
          <h2 id="levels-heading" className="break-keep text-2xl font-bold text-ink sm:text-3xl">
            {data.regionName}에서 준비하는 급별 안내
          </h2>
          <p className="mt-3 break-keep text-sm leading-relaxed text-muted sm:text-base">
            급별로 필수·선택 과목 구성이 다릅니다. 각 급별 안내에서 출제 범위와 준비 방식을 확인하세요.
          </p>
          <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {data.levelLinks.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="flex h-full flex-col rounded-3xl border border-line bg-white p-6 shadow-sm transition-colors hover:border-accent"
                >
                  <span className="break-keep text-lg font-bold text-accent">{l.label}</span>
                  <span className="mt-2 break-keep text-sm leading-relaxed text-muted">{l.note}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* 연결 안내 + CTA */}
        <section className="rounded-3xl bg-surface px-6 py-10 text-center sm:py-12">
          <h2 className="break-keep text-2xl font-bold leading-snug text-ink sm:text-3xl">
            {data.regionName}에서 1:1로 시작하세요
          </h2>
          <p className="mx-auto mt-4 max-w-xl break-keep text-base leading-relaxed text-muted sm:text-lg">
            상담에서 현재 상황과 목표 시기를 확인하고 맞는 선생님을 연결해 드립니다. 전화·화상으로도 준비할 수 있습니다. 첫 상담은 무료입니다.
          </p>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href={CONSULT_ANCHOR}
              className="inline-flex min-h-14 w-full max-w-xs items-center justify-center rounded-full bg-accent px-8 text-base font-semibold text-white shadow-md transition-colors hover:bg-accent-dark sm:w-auto sm:text-lg"
            >
              {site.cta.label} →
            </a>
            <a
              href={`tel:${site.contact.phone}`}
              className="inline-flex min-h-14 w-full max-w-xs items-center justify-center rounded-full border-2 border-accent bg-white px-7 text-base font-bold text-accent transition-colors hover:bg-accent/5 sm:w-auto sm:text-lg"
            >
              {site.contact.phone}
            </a>
          </div>
        </section>
      </div>

      <ConsultForm defaultMessage={`${data.regionName} 검정고시 1:1 상담 문의드립니다.`} />
    </>
  );
}
