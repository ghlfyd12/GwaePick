import type { ReactNode } from "react";
import Link from "next/link";
import ConsultForm from "@/components/ConsultForm";
import type { RegionContent } from "@/lib/regionContent";
import { CONSULT_PHONE } from "@/lib/regionContent";

/*
 * PseoLanding — pSEO 페이지 공통 레이아웃(서버 컴포넌트).
 *
 * 브레드크럼 · 히어로(H1+뱃지) · 인트로 · 핵심 4섹션 · 교차 네비(children) · FAQ(details) · 상담 폼.
 * 깊이별 교차 네비는 children 으로 주입한다. h1 은 페이지당 1개. 톤: 차분/주황 포인트.
 */
export default function PseoLanding({
  content,
  breadcrumb,
  regionLabel,
  gradeLabel,
  consultMessage,
  children,
}: {
  content: RegionContent;
  breadcrumb: { label: string; href?: string }[];
  regionLabel: string;
  gradeLabel?: string;
  consultMessage: string;
  children?: ReactNode;
}) {
  return (
    <>
      {/* 브레드크럼 */}
      <nav aria-label="현재 위치" className="border-b border-line bg-white px-4 py-3 sm:px-6">
        <ol className="mx-auto flex max-w-5xl flex-wrap items-center gap-1 text-sm text-muted">
          {breadcrumb.map((b, i) => (
            <li key={i} className="flex items-center gap-1">
              {i > 0 && <span aria-hidden className="text-line">›</span>}
              {b.href ? (
                <Link href={b.href} className="hover:text-accent">
                  {b.label}
                </Link>
              ) : (
                <span aria-current="page" className="font-semibold text-ink">
                  {b.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>

      {/* 히어로 — 유일한 h1 + 뱃지 줄 */}
      <section className="border-b border-line bg-surface px-4 py-12 text-center sm:px-6 sm:py-16">
        <h1 className="mx-auto max-w-3xl break-keep text-3xl font-bold leading-snug text-ink sm:text-4xl">
          {content.h1}
        </h1>
        <ul className="mx-auto mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm font-semibold text-muted sm:text-base">
          <li>📍 {regionLabel}</li>
          <li>🎓 {gradeLabel ? `${gradeLabel} 맞춤` : "학년·과목별"}</li>
          <li>
            📞{" "}
            <a href={`tel:${CONSULT_PHONE}`} className="text-accent hover:underline">
              {CONSULT_PHONE}
            </a>
          </li>
        </ul>
        <p className="mx-auto mt-6 max-w-2xl break-keep text-base leading-relaxed text-muted sm:text-lg">
          {content.intro}
        </p>
        <div className="mt-7">
          <a
            href="#consult"
            className="inline-flex min-h-14 items-center justify-center rounded-full bg-accent px-7 py-3 text-base font-semibold text-white shadow-md transition-colors hover:bg-accent-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:text-lg"
          >
            무료 상담 신청
          </a>
        </div>
      </section>

      {/* 핵심 4섹션 */}
      <section className="px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-3xl space-y-9">
          {content.sections.map((sec, i) => (
            <div key={i}>
              <h2 className="break-keep text-xl font-bold text-ink sm:text-2xl">
                {sec.h2}
              </h2>
              <p className="mt-3 break-keep text-base leading-relaxed text-muted sm:text-lg">
                {sec.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 교차 네비게이션(깊이별) */}
      {children && (
        <section className="border-t border-line bg-surface px-4 py-12 sm:px-6 sm:py-16">
          <div className="mx-auto max-w-5xl">{children}</div>
        </section>
      )}

      {/* FAQ — 아코디언(details, JS 불필요) */}
      <section className="px-4 py-12 sm:px-6 sm:py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-xl font-bold text-ink sm:text-2xl">자주 묻는 질문</h2>
          <div className="mt-6 divide-y divide-line border-y border-line">
            {content.faq.map((f, i) => (
              <details key={i} className="group py-1">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-4 text-base font-semibold text-ink sm:text-lg">
                  <span className="break-keep">{f.q}</span>
                  <span
                    aria-hidden
                    className="shrink-0 text-accent transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="pb-4 break-keep text-base leading-relaxed text-muted">
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 상담 폼(프리필) — 섹션 id="consult" */}
      <ConsultForm defaultMessage={consultMessage} />
    </>
  );
}
