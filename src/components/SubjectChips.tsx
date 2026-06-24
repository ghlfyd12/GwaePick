import Link from "next/link";
import { subjects } from "@/data/pseo";

/*
 * SubjectChips — 과목 전환 칩(서버 컴포넌트). makeHref 로 깊이별 경로를 만든다.
 * 현재 과목은 주황 채움, 나머지는 연한 주황 테두리.
 */
export default function SubjectChips({
  current,
  makeHref,
}: {
  current: string;
  makeHref: (subjectSlug: string) => string;
}) {
  return (
    <div className="text-center">
      <p className="text-sm font-semibold text-muted">과목 선택</p>
      <ul className="mt-3 flex flex-wrap justify-center gap-2">
        {subjects.map((s) => {
          const active = s.slug === current;
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
  );
}
