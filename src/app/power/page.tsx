import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import ConsultForm from "@/components/ConsultForm";
import CaseGroup from "@/components/power/CaseGroup";
import { site } from "@/data/site";
import { sidoList } from "@/data/sido";
import { powerHero, powerClosing } from "@/data/languagePrograms";
import { languageCases, CASE_GROUPS } from "@/data/languageCases";
import {
  powerHomeHeroImage,
  powerLanguageCards,
  powerHomeSteps,
  powerSchoolBanner,
} from "@/data/powerHomeCards";

/*
 * /power — 어학(영어·중국어·일본어) 전문 1:1 상담 랜딩(시각 앵커 중심 리뉴얼).
 *
 * 골격: 1 히어로(카피+이미지 분할) → 2 언어 선택 3카드 → 3 진행 방식 3단계 → 4 학교별 안내 배너
 *      → 5 지역별 어학과외 칩 → (학습사례 #cases: 헤더 내비 앵커 유지) → 6 마감 CTA + 상담 폼.
 * 헤더·푸터·플로팅 CTA 는 루트 layout 상속. 카피·카드 데이터는 data 단일 소스에서 가져온다.
 * 이미지는 next/image + unoptimized(원본 경로 <img src> 노출). 색은 accent 토큰(퍼플)만.
 */

const PAGE_TITLE =
  "어학 전문 과외 상담 | 영어·중국어·일본어 회화·시험·입시 | 지식의참견";
const PAGE_DESCRIPTION =
  "회화부터 토익·토플·HSK·JLPT, 입시 영어까지. 직접 가르쳐 온 선생님이 1:1로 상담하고 가장 잘 맞는 선생님과 연결해 드립니다.";

export const metadata: Metadata = {
  // 레이아웃의 title.template("%s | 지식의참견") 중복을 피하려 absolute 로 고정.
  title: { absolute: PAGE_TITLE },
  description: PAGE_DESCRIPTION,
  alternates: { canonical: "/power" },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    type: "website",
    locale: "ko_KR",
    siteName: site.name,
    url: "/power",
    images: [site.ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    images: [site.ogImage],
  },
};

// 페이지 내 상담 폼(#consult) 으로 모으는 인페이지 CTA.
const CONSULT_ANCHOR = "#consult";

// 학습사례를 3개 그룹으로 묶는다(카테고리 표준값 기준). 데이터는 languageCases.ts 그대로.
const caseGroups = CASE_GROUPS.map((g) => ({
  ...g,
  cases: languageCases.filter((c) => g.categories.includes(c.category)),
})).filter((g) => g.cases.length > 0);

export default function PowerPage() {
  return (
    <>
      {/* ── 1. 히어로 (카피 그대로 + 우측/하단 이미지 분할) ────────────── */}
      <section
        aria-labelledby="power-hero-heading"
        className="border-b border-line bg-surface px-5 py-12 sm:px-6 md:px-10 md:py-16"
      >
        <div className="mx-auto grid max-w-5xl items-center gap-8 md:grid-cols-2 md:gap-10">
          {/* 텍스트(모바일 위 / 데스크톱 좌측) */}
          <div className="text-center md:text-left">
            <p className="text-sm font-semibold uppercase tracking-widest text-accent">
              {powerHero.eyebrow}
            </p>
            <h1
              id="power-hero-heading"
              className="mt-3 break-keep text-[1.6rem] font-bold leading-snug text-ink sm:text-4xl sm:leading-tight"
            >
              {powerHero.headline.map((seg, i) =>
                seg.emphasis ? (
                  <strong key={i} className="font-extrabold text-accent">
                    {seg.text}
                  </strong>
                ) : (
                  <span key={i}>{seg.text}</span>
                ),
              )}
            </h1>
            <p className="mt-5 break-keep text-base leading-relaxed text-muted sm:text-lg">
              {powerHero.sub}
            </p>

            <div className="mt-7 flex justify-center md:justify-start">
              <Link
                href={CONSULT_ANCHOR}
                className="inline-flex min-h-14 w-full max-w-xs items-center justify-center rounded-full bg-accent px-8 text-base font-semibold text-white shadow-md transition-colors hover:bg-accent-dark sm:w-auto sm:text-lg"
              >
                {site.cta.label}
              </Link>
            </div>

            <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 md:justify-start">
              {powerHero.badges.map((badge) => (
                <li
                  key={badge}
                  className="flex items-center gap-1.5 break-keep text-sm font-semibold text-ink"
                >
                  <CheckIcon />
                  {badge}
                </li>
              ))}
            </ul>
          </div>

          {/* 이미지(모바일 아래 / 데스크톱 우측) */}
          <div className="relative order-first aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-md ring-1 ring-line md:order-none">
            <Image
              src={powerHomeHeroImage.src}
              alt={powerHomeHeroImage.alt}
              fill
              priority
              sizes="(min-width: 768px) 512px, 100vw"
              className="object-cover object-center"
              unoptimized
            />
          </div>
        </div>
      </section>

      {/* ── 2. 언어 선택 3카드 ─────────────────────────────────────── */}
      <section
        aria-labelledby="power-lang-heading"
        className="px-5 py-14 sm:px-6 sm:py-20"
      >
        <div className="mx-auto max-w-5xl">
          <h2
            id="power-lang-heading"
            className="break-keep text-center text-2xl font-bold text-ink sm:text-3xl"
          >
            어떤 언어를 시작할까요
          </h2>
          <ul className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {powerLanguageCards.map((lang) => (
              <li key={lang.id}>
                <Link
                  href={lang.href}
                  className="group flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-white shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden">
                    <Image
                      src={lang.image}
                      alt={lang.alt}
                      fill
                      sizes="(min-width: 640px) 320px, 100vw"
                      className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
                      unoptimized
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <p className="break-keep text-lg font-bold text-ink">{lang.name}</p>
                    <p className="mt-1.5 break-keep text-sm leading-relaxed text-muted">
                      {lang.blurb}
                    </p>
                    <span className="mt-4 inline-flex break-keep text-sm font-semibold text-accent">
                      {lang.name} 수업 보기 →
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── 3. 진행 방식 3단계 ─────────────────────────────────────── */}
      <section
        aria-labelledby="power-steps-heading"
        className="border-t border-line bg-surface px-5 py-14 sm:px-6 sm:py-20"
      >
        <div className="mx-auto max-w-5xl">
          <h2
            id="power-steps-heading"
            className="break-keep text-center text-2xl font-bold text-ink sm:text-3xl"
          >
            이렇게 시작합니다
          </h2>
          <ol className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {powerHomeSteps.map((step) => (
              <li
                key={step.no}
                className="rounded-3xl border border-line bg-white p-6 shadow-sm"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-accent text-lg font-bold text-white">
                  {step.no}
                </span>
                <p className="mt-4 break-keep text-lg font-bold text-ink">{step.title}</p>
                <p className="mt-2 break-keep text-sm leading-relaxed text-muted sm:text-base">
                  {step.desc}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── 4. 학교별 안내 배너 ────────────────────────────────────── */}
      <section aria-labelledby="power-school-heading" className="px-5 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <Link
            href={powerSchoolBanner.href}
            className="group grid grid-cols-1 overflow-hidden rounded-3xl border border-line bg-white shadow-sm transition-shadow hover:shadow-md md:grid-cols-2"
          >
            <div className="relative aspect-[16/10] w-full overflow-hidden md:aspect-auto md:min-h-full">
              <Image
                src={powerSchoolBanner.image}
                alt={powerSchoolBanner.alt}
                fill
                sizes="(min-width: 768px) 512px, 100vw"
                className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
                unoptimized
              />
            </div>
            <div className="flex flex-col justify-center gap-3 p-7 sm:p-9">
              <h2
                id="power-school-heading"
                className="break-keep text-2xl font-bold leading-snug text-ink sm:text-3xl"
              >
                {powerSchoolBanner.title}
              </h2>
              <p className="break-keep text-base leading-relaxed text-muted sm:text-lg">
                {powerSchoolBanner.desc}
              </p>
              <span className="mt-1 inline-flex break-keep text-base font-semibold text-accent">
                학교별 안내 보기 →
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* ── 5. 지역별 어학과외(시도 칩) ────────────────────────────── */}
      <section
        aria-labelledby="power-region-heading"
        className="border-t border-line bg-surface px-5 py-14 sm:px-6 sm:py-20"
      >
        <div className="mx-auto max-w-5xl text-center">
          <h2
            id="power-region-heading"
            className="break-keep text-2xl font-bold text-ink sm:text-3xl"
          >
            지역별 어학과외
          </h2>
          <p className="mx-auto mt-3 max-w-2xl break-keep text-base leading-relaxed text-muted sm:text-lg">
            우리 동네에서 방문·온라인으로 시작할 수 있습니다.
          </p>
          <ul className="mt-8 flex flex-wrap justify-center gap-2.5">
            {sidoList.map((s) => (
              <li key={s.slug}>
                <Link
                  href={`/power/${encodeURIComponent(s.label)}`}
                  className="inline-flex min-h-11 items-center break-keep rounded-full border border-accent/40 bg-white px-4 py-2 text-sm font-semibold text-accent transition-colors hover:bg-accent/5"
                >
                  {s.label} 어학과외
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── 어학 학습사례 (#cases) — 헤더 내비 "학습사례" 앵커 유지(별점·날짜·실명 없음) ── */}
      <section
        id="cases"
        aria-labelledby="power-cases-heading"
        className="scroll-mt-28 px-5 py-14 sm:px-6 sm:py-20"
      >
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-accent">
              어학 학습사례
            </p>
            <h2
              id="power-cases-heading"
              className="mt-2 break-keep text-2xl font-bold text-ink sm:text-3xl"
            >
              어학, 이런 목표로 함께합니다
            </h2>
            <p className="mx-auto mt-3 max-w-2xl break-keep text-base leading-relaxed text-muted sm:text-lg">
              실제 상담에서 자주 나오는 학습 목표를 유형별로 정리한 예시입니다.
            </p>
          </div>
          <div className="mt-10 space-y-10">
            {caseGroups.map((g) => (
              <CaseGroup key={g.key} title={g.title} cases={g.cases} />
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. 마감 CTA (희망 메시지) ──────────────────────────────── */}
      <section
        aria-labelledby="power-closing-heading"
        className="border-t border-line bg-surface px-5 py-14 sm:px-6 sm:py-20"
      >
        <div className="mx-auto max-w-2xl text-center">
          <h2
            id="power-closing-heading"
            className="break-keep text-2xl font-bold leading-snug text-ink sm:text-3xl"
          >
            오늘 상담으로, 그 첫걸음을
          </h2>
          <p className="mx-auto mt-5 max-w-xl break-keep text-base leading-relaxed text-muted sm:text-lg">
            {powerClosing.message}
          </p>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href={CONSULT_ANCHOR}
              className="inline-flex min-h-14 w-full max-w-xs items-center justify-center rounded-full bg-accent px-8 text-base font-semibold text-white shadow-md transition-colors hover:bg-accent-dark sm:w-auto sm:text-lg"
            >
              {site.cta.label} →
            </Link>
            <a
              href={`tel:${site.contact.phone}`}
              className="inline-flex min-h-14 w-full max-w-xs items-center justify-center rounded-full border-2 border-accent bg-white px-7 text-base font-bold text-accent transition-colors hover:bg-accent/5 sm:w-auto sm:text-lg"
            >
              {site.contact.phone}
            </a>
          </div>
        </div>
      </section>

      {/* ── 상담 폼(#consult) — 전화·카카오·폼 일체. 기존 공통 컴포넌트 재사용. ── */}
      <ConsultForm defaultMessage="어학(영어·중국어·일본어) 상담 문의드립니다." />
    </>
  );
}

/* ── 아이콘 ──────────────────────────────────────────────────────── */
function CheckIcon() {
  return (
    <svg
      width="18"
      height="18"
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
