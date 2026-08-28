import type { CompareSection } from "@/data/power/studyModeCompare";

/*
 * CompareStudySection — "학원과 1:1 과외" 비교 섹션(공용, 회화·시험 상세 공통).
 *
 * 본문 전용(title/og/description 에 "학원" 미유입). 색은 accent 토큰만 — /power 스코프에서 퍼플.
 * 섹션 내 CTA 버튼 없음(단일 CTA 원칙). 사실 대비 서술만 — 카피는 studyModeCompare.ts 단일 소스.
 */
export default function CompareStudySection({ section }: { section: CompareSection }) {
  return (
    <section aria-labelledby="compare-heading">
      <h2
        id="compare-heading"
        className="break-keep text-center text-2xl font-bold text-ink sm:text-3xl"
      >
        {section.heading}
      </h2>
      <div className="mx-auto mt-4 max-w-2xl space-y-3">
        {section.paragraphs.map((p, i) => (
          <p key={i} className="break-keep text-base leading-relaxed text-muted sm:text-lg">
            {p}
          </p>
        ))}
        <p className="break-keep text-sm leading-relaxed text-muted sm:text-base">
          {section.closing}
        </p>
      </div>
    </section>
  );
}
