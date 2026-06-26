import Link from "next/link";
import ConsultForm from "@/components/ConsultForm";
import type { Subject } from "@/data/subjects";
import SubjectTabs from "@/components/SubjectTabs";
import { site } from "@/data/site";
import {
  CONSULT_PHONE,
  STEPS,
  TRUST,
  WHY_COMMON,
  REVIEW_PLACEHOLDERS,
  buildIntro,
  buildFaq,
  neighborDongs,
  dongHref,
} from "@/data/dongPageCopy";

/*
 * DongSubjectDetail — 동×과목 상세 페이지(서버 컴포넌트, 파일럿 pSEO).
 *
 * 10개 섹션 + FAQPage/BreadcrumbList JSON-LD + 상담 폼 임베드. 카피는 dongPageCopy.ts,
 * 지역은 sidoRegions.ts, 과목은 subjects.ts. h1 1개. 톤: 차분/주황 포인트.
 */

type SgLite = { name: string; slug: string; dong: { name: string; slug: string }[] };

export default function DongSubjectDetail({
  sidoSlug,
  sidoLabel,
  sigungu,
  dong,
  subject,
}: {
  sidoSlug: string;
  sidoLabel: string;
  sigungu: SgLite;
  dong: { name: string; slug: string };
  subject: Subject;
}) {
  const neighbors = neighborDongs(sidoSlug, sigungu.slug, dong.slug);
  const intro = buildIntro(
    {
      sigungu: sigungu.name,
      dong: dong.name,
      subject: subject.label,
      n1: neighbors[0] ?? "",
      n2: neighbors[1] ?? "",
    },
    dong.slug,
  );
  const faq = buildFaq(dong.name);
  const consultMessage = `${sigungu.name} ${dong.name} ${subject.label} 과외 문의드립니다.`;

  // 내부 링크
  const otherDongs = [...sigungu.dong]
    .sort((a, b) => a.name.localeCompare(b.name, "ko"))
    .filter((d) => d.slug !== dong.slug)
    .slice(0, 12)
    .map((d) => ({
      label: d.name,
      href: dongHref(sidoSlug, sigungu.slug, d.slug, subject.slug),
    }));

  // JSON-LD
  const base = site.url.replace(/\/$/, "");
  const detailPath = `/tutoring/by-region/${sidoSlug}/${sigungu.slug}/${dong.slug}/${subject.slug}`;
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
      { name: "지역별", url: `${base}/tutoring/by-region` },
      { name: sidoLabel, url: `${base}/tutoring/by-region/${sidoSlug}` },
      { name: sigungu.name, url: `${base}/tutoring/by-region/${sidoSlug}` },
      { name: dong.name, url: `${base}/tutoring/by-region/${sidoSlug}/${sigungu.slug}/${dong.slug}` },
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
        <ol className="mx-auto flex max-w-5xl flex-wrap items-center gap-1 text-sm text-muted">
          <li><Link href="/tutoring/by-region" className="hover:text-accent">지역별</Link></li>
          <li aria-hidden className="text-line">›</li>
          <li><Link href={`/tutoring/by-region/${sidoSlug}`} className="hover:text-accent">{sidoLabel}</Link></li>
          <li aria-hidden className="text-line">›</li>
          <li><Link href={`/tutoring/by-region/${sidoSlug}/${sigungu.slug}/${dong.slug}`} className="hover:text-accent">{sigungu.name} {dong.name}</Link></li>
          <li aria-hidden className="text-line">›</li>
          <li aria-current="page" className="font-semibold text-ink">{subject.label}</li>
        </ol>
      </nav>

      {/* 1. Hero */}
      <section className="border-b border-line bg-surface px-4 py-12 text-center sm:px-6 sm:py-16">
        <p className="text-sm font-semibold uppercase tracking-widest text-accent">
          {sigungu.name} · {dong.name}
        </p>
        <h1 className="mx-auto mt-2 max-w-3xl break-keep text-3xl font-bold leading-snug text-ink sm:text-4xl">
          {dong.name} {subject.label} 과외 — {sigungu.name} 1:1 맞춤 개인과외 수업
        </h1>
        <p className="mx-auto mt-4 max-w-2xl break-keep text-base leading-relaxed text-muted sm:text-lg">
          직접 가르쳐 온 선생님이 {dong.name} 학생에게 가장 잘 맞는 {subject.label}{" "}
          선생님을 배정하여 취약과목 집중관리부터 공부습관까지 체계적인 맞춤관리로
          확실한 결과를 만듭니다.
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

      {/* 과목 선택 탭 — 같은 동의 다른 과목 페이지로 전환(현재 과목 활성) */}
      <SubjectTabs
        currentSlug={subject.slug}
        makeHref={(s) => dongHref(sidoSlug, sigungu.slug, dong.slug, s)}
      />

      <div className="mx-auto max-w-3xl space-y-12 px-4 py-12 sm:px-6 sm:py-16">
        {/* 2. 지역 맞춤 도입(변주) */}
        <p className="break-keep text-base leading-relaxed text-muted sm:text-lg">{intro}</p>

        {/* 3. 왜 1:1 과외일까요 */}
        <section>
          <h2 className="break-keep text-xl font-bold text-ink sm:text-2xl">
            왜 {dong.name}에서 1:1 {subject.label} 과외일까요?
          </h2>
          <p className="mt-3 break-keep text-base leading-relaxed text-muted sm:text-lg">{WHY_COMMON}</p>
          <p className="mt-3 break-keep text-base font-medium leading-relaxed text-ink sm:text-lg">{subject.why}</p>
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

        {/* 4. 커리큘럼 4단계 */}
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

        {/* 5. 진행 순서 STEP */}
        <section>
          <h2 className="break-keep text-xl font-bold text-ink sm:text-2xl">상담부터 첫 수업까지</h2>
          <ol className="mt-5 space-y-3">
            {STEPS.map((s) => (
              <li key={s.no} className="flex items-start gap-4 rounded-2xl border border-line bg-white p-4">
                <span className="shrink-0 rounded-full bg-accent/10 px-3 py-1 text-sm font-bold text-accent">STEP {s.no}</span>
                <div>
                  <p className="text-base font-bold text-ink">{s.title}</p>
                  <p className="mt-0.5 break-keep text-sm leading-relaxed text-muted">{s.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* 6. 믿어도 되는 이유 3가지 */}
        <section>
          <h2 className="break-keep text-xl font-bold text-ink sm:text-2xl">지식의참견을 믿어도 되는 이유</h2>
          <ul className="mt-5 space-y-3">
            {TRUST.map((t, i) => (
              <li key={i} className="flex items-start gap-3 break-keep text-base leading-relaxed text-ink sm:text-lg">
                <span aria-hidden className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent" />
                {t}
              </li>
            ))}
          </ul>
        </section>

        {/* 7. 후기(placeholder) */}
        <section>
          <h2 className="break-keep text-xl font-bold text-ink sm:text-2xl">수업 후기</h2>
          <ul className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {REVIEW_PLACEHOLDERS.map((r, i) => (
              <li key={i} className="rounded-2xl border border-line bg-white p-5">
                <p className="inline-flex rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-semibold text-accent">{r.label}</p>
                <p className="mt-2 break-keep text-sm leading-relaxed text-ink">“{r.text}”</p>
                <p className="mt-2 text-xs text-muted">— {r.author}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* 8. FAQ */}
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

        {/* 9. 내부 링크 블록 */}
        <section className="space-y-8">
          <div>
            <h2 className="break-keep text-xl font-bold text-ink sm:text-2xl">{sigungu.name}의 다른 동네</h2>
            <ul className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4">
              {otherDongs.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="block rounded-xl border border-line bg-white px-3 py-2.5 text-center text-sm font-semibold text-ink transition-colors hover:border-accent hover:text-accent">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            {sigungu.dong.length > 13 && (
              <p className="mt-3 text-center text-sm">
                <Link href={`/tutoring/by-region/${sidoSlug}/${sigungu.slug}/${dong.slug}`} className="font-semibold text-accent hover:underline">더보기 →</Link>
              </p>
            )}
          </div>
        </section>

        {/* 10. 최종 CTA */}
        <section className="rounded-2xl bg-surface px-6 py-8 text-center sm:py-10">
          <p className="break-keep text-base font-medium leading-relaxed text-ink sm:text-lg">
            {dong.name}에서 어떤 {subject.label} 선생님이 맞을지 막막하다면, 상담부터 시작하세요. 직접 가르쳐 온 선생님이 함께 찾아 드립니다.
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
