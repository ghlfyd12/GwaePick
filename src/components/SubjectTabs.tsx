import Link from "next/link";
import { subjectBySlug } from "@/data/subjects";

/*
 * SubjectTabs — 과목 선택 탭(링크 탭, 서버 컴포넌트). JS 불필요.
 * - subjects.ts 8과목을 TAB_ORDER(국어·수학·영어·과학·사회·역사·논술·코딩)로 정렬해 칩 렌더.
 * - 현재 과목은 활성 하이라이트(aria-current + accent 채움). 나머지는 연한 주황 테두리.
 * - makeHref(slug) 로 페이지별 목적지 생성(학교×과목·동×과목 등에서 재사용).
 * - Hero 아래 별도 바. 모바일은 칩이 자연 줄바꿈(가로 스크롤 없음).
 */
const TAB_ORDER = [
  "korean",
  "math",
  "english",
  "science",
  "social",
  "history",
  "essay",
  "coding",
];

export default function SubjectTabs({
  currentSlug,
  makeHref,
}: {
  currentSlug: string;
  makeHref: (slug: string) => string;
}) {
  const ordered = TAB_ORDER.map((slug) => subjectBySlug[slug]).filter(Boolean);
  return (
    <nav aria-label="과목 선택" className="border-b border-line bg-white px-4 py-4 sm:px-6">
      <div className="mx-auto max-w-5xl text-center">
        <p className="text-sm font-semibold text-muted">과목 선택</p>
        <ul className="mt-3 flex flex-wrap justify-center gap-2">
          {ordered.map((s) => {
            const active = s.slug === currentSlug;
            return (
              <li key={s.slug}>
                <Link
                  href={makeHref(s.slug)}
                  aria-current={active ? "page" : undefined}
                  className={`inline-flex min-h-10 items-center rounded-full px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:text-base ${
                    active
                      ? "bg-accent text-white"
                      : "border border-accent/30 text-ink hover:border-accent hover:text-accent"
                  }`}
                >
                  {s.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
