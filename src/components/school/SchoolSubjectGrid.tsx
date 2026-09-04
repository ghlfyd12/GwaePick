import Link from "next/link";
import { subjectBySlug } from "@/data/subjects";
import { getHighDetailSubject, HIGH_DETAIL_SLUGS } from "@/data/highDetailSubjects";

/*
 * SchoolSubjectGrid — 학교 상세 하단 "다른 과목도 함께 준비하세요" 전과목 그리드(서버 컴포넌트).
 * 상단 SubjectTabs(탐색)와 데이터 공유(subjects.ts 8과목·TAB_ORDER)하되, 하단에서 교차 유도 역할.
 * makeHref(slug)로 같은 학교의 각 과목 페이지로 연결. 현재 과목은 활성 표기. 초·중·고 공통.
 * 색은 accent 토큰(코랄, 본체). subjects.ts 무수정 — 여기서 참조만.
 */
const TAB_ORDER = ["korean", "math", "english", "science", "social", "history", "essay", "coding"];

export default function SchoolSubjectGrid({
  schoolName,
  currentSlug,
  makeHref,
  highDetail = false,
}: {
  schoolName: string;
  currentSlug: string;
  makeHref: (slug: string) => string;
  /** 고교 상세에서만 true — 세부과목(과탐 4) 포함 12과목 그리드. */
  highDetail?: boolean;
}) {
  const order = highDetail ? [...TAB_ORDER, ...HIGH_DETAIL_SLUGS] : TAB_ORDER;
  const ordered = order
    .map((s) => subjectBySlug[s] ?? getHighDetailSubject(s))
    .filter(Boolean);
  return (
    <section aria-labelledby="allsubj-heading">
      <h2 id="allsubj-heading" className="break-keep text-xl font-bold text-ink sm:text-2xl">
        다른 과목도 함께 준비하세요
      </h2>
      <p className="mt-2 break-keep text-sm leading-relaxed text-muted sm:text-base">
        {schoolName}의 다른 과목도 1:1로 준비할 수 있습니다.
      </p>
      <ul className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {ordered.map((s) => {
          const active = s.slug === currentSlug;
          return (
            <li key={s.slug}>
              <Link
                href={makeHref(s.slug)}
                aria-current={active ? "page" : undefined}
                className={`block break-keep rounded-xl border px-3 py-2.5 text-center text-sm font-semibold transition-colors sm:text-base ${
                  active
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-line bg-white text-ink hover:border-accent hover:text-accent"
                }`}
              >
                {schoolName} {s.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
