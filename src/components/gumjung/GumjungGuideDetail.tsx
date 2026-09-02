import Link from "next/link";
import ConsultForm from "@/components/ConsultForm";
import JsonLd from "@/components/JsonLd";
import { site } from "@/data/site";
import { getGumjungGuide } from "@/data/gumjung/guides";

/*
 * GumjungGuideDetail — /gumjung/guide/[type] 유형 가이드(7장) 공용 템플릿.
 * lead + 섹션 + 관련 링크 + CTA + 상담폼. accent 토큰만(청록).
 * 절대 규칙: 특정 학교·전형 언급 없음, 기간·성과 보장 없음(데이터에서 이미 준수).
 */

const CONSULT_ANCHOR = "#consult";
const SITE_URL = site.url.replace(/\/$/, "");
const abs = (path: string) => `${SITE_URL}${path}`;

export default function GumjungGuideDetail({ typeSlug }: { typeSlug: string }) {
  const guide = getGumjungGuide(typeSlug);
  if (!guide) return null;

  const canonical = `/gumjung/guide/${guide.slug}`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "검고의참견", item: abs("/gumjung") },
        { "@type": "ListItem", position: 2, name: guide.navLabel, item: abs(canonical) },
      ],
    },
  ];

  return (
    <>
      <JsonLd data={jsonLd} />

      {/* Hero */}
      <section className="border-b border-line bg-surface px-5 py-12 sm:px-6 md:px-10 md:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent">
            검고의참견 · {guide.eyebrow}
          </p>
          <h1 className="mt-2 break-keep text-[1.7rem] font-bold leading-snug text-ink sm:text-4xl sm:leading-tight">
            {guide.h1}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl break-keep text-base leading-relaxed text-muted sm:text-lg">
            {guide.lead}
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

      <div className="mx-auto max-w-3xl space-y-12 px-5 py-14 sm:px-6 sm:py-20">
        {guide.sections.map((s) => (
          <section key={s.heading} aria-label={s.heading}>
            <h2 className="break-keep text-2xl font-bold text-ink sm:text-3xl">{s.heading}</h2>
            <p className="mt-4 break-keep text-base leading-relaxed text-muted sm:text-lg">
              {s.body}
            </p>
          </section>
        ))}

        {/* 관련 링크 */}
        <section aria-labelledby="related-heading">
          <h2 id="related-heading" className="break-keep text-xl font-bold text-ink sm:text-2xl">
            함께 보면 좋은 안내
          </h2>
          <ul className="mt-6 flex flex-wrap gap-3">
            {guide.related.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="inline-flex min-h-12 items-center break-keep rounded-full border border-accent/40 bg-white px-5 py-2.5 text-sm font-semibold text-accent transition-colors hover:bg-accent/5 sm:text-base"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* CTA */}
        <section className="rounded-3xl bg-surface px-6 py-10 text-center sm:py-12">
          <h2 className="break-keep text-2xl font-bold leading-snug text-ink sm:text-3xl">
            지금 상담으로 시작하세요
          </h2>
          <p className="mx-auto mt-4 max-w-xl break-keep text-base leading-relaxed text-muted sm:text-lg">
            상황에 맞는 준비 방향을 상담에서 함께 정합니다. 첫 상담은 무료입니다.
          </p>
          <div className="mt-7 flex justify-center">
            <a
              href={CONSULT_ANCHOR}
              className="inline-flex min-h-14 w-full max-w-xs items-center justify-center rounded-full bg-accent px-8 text-base font-semibold text-white shadow-md transition-colors hover:bg-accent-dark sm:w-auto sm:text-lg"
            >
              {site.cta.label} →
            </a>
          </div>
        </section>
      </div>

      <ConsultForm defaultMessage={`${guide.navLabel} 관련 검정고시 상담 문의드립니다.`} />
    </>
  );
}
