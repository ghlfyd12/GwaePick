import Link from "next/link";
import {
  englishCourses,
  englishCourseGroups,
  englishLessonSystem,
  englishWriting,
  englishNativeIntro,
  konglishPairs,
  englishOneOnOne,
  englishTeacherNote,
} from "@/data/englishCourses";

/*
 * EnglishCourseSections — /power/english 전용 확장 섹션(서버 컴포넌트).
 *
 * LanguageDetail 에서 slug==="english" 일 때만 렌더한다(일본어·중국어 무영향).
 * 섹션1 수업 과정(3그룹 그리드) → 섹션2 수업 관리 시스템(3카드) → 섹션3 영작 교정 안내.
 * 이미지 없음, 텍스트 카드만. 색은 accent 토큰만(퍼플, /power 스코프). 코랄 하드코딩 없음.
 */
export default function EnglishCourseSections() {
  return (
    <div className="mx-auto max-w-5xl space-y-14 px-5 py-14 sm:px-6 sm:py-20">
      {/* ── 섹션 0. 원어민 수업 소개 ──────────────────────────────── */}
      <section aria-labelledby="native-heading">
        {/* 0-A 콩글리시 비교 */}
        <h2
          id="native-heading"
          className="break-keep text-center text-2xl font-bold text-ink sm:text-3xl"
        >
          {englishNativeIntro.title}
        </h2>
        <p className="mx-auto mt-3 max-w-2xl break-keep text-center text-sm leading-relaxed text-muted sm:text-base">
          {englishNativeIntro.sub}
        </p>
        <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {konglishPairs.map((p) => (
            <li key={p.ko} className="rounded-2xl border border-line bg-white p-5 shadow-sm">
              <p className="break-keep text-sm font-semibold text-ink">{p.ko}</p>
              <div className="mt-3 space-y-2">
                <p className="flex items-start gap-2 text-sm leading-relaxed">
                  <span className="mt-0.5 shrink-0 rounded-full bg-surface-alt px-1.5 text-xs font-bold text-muted">
                    X
                  </span>
                  <span className="break-keep text-muted line-through">{p.wrong}</span>
                </p>
                <p className="flex items-start gap-2 text-sm leading-relaxed">
                  <span className="mt-0.5 shrink-0 rounded-full bg-accent/10 px-1.5 text-xs font-bold text-accent">
                    O
                  </span>
                  <span className="break-keep font-semibold text-accent">{p.right}</span>
                </p>
              </div>
            </li>
          ))}
        </ul>

        {/* 0-B 1:1 수업 4대 포인트 */}
        <h3 className="mt-12 break-keep text-center text-xl font-bold text-ink sm:text-2xl">
          {englishOneOnOne.title}
        </h3>
        <ul className="mx-auto mt-6 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-2">
          {englishOneOnOne.points.map((pt) => (
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

        {/* 0-C 선생님 안내 + 링크 */}
        <div className="mx-auto mt-10 max-w-3xl rounded-3xl bg-accent/10 px-6 py-8 text-center sm:px-8">
          <p className="break-keep text-base leading-relaxed text-ink sm:text-lg">
            {englishTeacherNote.body}
          </p>
          <div className="mt-5">
            <Link
              href={englishTeacherNote.linkHref}
              className="inline-flex min-h-12 items-center break-keep rounded-full border border-accent bg-white px-6 py-2.5 text-sm font-semibold text-accent transition-colors hover:bg-accent/5 sm:text-base"
            >
              {englishTeacherNote.linkLabel}
            </Link>
          </div>
        </div>
      </section>

      {/* ── 섹션 1. 수업 과정 ─────────────────────────────────────── */}
      <section aria-labelledby="courses-heading">
        <h2
          id="courses-heading"
          className="break-keep text-center text-2xl font-bold text-ink sm:text-3xl"
        >
          나에게 맞춰 설계되는 영어 수업 과정
        </h2>
        <p className="mx-auto mt-3 max-w-2xl break-keep text-center text-sm leading-relaxed text-muted sm:text-base">
          유아 파닉스부터 유학 준비까지, 상담에서 수준과 목표를 확인하고 맞는 과정을 안내해
          드립니다.
        </p>

        <div className="mt-10 space-y-10">
          {englishCourseGroups.map((group) => {
            const courses = englishCourses.filter((c) => c.group === group.key);
            return (
              <div key={group.key}>
                <h3 className="break-keep border-b border-line pb-2 text-lg font-bold text-accent sm:text-xl">
                  {group.title}
                </h3>
                <ul className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {courses.map((c) => (
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
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 섹션 2. 수업 관리 시스템 ──────────────────────────────── */}
      <section aria-labelledby="system-heading">
        <h2
          id="system-heading"
          className="break-keep text-center text-2xl font-bold text-ink sm:text-3xl"
        >
          {englishLessonSystem.title}
        </h2>
        <p className="mx-auto mt-3 max-w-2xl break-keep text-center text-sm leading-relaxed text-muted sm:text-base">
          {englishLessonSystem.sub}
        </p>
        <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {englishLessonSystem.cards.map((card) => (
            <li key={card.title} className="rounded-3xl border border-line bg-white p-6 shadow-sm">
              <p className="break-keep text-lg font-bold text-accent">{card.title}</p>
              <p className="mt-2 break-keep text-sm leading-relaxed text-muted sm:text-base">
                {card.desc}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* ── 섹션 3. 영작 교정 안내 ────────────────────────────────── */}
      <section aria-labelledby="writing-heading" className="rounded-3xl bg-accent/10 px-6 py-10 sm:px-8">
        <h2
          id="writing-heading"
          className="break-keep text-center text-xl font-bold leading-snug text-ink sm:text-2xl"
        >
          {englishWriting.title}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl break-keep text-center text-base leading-relaxed text-muted sm:text-lg">
          {englishWriting.body}
        </p>
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
