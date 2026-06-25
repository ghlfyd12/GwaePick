import Link from "next/link";
import ConsultForm from "@/components/ConsultForm";
import type { Subject } from "@/data/subjects";
import { subjects } from "@/data/subjects";
import { site } from "@/data/site";
import { CONSULT_PHONE, STEPS, TRUST, REVIEW_PLACEHOLDERS } from "@/data/dongPageCopy";
import { buildSchoolIntro, buildWhySchool, buildSchoolFaq } from "@/data/schoolDetailCopy";
import { schoolDetailHref } from "@/lib/schoolHref";

/*
 * SchoolSubjectDetail — 학교×과목 상세(서버 컴포넌트). 지역 상세(DongSubjectDetail)와 동일 골격·디자인.
 * 콘텐츠 맥락만 '지역' → '학교'. 공통 데이터(STEP·믿는 이유·후기)는 dongPageCopy.ts 재사용.
 */
export default function SchoolSubjectDetail({
  schoolSlug,
  schoolName,
  schoolFullName,
  levelLabel,
  sidoLabel,
  sidoSlug,
  sigunguName,
  subject,
  otherSchools,
}: {
  schoolSlug: string;
  schoolName: string;
  /** 약칭→정식명(page.tsx 에서 expandSchoolName 으로 계산). 변환 불가 시 null. */
  schoolFullName: string | null;
  levelLabel: string;
  sidoLabel: string;
  sidoSlug: string;
  sigunguName: string;
  subject: Subject;
  otherSchools: { name: string; slug: string }[];
}) {
  const region = `${sidoLabel} ${sigunguName}`;
  // H1 의 지역 파트 — 정식명이 있으면 "{시군구} {정식명}", 없으면 "{시군구}"만(메타 title 과 동일 규칙).
  const h1RegionPart = schoolFullName ? `${sigunguName} ${schoolFullName}` : sigunguName;
  const intro = buildSchoolIntro(schoolName, subject.label);
  const why = buildWhySchool(schoolName);
  const faq = buildSchoolFaq(schoolName);
  const consultMessage = `${schoolName} ${subject.label} 과외 문의드립니다.`;

  // 내부 링크
  const otherSchoolLinks = otherSchools
    .slice(0, 12)
    .map((s) => ({ label: s.name, href: schoolDetailHref(s.slug, subject.slug) }));
  const otherSubjects = subjects
    .filter((s) => s.slug !== subject.slug)
    .map((s) => ({ label: s.label, href: schoolDetailHref(schoolSlug, s.slug) }));

  // JSON-LD
  const base = site.url.replace(/\/$/, "");
  const detailPath = `/tutoring/by-school/${schoolSlug}/${subject.slug}`;
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
      { name: "학교별", url: `${base}/tutoring/by-school` },
      { name: region, url: `${base}/tutoring/by-school/${sidoSlug}` },
      { name: schoolName, url: `${base}${detailPath}` },
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
          <li><Link href="/tutoring/by-school" className="hover:text-accent">학교별</Link></li>
          <li aria-hidden className="text-line">›</li>
          <li><Link href={`/tutoring/by-school/${sidoSlug}`} className="hover:text-accent">{region}</Link></li>
          <li aria-hidden className="text-line">›</li>
          <li className="break-keep font-medium text-ink">{schoolName}</li>
          <li aria-hidden className="text-line">›</li>
          <li aria-current="page" className="font-semibold text-ink">{subject.label}</li>
        </ol>
      </nav>

      {/* 1. Hero */}
      <section className="border-b border-line bg-surface px-4 py-12 text-center sm:px-6 sm:py-16">
        <p className="text-sm font-semibold uppercase tracking-widest text-accent">
          {region} · {levelLabel}
        </p>
        <h1 className="mx-auto mt-2 max-w-3xl break-keep text-3xl font-bold leading-snug text-ink sm:text-4xl">
          {schoolName} {subject.label} 과외 — {h1RegionPart} 1:1 맞춤 개인과외 수업
        </h1>
        <p className="mx-auto mt-4 max-w-2xl break-keep text-base leading-relaxed text-muted sm:text-lg">
          직접 가르쳐 온 선생님이 {schoolName} 학생에게 가장 잘 맞는 {subject.label}{" "}
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

      <div className="mx-auto max-w-3xl space-y-12 px-4 py-12 sm:px-6 sm:py-16">
        {/* 2. 학교 맞춤 도입 */}
        <p className="break-keep text-base leading-relaxed text-muted sm:text-lg">{intro}</p>

        {/* 3. 왜 1:1 과외일까요 */}
        <section>
          <h2 className="break-keep text-xl font-bold text-ink sm:text-2xl">
            왜 {schoolName}에서 1:1 {subject.label} 과외일까요?
          </h2>
          <p className="mt-3 break-keep text-base leading-relaxed text-muted sm:text-lg">{why}</p>
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
          {otherSchoolLinks.length > 0 && (
            <div>
              <h2 className="break-keep text-xl font-bold text-ink sm:text-2xl">{sigunguName}의 다른 학교</h2>
              <ul className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4">
                {otherSchoolLinks.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="block rounded-xl border border-line bg-white px-3 py-2.5 text-center text-sm font-semibold text-ink transition-colors hover:border-accent hover:text-accent">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
              {otherSchools.length > 12 && (
                <p className="mt-3 text-center text-sm">
                  <Link href={`/tutoring/by-school/${sidoSlug}`} className="font-semibold text-accent hover:underline">더보기 →</Link>
                </p>
              )}
            </div>
          )}
          <div>
            <h2 className="break-keep text-xl font-bold text-ink sm:text-2xl">{schoolName}의 다른 과목</h2>
            <ul className="mt-4 flex flex-wrap gap-2.5">
              {otherSubjects.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="inline-flex rounded-full border border-accent/30 px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-accent hover:text-accent sm:text-base">
                    {l.label} 과외
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 10. 최종 CTA */}
        <section className="rounded-2xl bg-surface px-6 py-8 text-center sm:py-10">
          <p className="break-keep text-base font-medium leading-relaxed text-ink sm:text-lg">
            {schoolName}에서 어떤 {subject.label} 선생님이 맞을지 막막하다면, 상담부터 시작하세요. 직접 가르쳐 온 선생님이 함께 찾아 드립니다.
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
