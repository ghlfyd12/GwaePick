import Link from "next/link";
import ConsultForm from "@/components/ConsultForm";
import JsonLd from "@/components/JsonLd";
import { site } from "@/data/site";
import {
  getGumjungLevel,
  GUMJUNG_EXAM_FACTS,
  GUMJUNG_TYPE_SECTION,
  GUMJUNG_FAQ,
} from "@/data/gumjung/levels";
import { GUMJUNG_GUIDES } from "@/data/gumjung/guides";

/*
 * GumjungLevelDetail — /gumjung/[level] 급별 상세(고졸·중졸·초졸) 공용 템플릿(서버 컴포넌트).
 * 헤더·푸터·플로팅 CTA 는 루트 layout 상속(검고 스코프 = .gumjung-theme 청록). 색은 accent 토큰만.
 * 워딩 절대 규칙 준수. 시험 정보 전문은 급별 상세에만 둔다(지역 페이지는 요약).
 */

const CONSULT_ANCHOR = "#consult";
const SITE_URL = site.url.replace(/\/$/, "");
const abs = (path: string) => `${SITE_URL}${path}`;

export default function GumjungLevelDetail({ levelSlug }: { levelSlug: string }) {
  const level = getGumjungLevel(levelSlug);
  if (!level) return null;

  const canonical = `/gumjung/${level.slug}`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "검고의참견", item: abs("/gumjung") },
        { "@type": "ListItem", position: 2, name: level.examName, item: abs(canonical) },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: GUMJUNG_FAQ.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ];

  return (
    <>
      <JsonLd data={jsonLd} />

      {/* Hero */}
      <section className="border-b border-line bg-surface px-5 py-12 sm:px-6 md:px-10 md:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent">
            검고의참견 · {level.name}
          </p>
          <h1 className="mt-2 break-keep text-[1.7rem] font-bold leading-snug text-ink sm:text-4xl sm:leading-tight">
            {level.h1}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl break-keep text-base leading-relaxed text-muted sm:text-lg">
            {level.intro}
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
        {/* 시험 안내(사실) */}
        <section aria-labelledby="facts-heading">
          <h2 id="facts-heading" className="break-keep text-2xl font-bold text-ink sm:text-3xl">
            {level.examName} 안내
          </h2>
          <ul className="mt-6 space-y-3">
            {GUMJUNG_EXAM_FACTS.map((f) => (
              <li
                key={f}
                className="flex gap-3 rounded-2xl border border-line bg-white p-4 text-sm leading-relaxed text-muted sm:text-base"
              >
                <span aria-hidden className="mt-1 h-2 w-2 shrink-0 rounded-full bg-accent" />
                <span className="break-keep">{f}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* 과목 구성 */}
        <section aria-labelledby="subjects-heading">
          <h2 id="subjects-heading" className="break-keep text-2xl font-bold text-ink sm:text-3xl">
            과목 구성
          </h2>
          <p className="mt-3 break-keep text-sm leading-relaxed text-muted sm:text-base">
            필수 {level.requiredCount}과목 + 선택 {level.electiveCount}과목(총 {level.totalCount}과목)으로 준비합니다. {level.questionInfo}
          </p>
          <ul className="mt-6 flex flex-wrap gap-2.5">
            {level.requiredSubjects.map((s) => (
              <li key={s.slug}>
                <Link
                  href={`/gumjung/${level.slug}/${s.slug}`}
                  className="inline-flex min-h-12 items-center break-keep rounded-full border border-accent/40 bg-white px-5 py-2.5 text-sm font-semibold text-accent transition-colors hover:bg-accent/5 sm:text-base"
                >
                  {s.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-4 break-keep text-sm leading-relaxed text-muted">
            {level.electiveNote}
          </p>
        </section>

        {/* 유형 섹션(4) */}
        <section aria-labelledby="types-heading">
          <h2 id="types-heading" className="break-keep text-2xl font-bold text-ink sm:text-3xl">
            {GUMJUNG_TYPE_SECTION.heading}
          </h2>
          <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {GUMJUNG_TYPE_SECTION.items.map((it) => (
              <li key={it.title} className="rounded-3xl border border-line bg-white p-6 shadow-sm">
                <p className="break-keep text-lg font-bold text-accent">{it.title}</p>
                <p className="mt-2 break-keep text-sm leading-relaxed text-muted sm:text-base">
                  {it.body}
                </p>
              </li>
            ))}
          </ul>
          {/* 유형 가이드 7 링크(섹션 비대화 방지 — 별도 목록) */}
          <div className="mt-6 rounded-3xl bg-accent/10 px-6 py-6">
            <p className="break-keep text-sm font-semibold text-ink">유형별 준비 가이드</p>
            <ul className="mt-3 flex flex-wrap gap-2.5">
              {GUMJUNG_GUIDES.map((g) => (
                <li key={g.slug}>
                  <Link
                    href={`/gumjung/guide/${g.slug}`}
                    className="inline-flex min-h-11 items-center break-keep rounded-full border border-accent/40 bg-white px-4 py-2 text-sm font-semibold text-accent transition-colors hover:bg-accent/5"
                  >
                    {g.navLabel}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* FAQ(3) */}
        <section aria-labelledby="faq-heading">
          <h2 id="faq-heading" className="break-keep text-2xl font-bold text-ink sm:text-3xl">
            자주 묻는 질문
          </h2>
          <dl className="mt-6 space-y-4">
            {GUMJUNG_FAQ.map((f) => (
              <div key={f.q} className="rounded-2xl border border-line bg-white p-5">
                <dt className="break-keep text-base font-bold text-ink sm:text-lg">{f.q}</dt>
                <dd className="mt-2 break-keep text-sm leading-relaxed text-muted sm:text-base">
                  {f.a}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* 연결 안내 + CTA */}
        <section
          aria-labelledby="match-heading"
          className="rounded-3xl bg-surface px-6 py-10 text-center sm:py-12"
        >
          <h2 id="match-heading" className="break-keep text-2xl font-bold leading-snug text-ink sm:text-3xl">
            나에게 맞는 선생님과 1:1로 준비합니다
          </h2>
          <p className="mx-auto mt-4 max-w-xl break-keep text-base leading-relaxed text-muted sm:text-lg">
            상담에서 현재 상황과 목표 시기를 확인하고, 지도 경험이 있는 선생님을 1:1로 연결해 드립니다. 첫 상담은 무료입니다.
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

      <ConsultForm defaultMessage={`${level.examName} 1:1 상담 문의드립니다.`} />
    </>
  );
}
