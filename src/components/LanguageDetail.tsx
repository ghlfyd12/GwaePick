import Image from "next/image";
import ConsultForm from "@/components/ConsultForm";
import { site } from "@/data/site";
import {
  languageDetails,
  lessonMethods,
  LANGUAGE_HERO_IMAGE,
  type LanguageSlug,
} from "@/data/languageDetail";

/*
 * LanguageDetail — /power/{english|japanese|chinese} 공용 상세 템플릿(서버 컴포넌트).
 *
 * 세 언어가 이 한 벌의 템플릿 + languageDetail.ts 데이터로 렌더된다(언어별 복붙 없음).
 * 골격: Hero(h1) → 선택 이유 4카드 → 수업 방식(전화·화상 시간·횟수) → 가능한 수업 태그 → 최종 CTA + 폼.
 * 헤더(어학의참견)·푸터·플로팅 CTA 는 루트 layout 에서 상속. 폼은 공통 ConsultForm 재사용.
 */

const CONSULT_ANCHOR = "#consult";

export default function LanguageDetail({ slug }: { slug: LanguageSlug }) {
  const data = languageDetails[slug];

  return (
    <>
      {/* ── 1. Hero ─────────────────────────────────────────────── */}
      <section className="border-b border-line bg-surface px-5 py-10 sm:px-6 md:px-10 md:py-14">
        <div className="mx-auto grid max-w-5xl items-center gap-8 md:grid-cols-2 md:gap-10">
          {/* 좌: 텍스트(모바일 가운데 / 데스크톱 왼쪽) */}
          <div className="order-2 text-center md:order-1 md:text-left">
            <p className="text-sm font-semibold uppercase tracking-widest text-accent">
              어학의참견 · {data.label}
            </p>
            <h1 className="mt-2 break-keep text-[1.7rem] font-bold leading-snug text-ink sm:text-4xl sm:leading-tight">
              {data.heroHeadline}
            </h1>
            <p className="mt-4 break-keep text-base leading-relaxed text-muted sm:text-lg">
              {data.heroSub}
            </p>

            {/* 무료 상담 CTA */}
            <div className="mt-6 flex justify-center md:justify-start">
              <a
                href={CONSULT_ANCHOR}
                className="inline-flex min-h-14 w-full max-w-xs items-center justify-center rounded-full bg-accent px-8 text-base font-semibold text-white shadow-md transition-colors hover:bg-accent-dark sm:w-auto sm:text-lg"
              >
                {site.cta.label}
              </a>
            </div>

            {/* 수준·목표 칩 4개 */}
            <ul className="mt-6 flex flex-wrap justify-center gap-2 md:justify-start">
              {data.heroChips.map((chip) => (
                <li
                  key={chip}
                  className="inline-flex items-center gap-1.5 break-keep rounded-full border border-accent/40 bg-white px-3 py-1.5 text-sm font-semibold text-ink"
                >
                  <CheckIcon />
                  {chip}
                </li>
              ))}
            </ul>
          </div>

          {/* 우: 이미지(오버레이 없음, 고정 비율로 클리핑 방지) */}
          <div className="relative order-1 aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-md ring-1 ring-line md:order-2">
            <Image
              src={LANGUAGE_HERO_IMAGE}
              alt={`${data.label} 1:1 수업을 준비하는 학생`}
              fill
              priority
              sizes="(min-width: 768px) 512px, 100vw"
              className="object-cover object-center"
              unoptimized
            />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl space-y-14 px-5 py-14 sm:px-6 sm:py-20">
        {/* ── 2. 선택 이유 4카드 ──────────────────────────────────── */}
        <section aria-labelledby="reasons-heading">
          <h2
            id="reasons-heading"
            className="break-keep text-center text-2xl font-bold text-ink sm:text-3xl"
          >
            왜 1:1 원어민·교포 수업일까요
          </h2>
          <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {data.reasons.map((r) => (
              <li
                key={r.no}
                className="rounded-3xl border border-line bg-white p-6 shadow-sm"
              >
                <p className="text-lg font-extrabold text-accent">{r.no}</p>
                <p className="mt-1 break-keep text-lg font-bold text-ink">{r.title}</p>
                <p className="mt-2 break-keep text-sm leading-relaxed text-muted sm:text-base">
                  {r.desc}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* ── 3. 수업 방식 + 시간·횟수 ────────────────────────────── */}
        <section aria-labelledby="methods-heading">
          <h2
            id="methods-heading"
            className="break-keep text-center text-2xl font-bold text-ink sm:text-3xl"
          >
            수업은 이렇게 진행됩니다
          </h2>
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            {lessonMethods.map((m) => (
              <article
                key={m.title}
                className="flex flex-col rounded-3xl border border-line bg-white p-6 shadow-sm"
              >
                <h3 className="break-keep text-xl font-bold text-ink">{m.title}</h3>
                <p className="mt-2 break-keep text-sm leading-relaxed text-muted sm:text-base">
                  {m.desc}
                </p>

                <p className="mt-5 break-keep text-sm font-bold text-accent">수업 시간</p>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {m.durations.map((d) => (
                    <li
                      key={d}
                      className="inline-flex rounded-full bg-accent/10 px-3 py-1.5 text-sm font-bold text-accent"
                    >
                      {d}
                    </li>
                  ))}
                </ul>

                <p className="mt-4 break-keep text-sm font-bold text-accent">수업 횟수</p>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {m.frequencies.map((f) => (
                    <li
                      key={f}
                      className="inline-flex rounded-full border border-accent/40 px-3 py-1.5 text-sm font-semibold text-ink"
                    >
                      {f}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        {/* ── 4. 이런 수업이 가능합니다 (태그 칩) ─────────────────── */}
        <section aria-labelledby="tags-heading">
          <h2
            id="tags-heading"
            className="break-keep text-center text-2xl font-bold text-ink sm:text-3xl"
          >
            이런 수업이 가능합니다
          </h2>
          <ul className="mt-8 flex flex-wrap justify-center gap-2.5">
            {data.lessonTags.map((tag) => (
              <li
                key={tag}
                className="inline-flex items-center gap-1.5 break-keep rounded-full border border-accent/40 px-4 py-2 text-sm font-semibold text-accent sm:text-base"
              >
                <CheckIcon />
                {tag}
              </li>
            ))}
            <li className="inline-flex items-center break-keep px-2 py-2 text-sm font-semibold text-muted sm:text-base">
              등
            </li>
          </ul>
        </section>

        {/* ── 5. 최종 CTA ─────────────────────────────────────────── */}
        <section aria-labelledby="closing-heading" className="rounded-3xl bg-surface px-6 py-10 text-center sm:py-12">
          <h2
            id="closing-heading"
            className="break-keep text-2xl font-bold leading-snug text-ink sm:text-3xl"
          >
            오늘 상담으로, 그 첫걸음을
          </h2>
          <p className="mx-auto mt-4 max-w-xl break-keep text-base leading-relaxed text-muted sm:text-lg">
            {data.closingMessage}
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

      {/* ── 상담 폼(#consult) — 전화·카카오·폼 일체. 진입 언어를 프리필. ── */}
      <ConsultForm defaultMessage={`${data.label} 1:1 상담 문의드립니다.`} />
    </>
  );
}

/* ── 아이콘 ──────────────────────────────────────────────────────── */
function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="shrink-0 text-accent"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
