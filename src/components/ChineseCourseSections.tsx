import Link from "next/link";
import {
  chineseAreas,
  chineseProcess,
  chineseMethodNote,
  chineseCourses,
} from "@/data/chineseCourses";

/*
 * ChineseCourseSections — /power/chinese 전용 확장 섹션(서버 컴포넌트).
 *
 * LanguageDetail 에서 slug==="chinese" 일 때만 렌더(영어·일본어 무영향).
 * 섹션0 6대 학습 영역 → 섹션1 수업 진행 3단계 → 섹션2 추천 과정 8종 → 섹션3 수업 방식 안내.
 * 이미지·일러스트·캐릭터 없음, 텍스트 카드만. 색은 accent 토큰만(퍼플). 코랄 하드코딩 없음.
 */
export default function ChineseCourseSections() {
  return (
    <div className="mx-auto max-w-5xl space-y-14 px-5 py-14 sm:px-6 sm:py-20">
      {/* ── 섹션 0. 6대 학습 영역 ─────────────────────────────────── */}
      <section aria-labelledby="cn-areas-heading">
        <h2
          id="cn-areas-heading"
          className="break-keep text-center text-2xl font-bold text-ink sm:text-3xl"
        >
          {chineseAreas.title}
        </h2>
        <p className="mx-auto mt-3 max-w-2xl break-keep text-center text-sm leading-relaxed text-muted sm:text-base">
          {chineseAreas.sub}
        </p>
        <ul className="mt-8 flex flex-wrap justify-center gap-2.5 sm:gap-3">
          {chineseAreas.chips.map((chip) => (
            <li
              key={chip}
              className="inline-flex break-keep rounded-full border border-accent/40 bg-white px-5 py-2.5 text-sm font-semibold text-accent sm:text-base"
            >
              {chip}
            </li>
          ))}
        </ul>
      </section>

      {/* ── 섹션 1. 수업 진행 3단계(세로 흐름) ────────────────────── */}
      <section aria-labelledby="cn-process-heading">
        <h2
          id="cn-process-heading"
          className="break-keep text-center text-2xl font-bold text-ink sm:text-3xl"
        >
          {chineseProcess.title}
        </h2>
        <ol className="mx-auto mt-8 max-w-2xl space-y-4">
          {chineseProcess.steps.map((step) => (
            <li key={step.no} className="rounded-2xl border border-line bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="shrink-0 break-keep rounded-full bg-accent/10 px-3 py-1 text-xs font-bold text-accent">
                  {step.no}
                </span>
                <p className="break-keep text-base font-bold text-ink sm:text-lg">{step.title}</p>
              </div>
              <p className="mt-2 break-keep text-sm leading-relaxed text-muted sm:text-base">
                {step.desc}
              </p>

              {/* STEP 3 성조 질문 예시 — 텍스트 말풍선(인물 사진·캐릭터 없음) */}
              {step.no === "STEP 3" && (
                <div className="mt-4 space-y-2.5">
                  <p className="max-w-[85%] break-keep rounded-2xl rounded-tl-sm bg-surface-alt px-4 py-2.5 text-sm leading-relaxed text-ink">
                    {chineseProcess.tonExample.question}
                  </p>
                  <p className="ml-auto max-w-[85%] break-keep rounded-2xl rounded-tr-sm bg-accent/10 px-4 py-2.5 text-sm leading-relaxed text-ink">
                    {chineseProcess.tonExample.answer}
                  </p>
                </div>
              )}
            </li>
          ))}
        </ol>
      </section>

      {/* ── 섹션 2. 추천 과정 8종 ─────────────────────────────────── */}
      <section aria-labelledby="cn-courses-heading">
        <h2
          id="cn-courses-heading"
          className="break-keep text-center text-2xl font-bold text-ink sm:text-3xl"
        >
          목표에 맞춰 고르는 중국어 수업 과정
        </h2>
        <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {chineseCourses.map((c) => (
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

      {/* ── 섹션 3. 수업 방식 안내(짧은 마무리) ───────────────────── */}
      <section
        aria-labelledby="cn-method-heading"
        className="rounded-3xl bg-accent/10 px-6 py-10 sm:px-8"
      >
        <h2 id="cn-method-heading" className="sr-only">
          수업 방식 안내
        </h2>
        <p className="mx-auto max-w-2xl break-keep text-center text-base leading-relaxed text-ink sm:text-lg">
          {chineseMethodNote}
        </p>
      </section>
    </div>
  );
}
