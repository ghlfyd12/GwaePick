import Link from "next/link";
import ConsultForm from "@/components/ConsultForm";
import JsonLd from "@/components/JsonLd";
import { site } from "@/data/site";
import { buildGumjungSubjectData } from "@/data/gumjung/subjects";
import { getGumjungLevel } from "@/data/gumjung/levels";

/*
 * GumjungSubjectDetail — /gumjung/[level]/[subject] 급별×과목 상세(15장) 공용 템플릿.
 * 인트로 / 출제 구성(사실) / 1:1 준비 방식 / 급별·과목 내부링크 / CTA + 상담폼. accent 토큰만(청록).
 */

const CONSULT_ANCHOR = "#consult";
const SITE_URL = site.url.replace(/\/$/, "");
const abs = (path: string) => `${SITE_URL}${path}`;

export default function GumjungSubjectDetail({
  levelSlug,
  subjectSlug,
}: {
  levelSlug: string;
  subjectSlug: string;
}) {
  const data = buildGumjungSubjectData(levelSlug, subjectSlug);
  if (!data) return null;
  const level = getGumjungLevel(levelSlug);

  const canonical = `/gumjung/${data.levelSlug}/${data.subjectSlug}`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "검고의참견", item: abs("/gumjung") },
        {
          "@type": "ListItem",
          position: 2,
          name: `${data.levelName} 검정고시`,
          item: abs(`/gumjung/${data.levelSlug}`),
        },
        { "@type": "ListItem", position: 3, name: data.head, item: abs(canonical) },
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
            검고의참견 · {data.levelName} 검정고시
          </p>
          <h1 className="mt-2 break-keep text-[1.7rem] font-bold leading-snug text-ink sm:text-4xl sm:leading-tight">
            {data.h1}
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
        {/* 출제 구성(사실) */}
        <section aria-labelledby="structure-heading">
          <h2 id="structure-heading" className="break-keep text-2xl font-bold text-ink sm:text-3xl">
            이 과목의 출제 구성
          </h2>
          <p className="mt-4 break-keep rounded-2xl border border-line bg-white p-5 text-sm leading-relaxed text-muted sm:text-base">
            {data.structure}
          </p>
        </section>

        {/* 1:1 준비 방식 */}
        <section aria-labelledby="prep-heading">
          <h2 id="prep-heading" className="break-keep text-2xl font-bold text-ink sm:text-3xl">
            1:1 준비 방식
          </h2>
          <p className="mt-4 break-keep text-base leading-relaxed text-muted sm:text-lg">
            {data.prepBody}
          </p>
        </section>

        {/* 내부링크 — 급별 상세 + 지역 */}
        <section aria-labelledby="links-heading">
          <h2 id="links-heading" className="break-keep text-xl font-bold text-ink sm:text-2xl">
            함께 보면 좋은 안내
          </h2>
          <ul className="mt-6 flex flex-wrap gap-3">
            <li>
              <Link
                href={`/gumjung/${data.levelSlug}`}
                className="inline-flex min-h-12 items-center break-keep rounded-full border border-accent/40 bg-white px-5 py-2.5 text-sm font-semibold text-accent transition-colors hover:bg-accent/5 sm:text-base"
              >
                {data.levelName} 검정고시 전체 안내
              </Link>
            </li>
            {level?.requiredSubjects
              .filter((s) => s.slug !== data.subjectSlug)
              .map((s) => (
                <li key={s.slug}>
                  <Link
                    href={`/gumjung/${data.levelSlug}/${s.slug}`}
                    className="inline-flex min-h-12 items-center break-keep rounded-full border border-accent/40 bg-white px-5 py-2.5 text-sm font-semibold text-accent transition-colors hover:bg-accent/5 sm:text-base"
                  >
                    {s.label}
                  </Link>
                </li>
              ))}
            <li>
              <Link
                href="/gumjung/regions"
                className="inline-flex min-h-12 items-center break-keep rounded-full border border-accent/40 bg-white px-5 py-2.5 text-sm font-semibold text-accent transition-colors hover:bg-accent/5 sm:text-base"
              >
                우리 지역 검정고시
              </Link>
            </li>
          </ul>
        </section>

        {/* CTA */}
        <section className="rounded-3xl bg-surface px-6 py-10 text-center sm:py-12">
          <h2 className="break-keep text-2xl font-bold leading-snug text-ink sm:text-3xl">
            지금 상담으로 시작하세요
          </h2>
          <p className="mx-auto mt-4 max-w-xl break-keep text-base leading-relaxed text-muted sm:text-lg">
            {data.head}, 맞는 선생님과 함께라면 차근히 준비할 수 있습니다. 첫 상담은 무료입니다.
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

      <ConsultForm defaultMessage={`${data.head} 1:1 상담 문의드립니다.`} />
    </>
  );
}
