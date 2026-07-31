import { lessonMode } from "@/data/power/lessonMode";

/*
 * LessonModeSection — 어학의참견(/power) 비대면 수업 방식 안내 공용 섹션(서버 컴포넌트).
 *
 * 홈·지역 허브·회화 상세·시험 상세에서 재사용한다. 카피는 data/power/lessonMode 단일 소스.
 * 색은 accent 토큰만 — /power 스코프(.power-theme)에서 퍼플로 렌더된다(코랄 하드코딩 없음).
 * word-break: keep-all, 모바일 390px 가로 스크롤 없음(그리드 1→3열, flex-wrap).
 *
 * bare=false(기본): 자체 컨테이너(px·py·max-w)를 가진 최상위 섹션 — 홈·지역 허브에 사용.
 * bare=true: 상위가 이미 max-w·px·space-y 를 제공하는 상세 템플릿(ByRegionDetail/ExamDetail) 내부용.
 */

export default function LessonModeSection({ bare = false }: { bare?: boolean }) {
  const { heading, lead, cards, experience, formLine } = lessonMode;

  const content = (
    <>
      <h2
        id="lesson-mode-heading"
        className="break-keep text-center text-2xl font-bold text-ink sm:text-3xl"
      >
        {heading}
      </h2>
      <p className="mx-auto mt-4 max-w-2xl break-keep text-center text-base leading-relaxed text-muted sm:text-lg">
        {lead}
      </p>

      <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <li
            key={c.title}
            className="rounded-3xl border border-line bg-white p-6 shadow-sm"
          >
            <p className="break-keep text-lg font-bold text-accent">{c.title}</p>
            <p className="mt-2 break-keep text-sm leading-relaxed text-muted sm:text-base">
              {c.desc}
            </p>
          </li>
        ))}
      </ul>

      <div className="mt-8 rounded-3xl bg-accent/10 px-6 py-8 sm:px-8">
        <p className="break-keep text-base leading-relaxed text-muted sm:text-lg">
          {experience}
        </p>
      </div>

      <p className="mt-6 break-keep text-center text-sm font-semibold text-accent sm:text-base">
        {formLine}
      </p>
    </>
  );

  if (bare) {
    return <section aria-labelledby="lesson-mode-heading">{content}</section>;
  }

  return (
    <section
      aria-labelledby="lesson-mode-heading"
      className="px-5 py-14 sm:px-6 sm:py-20"
    >
      <div className="mx-auto max-w-3xl">{content}</div>
    </section>
  );
}
