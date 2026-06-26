import Link from "next/link";
import ConsultForm from "@/components/ConsultForm";
import type { Subject } from "@/data/subjects";
import { site } from "@/data/site";
import { CONSULT_PHONE } from "@/data/dongPageCopy";
import { buildSubjectFaq } from "@/data/subjectDetailCopy";
import { buildSubjectKeywords } from "@/data/subjectKeywords";

/*
 * SubjectDetail — 과목 단독 상세(서버 컴포넌트). SchoolSubjectDetail 패턴 축약판.
 * 순서: H1 → 도입(why) → (forWhom) → 커리큘럼 4단계 → (teaching) → FAQ → 관련 검색어 → CTA.
 * 콘텐츠는 subjects.ts(why/curriculum/forWhom/teaching) + buildSubjectFaq + buildSubjectKeywords 에서만.
 */
export default function SubjectDetail({ subject }: { subject: Subject }) {
  const faq = buildSubjectFaq(subject.label);
  const keywords = buildSubjectKeywords(subject.slug);
  const consultMessage = `${subject.label} 과외 문의드립니다.`;

  // JSON-LD (FAQ + breadcrumb)
  const base = site.url.replace(/\/$/, "");
  const detailPath = `/tutoring/by-subject/${subject.slug}`;
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { name: "과목별", url: `${base}/tutoring/by-subject` },
      { name: `${subject.label} 과외`, url: `${base}${detailPath}` },
    ].map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* 브레드크럼 */}
      <nav aria-label="현재 위치" className="border-b border-line bg-white px-4 py-3 sm:px-6">
        <ol className="mx-auto flex max-w-3xl flex-wrap items-center gap-1 text-sm text-muted">
          <li><Link href="/tutoring/by-subject" className="hover:text-accent">과목별</Link></li>
          <li aria-hidden className="text-line">›</li>
          <li aria-current="page" className="font-semibold text-ink">{subject.label}</li>
        </ol>
      </nav>

      {/* 1. Hero — H1 */}
      <section className="border-b border-line bg-surface px-4 py-12 text-center sm:px-6 sm:py-16">
        <p className="text-sm font-semibold uppercase tracking-widest text-accent">과목별</p>
        <h1 className="mx-auto mt-2 max-w-3xl break-keep text-3xl font-bold leading-snug text-ink sm:text-4xl">
          {subject.label} 1:1 맞춤 과외
        </h1>
        <p className="mx-auto mt-4 max-w-2xl break-keep text-base leading-relaxed text-muted sm:text-lg">
          직접 가르쳐 온 선생님이 학생 수준에 맞는 {subject.label} 선생님을 연결하여,
          진단부터 내신·서술형까지 체계적인 맞춤관리로 확실한 결과를 만듭니다.
        </p>
        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a href="#consult" className="inline-flex min-h-14 w-full max-w-xs items-center justify-center rounded-full bg-accent px-7 py-3 text-base font-semibold text-white shadow-md transition-colors hover:bg-accent-dark sm:w-auto sm:text-lg">
            무료 상담 신청
          </a>
          <a href={`tel:${CONSULT_PHONE}`} className="inline-flex min-h-14 w-full max-w-xs items-center justify-center rounded-full border-2 border-accent bg-white px-7 py-3 text-base font-bold text-accent transition-colors hover:bg-accent/5 sm:w-auto sm:text-lg">
            {CONSULT_PHONE}
          </a>
        </div>
      </section>

      <div className="mx-auto max-w-3xl space-y-12 px-4 py-12 sm:px-6 sm:py-16">
        {/* 2. 도입 — why */}
        <section>
          <h2 className="break-keep text-xl font-bold text-ink sm:text-2xl">
            왜 1:1 {subject.label} 과외일까요?
          </h2>
          <p className="mt-3 break-keep text-base font-medium leading-relaxed text-ink sm:text-lg">
            {subject.why}
          </p>
          {subject.forWhom && subject.forWhom.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-semibold text-muted">이런 학생에게 도움이 됩니다</p>
              <ul className="mt-2 space-y-2">
                {subject.forWhom.map((w, i) => (
                  <li key={i} className="flex items-start gap-3 break-keep text-base leading-relaxed text-ink">
                    <span aria-hidden className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent" />
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* 3. 커리큘럼 4단계 */}
        <section>
          <h2 className="break-keep text-xl font-bold text-ink sm:text-2xl">{subject.label}, 이렇게 가르칩니다</h2>
          <ol className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {subject.curriculum.map((c, i) => (
              <li key={i} className="rounded-2xl border border-line bg-white p-5">
                <p className="text-sm font-semibold text-accent">{c.step}</p>
                <p className="mt-1 text-base font-bold text-ink">{c.title}</p>
                <p className="mt-1 break-keep text-sm leading-relaxed text-muted">{c.desc}</p>
              </li>
            ))}
          </ol>
          {subject.teaching && (
            <div className="mt-5 rounded-2xl bg-surface p-5">
              <p className="text-sm font-semibold text-accent">수업 방식</p>
              <p className="mt-2 break-keep text-base leading-relaxed text-ink">{subject.teaching}</p>
            </div>
          )}
        </section>

        {/* 4. FAQ */}
        <section>
          <h2 className="text-xl font-bold text-ink sm:text-2xl">자주 묻는 질문</h2>
          <div className="mt-5 divide-y divide-line border-y border-line">
            {faq.map((f, i) => (
              <details key={i} className="group py-1">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-4 text-base font-semibold text-ink sm:text-lg">
                  <span className="break-keep">{f.q}</span>
                  <span aria-hidden className="shrink-0 text-accent transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="pb-4 break-keep text-base leading-relaxed text-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* 5. 관련 검색어 — 전부 장식 태그(클릭 불가) */}
        {keywords.length > 0 && (
          <section>
            <h2 className="break-keep text-xl font-bold text-ink sm:text-2xl">관련 검색어</h2>
            <ul className="mt-4 flex flex-wrap gap-2.5">
              {keywords.map((k) => (
                <li key={k}>
                  <span className="inline-flex break-keep rounded-full bg-surface-alt px-4 py-2 text-sm font-medium text-muted sm:text-base">
                    {k}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* 6. 최종 CTA */}
        <section className="rounded-2xl bg-surface px-6 py-8 text-center sm:py-10">
          <p className="break-keep text-base font-medium leading-relaxed text-ink sm:text-lg">
            어떤 {subject.label} 선생님이 맞을지 막막하다면, 상담부터 시작하세요. 직접 가르쳐 온 선생님이 함께 찾아 드립니다.
          </p>
          <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a href="#consult" className="inline-flex min-h-14 w-full max-w-xs items-center justify-center rounded-full bg-accent px-7 py-3 text-base font-semibold text-white shadow-md transition-colors hover:bg-accent-dark sm:w-auto sm:text-lg">무료 상담 신청</a>
            <a href={`tel:${CONSULT_PHONE}`} className="inline-flex min-h-14 w-full max-w-xs items-center justify-center rounded-full border-2 border-accent bg-white px-7 py-3 text-base font-bold text-accent transition-colors hover:bg-accent/5 sm:w-auto sm:text-lg">{CONSULT_PHONE}</a>
          </div>
        </section>
      </div>

      {/* 상담 폼(프리필) — #consult */}
      <ConsultForm defaultMessage={consultMessage} />
    </>
  );
}
