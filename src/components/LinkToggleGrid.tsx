"use client";

import { useState } from "react";
import Link from "next/link";

/*
 * LinkToggleGrid — 링크 버튼 그리드 + "전체 보기/접기" 토글(범용).
 *
 * 서버 컴포넌트에서 items({label, href}) 배열을 props 로 받는다(직렬화 가능).
 * 정렬은 호출부에서 끝내고 여기선 표시·토글만. 결정적이라 하이드레이션 안전.
 */
export default function LinkToggleGrid({
  items,
  heading,
  badge,
  visibleCount = 8,
  ariaLabel,
}: {
  items: { label: string; href: string }[];
  heading?: string;
  badge?: string;
  visibleCount?: number;
  ariaLabel: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? items : items.slice(0, visibleCount);
  const hasMore = items.length > visibleCount;

  return (
    <div>
      {(heading || badge) && (
        <div className="mb-5 flex flex-wrap items-center justify-center gap-2">
          {heading && (
            <span className="text-lg font-bold text-ink">{heading}</span>
          )}
          {badge && (
            <span className="rounded-full bg-accent/10 px-3 py-1 text-sm font-semibold text-accent">
              {badge}
            </span>
          )}
        </div>
      )}

      <nav aria-label={ariaLabel}>
        <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4">
          {visible.map((it) => (
            <li key={it.href}>
              <Link
                href={it.href}
                className="block rounded-xl border border-line bg-white px-3 py-3 text-center text-sm font-semibold text-ink transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:text-base"
              >
                {it.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {hasMore && (
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className="inline-flex min-h-12 items-center justify-center gap-1.5 rounded-full border border-line px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {expanded ? "접기" : "전체 보기"}
            <svg
              width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden
              className={expanded ? "rotate-180" : ""}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
