import { Fragment } from "react";
import Link from "next/link";
import {
  japaneseIntro,
  japaneseOneOnOne,
  japaneseRoadmap,
  japaneseCourses,
} from "@/data/japaneseCourses";

/*
 * JapaneseCourseSections — /power/japanese 전용 확장 섹션(서버 컴포넌트).
 *
 * LanguageDetail 에서 slug==="japanese" 일 때만 렌더(영어·중국어 무영향).
 * 섹션0 공감 도입 → 섹션1 1:1 수업 포인트 → 섹션2 수준별 로드맵 → 섹션3 추천 과정 8종.
 * 이미지·일러스트 없음, 텍스트 카드만. 색은 accent 토큰만(퍼플). 코랄 하드코딩 없음.
 */
export default function JapaneseCourseSections() {
  return (
    <div className="mx-auto max-w-5xl space-y-14 px-5 py-14 sm:px-6 sm:py-20">
      {/* ── 섹션 0. 공감 도입 ─────────────────────────────────────── */}
      <section aria-labelledby="jp-intro-heading">
        <h2
          id="jp-intro-heading"
          className="break-keep text-center text-2xl font-bold text-ink sm:text-3xl"
        >
          {japaneseIntro.title}
        </h2>
        <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {japaneseIntro.bubbles.map((b) => (
            <li
              key={b}
              className="rounded-2xl rounded-bl-sm border border-line bg-white p-5 text-center shadow-sm"
            >
              <p className="break-keep text-sm font-medium leading-relaxed text-ink sm:text-base">
                {b}
              </p>
            </li>
          ))}
        </ul>
        <p className="mx-auto mt-6 max-w-2xl break-keep text-center text-base font-semibold leading-relaxed text-accent sm:text-lg">
          {japaneseIntro.closing}
        </p>
      </section>

      {/* ── 섹션 1. 1:1 수업 포인트 ───────────────────────────────── */}
      <section aria-labelledby="jp-oneonone-heading">
        <h2
          id="jp-oneonone-heading"
          className="break-keep text-center text-2xl font-bold text-ink sm:text-3xl"
        >
          {japaneseOneOnOne.title}
        </h2>
        <ul className="mx-auto mt-8 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-2">
          {japaneseOneOnOne.points.map((pt) => (
            <li
              key={pt}
              className="flex items-start gap-2.5 rounded-2xl border border-line bg-white p-4"
            >
              <CheckIcon />
              <span className="break-keep text-sm font-medium leading-relaxed text-ink sm:text-base">
                {pt}
              </span>
            </li>
          ))}
        </ul>
        <ul className="mt-5 flex flex-wrap justify-center gap-2.5">
          {japaneseOneOnOne.chips.map((chip) => (
            <li
              key={chip}
              className="inline-flex break-keep rounded-full bg-accent/10 px-4 py-2 text-sm font-semibold text-accent"
            >
              {chip}
            </li>
          ))}
        </ul>
      </section>

      {/* ── 섹션 2. 수준별 로드맵(화살표 흐름) ────────────────────── */}
      <section aria-labelledby="jp-roadmap-heading">
        <h2
          id="jp-roadmap-heading"
          className="break-keep text-center text-2xl font-bold text-ink sm:text-3xl"
        >
          {japaneseRoadmap.title}
        </h2>
        <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row">
          {japaneseRoadmap.stages.map((stage, i) => (
            <Fragment key={stage.level}>
              <div className="flex-1 rounded-2xl border border-line bg-white p-5 shadow-sm">
                <p className="break-keep rounded-full bg-accent/10 px-3 py-1 text-center text-sm font-bold text-accent">
                  {stage.level}
                </p>
                <ul className="mt-4 space-y-2">
                  {stage.items.map((it) => (
                    <li
                      key={it}
                      className="break-keep text-sm leading-relaxed text-muted sm:text-[15px]"
                    >
                      {it}
                    </li>
                  ))}
                </ul>
              </div>
              {i < japaneseRoadmap.stages.length - 1 && (
                <div
                  aria-hidden
                  className="flex items-center justify-center text-xl font-bold text-accent"
                >
                  <span className="sm:hidden">↓</span>
                  <span className="hidden sm:inline">→</span>
                </div>
              )}
            </Fragment>
          ))}
        </div>
        <p className="mt-5 break-keep text-center text-xs leading-relaxed text-muted sm:text-sm">
          {japaneseRoadmap.note}
        </p>
      </section>

      {/* ── 섹션 3. 추천 과정 8종 ─────────────────────────────────── */}
      <section aria-labelledby="jp-courses-heading">
        <h2
          id="jp-courses-heading"
          className="break-keep text-center text-2xl font-bold text-ink sm:text-3xl"
        >
          목표에 맞춰 고르는 일본어 수업 과정
        </h2>
        <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {japaneseCourses.map((c) => (
            <li
              key={c.id}
              className="flex flex-col rounded-2xl border border-line bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="break-keep text-base font-bold text-ink">{c.name}</p>
                <span className="shrink-0 break-keep rounded-full bg-accent/10 px-2.5 py-1 text-xs font-semibold text-accent">
                  {c.level}
                </span>
              </div>
              <p className="mt-2 break-keep text-sm leading-relaxed text-muted">
                {c.description}
              </p>
              {c.link && (
                <Link
                  href={c.link.href}
                  className="mt-3 inline-flex break-keep text-sm font-semibold text-accent transition-colors hover:underline"
                >
                  {c.link.label}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

/* 체크 아이콘 — 장식용 svg(이모지 아님). */
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
      className="mt-0.5 shrink-0 text-accent"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
