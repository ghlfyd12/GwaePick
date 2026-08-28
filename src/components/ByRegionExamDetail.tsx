import Link from "next/link";
import ConsultForm from "@/components/ConsultForm";
import JsonLd from "@/components/JsonLd";
import { site } from "@/data/site";
import { buildByExamData } from "@/data/byRegionExam";
import { buildExamBookSection } from "@/data/power/examBooks";
import LessonModeSection from "@/components/power/LessonModeSection";

/*
 * ByRegionExamDetail — /power/by-region/[region]/[exam] 공용 상세 템플릿(서버 컴포넌트).
 *
 * 지역×어학시험 페이지. 헤더·푸터·플로팅 CTA(카톡 상담·상담전화연결·무료 상담 신청)는 루트 layout 상속.
 * 색은 accent 토큰만 — /power 스코프(.power-theme)에서 퍼플로 렌더된다(코랄 하드코딩 없음).
 * 워딩(CLAUDE.md·지침서): 금지 표현·과장 문장부호·성과 보장 문구 미사용. 시험 지도 경험 중심.
 */

const CONSULT_ANCHOR = "#consult";
const SITE_URL = site.url.replace(/\/$/, "");
const abs = (path: string) => `${SITE_URL}${path}`;

export default function ByRegionExamDetail({
  regionParam,
  examSlug,
}: {
  regionParam: string;
  examSlug: string;
}) {
  const data = buildByExamData(regionParam, examSlug);
  if (!data) return null;

  // 교재 활용 섹션(시험별 인기 교재 롱테일 — 본문만, title/og 미유입).
  const bookSection = buildExamBookSection(examSlug, data.exam.name);

  const canonical = `/power/by-region/${encodeURIComponent(data.regionSlug)}/${examSlug}`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "어학의참견", item: abs("/power") },
        { "@type": "ListItem", position: 2, name: data.head, item: abs(canonical) },
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
        {/* ── 2. 준비 포인트 3카드 ─────────────────────────────────── */}
        <section aria-labelledby="prep-heading">
          <h2
            id="prep-heading"
            className="break-keep text-center text-2xl font-bold text-ink sm:text-3xl"
          >
            {data.prepHeading}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl break-keep text-center text-sm leading-relaxed text-muted sm:text-base">
            {data.prepSubtitle}
          </p>
          <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {data.exam.prepPoints.map((p) => (
              <li key={p.title} className="rounded-3xl border border-line bg-white p-6 shadow-sm">
                <p className="break-keep text-lg font-bold text-accent">{p.title}</p>
                <p className="mt-2 break-keep text-sm leading-relaxed text-muted sm:text-base">
                  {p.desc}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* ── 2.5 교재 활용 — 시험별 인기 교재 롱테일(본문만, 상표는 title/og 미유입) ── */}
        {bookSection && (
          <section aria-labelledby="books-heading">
            <h2
              id="books-heading"
              className="break-keep text-center text-2xl font-bold text-ink sm:text-3xl"
            >
              {bookSection.heading}
            </h2>
            <p className="mx-auto mt-3 max-w-2xl break-keep text-center text-base leading-relaxed text-muted sm:text-lg">
              {bookSection.lead}
            </p>

            {bookSection.blocks.length > 0 ? (
              <div className="mt-8 space-y-4">
                {bookSection.blocks.map((b) => (
                  <div
                    key={b.heading}
                    className="rounded-3xl border border-line bg-white p-6 shadow-sm"
                  >
                    <h3 className="break-keep text-lg font-bold text-accent sm:text-xl">
                      {b.heading}
                    </h3>
                    <p className="mt-2 break-keep text-sm leading-relaxed text-muted sm:text-base">
                      {b.body}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mx-auto mt-8 max-w-2xl break-keep text-center text-base leading-relaxed text-muted sm:text-lg">
                {bookSection.genericBody}
              </p>
            )}

            <p className="mx-auto mt-6 max-w-2xl break-keep text-center text-sm leading-relaxed text-muted sm:text-base">
              {bookSection.closing}
            </p>
          </section>
        )}

        {/* ── 3. 연결 안내 ─────────────────────────────────────────── */}
        <section
          aria-labelledby="match-heading"
          className="rounded-3xl bg-accent/10 px-6 py-10 sm:px-8"
        >
          <h2
            id="match-heading"
            className="break-keep text-center text-2xl font-bold text-ink sm:text-3xl"
          >
            호흡이 맞는 선생님과 1:1로 준비합니다
          </h2>
          <p className="mx-auto mt-4 max-w-2xl break-keep text-center text-base leading-relaxed text-muted sm:text-lg">
            {data.matchBody}
          </p>
        </section>

        {/* ── 4. 비대면 수업 방식 안내 (전화·화상) — 공용 섹션 ────────── */}
        <LessonModeSection bare />

        {/* ── 5. 관련 페이지 링크 ──────────────────────────────────── */}
        <section aria-labelledby="links-heading">
          <h2
            id="links-heading"
            className="break-keep text-center text-xl font-bold text-ink sm:text-2xl"
          >
            {data.regionName} 어학 관련 페이지
          </h2>
          <ul className="mt-6 flex flex-wrap justify-center gap-3">
            {data.relatedLinks.map((l) => (
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
            {data.regionName} {data.exam.name}, 맞는 선생님과 함께라면 차근히 준비할 수
            있습니다. 지금 상담으로 시작하세요.
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

      {/* ── 상담 폼(#consult) — 진입 지역·시험 프리필. /power 스코프라 어학 폼으로 자동 분기. ── */}
      <ConsultForm defaultMessage={`${data.regionName} ${data.exam.name} 1:1 상담 문의드립니다.`} />
    </>
  );
}
