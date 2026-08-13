import Link from "next/link";

/*
 * LinkToggleGrid — 링크 버튼 그리드 + 초과분 <details> 접힘(전량 SSR).
 *
 * 서버 컴포넌트에서 items({label, href}) 배열을 props 로 받는다(직렬화 가능).
 * 앞 visibleCount 개는 항상 표시하고, 나머지는 <details> 안에 렌더한다.
 *  → 접혀 있어도 링크가 HTML/DOM 에 그대로 존재해 크롤러가 전 상세로 도달한다
 *    (display:none 미사용, PowerFooter 와 동일 원리). 상호작용 없이 정적 <a> 만 노출.
 * 정렬은 호출부에서 끝내고 여기선 표시·접힘만. 서버 렌더라 하이드레이션 이슈 없음.
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
  const primary = items.slice(0, visibleCount);
  const rest = items.slice(visibleCount);

  const gridCls = "grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4";
  const linkCls =
    "block rounded-xl border border-line bg-white px-3 py-3 text-center text-sm font-semibold text-ink transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:text-base";

  const cell = (it: { label: string; href: string }) => (
    <li key={it.href}>
      <Link href={it.href} className={linkCls}>
        {it.label}
      </Link>
    </li>
  );

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
        <ul className={gridCls}>{primary.map(cell)}</ul>

        {/* 초과분 — 접혀 있어도 DOM 에 존재(크롤 가능). 기본 접힘. */}
        {rest.length > 0 && (
          <details className="group mt-2.5">
            <summary className="mx-auto flex min-h-12 w-fit cursor-pointer list-none items-center justify-center gap-1.5 rounded-full border border-line px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent [&::-webkit-details-marker]:hidden">
              <span className="group-[[open]]:hidden">나머지 {rest.length}개 보기</span>
              <span className="hidden group-[[open]]:inline">접기</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
                className="transition-transform group-[[open]]:rotate-180"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </summary>
            <ul className={`${gridCls} mt-2.5`}>{rest.map(cell)}</ul>
          </details>
        )}
      </nav>
    </div>
  );
}
