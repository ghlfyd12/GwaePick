import Link from "next/link";
import ConsultForm from "@/components/ConsultForm";
import JsonLd from "@/components/JsonLd";
import { site } from "@/data/site";
import { buildPerformanceData, type PerformancePageData } from "@/data/performanceDetail";
import type { PowerLang } from "@/data/powerSchoolDepts";

/*
 * PerformanceDetail — /power/performance/[school]/[lang] 공용 상세 템플릿(서버 컴포넌트).
 *
 * 학교×언어 수행평가 페이지. 헤더(어학의참견)·푸터·플로팅 CTA 는 루트 layout 상속.
 * 색은 accent 토큰만 사용 — /power 스코프(.power-theme)에서 퍼플로 렌더된다(코랄 하드코딩 없음).
 * 골격: Hero(h1+도입) → 수행평가 유형 → 상담 연결 안내 → 같은 학교 다른 언어 링크 → FAQ → CTA + 폼.
 */

const CONSULT_ANCHOR = "#consult";
const SITE_URL = site.url.replace(/\/$/, "");
const abs = (path: string) => `${SITE_URL}${path}`;

export default function PerformanceDetail({
  schoolSlug,
  lang,
}: {
  schoolSlug: string;
  lang: PowerLang;
}) {
  const data = buildPerformanceData(schoolSlug, lang);
  if (!data) return null;

  const canonical = `/power/performance/${schoolSlug}/${lang}`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: data.faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "어학의참견", item: abs("/power") },
        {
          "@type": "ListItem",
          position: 2,
          name: `${data.schoolName} ${data.langLabel} 수행평가`,
          item: abs(canonical),
        },
      ],
    },
  ];

  return (
    <>
      <JsonLd data={jsonLd} />

      {/* ── 1. Hero ─────────────────────────────────────────────── */}
      <section className="border-b border-line bg-surface px-5 py-10 sm:px-6 md:px-10 md:py-14">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent">
            어학의참견 · {data.regionName}
          </p>
          <h1 className="mt-2 break-keep text-[1.7rem] font-bold leading-snug text-ink sm:text-4xl sm:leading-tight">
            {data.head}
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
        {/* ── 2. 수행평가 유형 안내 ───────────────────────────────── */}
        <section aria-labelledby="eval-heading">
          <h2
            id="eval-heading"
            className="break-keep text-center text-2xl font-bold text-ink sm:text-3xl"
          >
            {data.langLabel} 수행평가, 이렇게 준비합니다
          </h2>
          <p className="mx-auto mt-3 max-w-2xl break-keep text-center text-sm leading-relaxed text-muted sm:text-base">
            학교마다 다른 평가 방식에 맞춰, 실제로 걸리는 과제부터 1:1로 짚어 갑니다.
          </p>
          <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {data.evalTypes.map((e) => (
              <li key={e.title} className="rounded-3xl border border-line bg-white p-6 shadow-sm">
                <p className="break-keep text-lg font-bold text-accent">{e.title}</p>
                <p className="mt-2 break-keep text-sm leading-relaxed text-muted sm:text-base">
                  {e.desc}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* ── 3. 상담 선생님 연결 안내 ────────────────────────────── */}
        <section
          aria-labelledby="match-heading"
          className="rounded-3xl bg-accent/10 px-6 py-10 sm:px-8"
        >
          <h2
            id="match-heading"
            className="break-keep text-center text-2xl font-bold text-ink sm:text-3xl"
          >
            학교를 아는 선생님이 연결합니다
          </h2>
          <p className="mx-auto mt-4 max-w-2xl break-keep text-center text-base leading-relaxed text-muted sm:text-lg">
            직접 가르쳐 온 상담 선생님이 {data.schoolName}의 진도와 {data.langLabel} 평가
            유형을 먼저 파악합니다. 그 뒤 아이와 호흡이 맞는 선생님을 1:1로 연결하고, 잘
            맞지 않으면 다시 연결해 드립니다. 첫 상담은 무료입니다.
          </p>
        </section>

        {/* ── 4. 같은 학교의 다른 언어 수행평가(내부 링크) ─────────── */}
        {data.siblingLangs.length > 0 && (
          <section aria-labelledby="sibling-heading">
            <h2
              id="sibling-heading"
              className="break-keep text-center text-xl font-bold text-ink sm:text-2xl"
            >
              {data.schoolName}의 다른 언어 수행평가
            </h2>
            <ul className="mt-6 flex flex-wrap justify-center gap-3">
              {data.siblingLangs.map((s) => (
                <li key={s.lang}>
                  <Link
                    href={`/power/performance/${data.schoolSlug}/${s.lang}`}
                    className="inline-flex min-h-12 items-center break-keep rounded-full border border-accent/40 bg-white px-5 py-2.5 text-sm font-semibold text-accent transition-colors hover:bg-accent/5 sm:text-base"
                  >
                    {data.schoolName} {s.label} 수행평가
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* ── 5. FAQ ──────────────────────────────────────────────── */}
        <section aria-labelledby="faq-heading">
          <h2
            id="faq-heading"
            className="break-keep text-center text-2xl font-bold text-ink sm:text-3xl"
          >
            자주 묻는 질문
          </h2>
          <ul className="mt-8 space-y-4">
            {data.faq.map((f) => (
              <li key={f.q} className="rounded-3xl border border-line bg-white p-6 shadow-sm">
                <p className="break-keep text-base font-bold text-ink sm:text-lg">Q. {f.q}</p>
                <p className="mt-2 break-keep text-sm leading-relaxed text-muted sm:text-base">
                  {f.a}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* ── 6. 최종 CTA ─────────────────────────────────────────── */}
        <section
          aria-labelledby="closing-heading"
          className="rounded-3xl bg-surface px-6 py-10 text-center sm:py-12"
        >
          <h2
            id="closing-heading"
            className="break-keep text-2xl font-bold leading-snug text-ink sm:text-3xl"
          >
            오늘 상담으로, 그 첫걸음을
          </h2>
          <p className="mx-auto mt-4 max-w-xl break-keep text-base leading-relaxed text-muted sm:text-lg">
            {data.schoolName} {data.langLabel} 수행평가와 내신, 맞는 선생님과 함께라면
            차근히 잡을 수 있습니다. 지금 상담으로 시작하세요.
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

      {/* ── 상담 폼(#consult) — 진입 학교·언어를 프리필. /power 스코프라 어학 폼으로 자동 분기. ── */}
      <ConsultForm
        defaultMessage={`${data.schoolName} ${data.langLabel} 수행평가 상담 문의드립니다.`}
      />
    </>
  );
}

// PerformancePageData 재노출(라우트에서 타입만 필요 시).
export type { PerformancePageData };
