import Link from "next/link";
import { pageNumbers } from "@/lib/paginate";
import { PAGE_NAV } from "@/data/paginationCopy";

/*
 * Pagination — 서버 렌더링 <a> 페이지네이션(크롤 가능). JS 의존 없음.
 *  - 1페이지 링크 = basePath(기존 URL), n페이지 = `${basePath}/p/${n}`(…/p/1 만들지 않음).
 *  - 데스크톱: 처음/이전 + 번호창 + 다음/마지막. 모바일(390px): 번호창 숨기고 "현재/전체" 표기.
 *  - 터치 타깃 44px 이상. totalPages<=1 이면 렌더하지 않음.
 */
export default function Pagination({
  page,
  totalPages,
  basePath,
  ariaLabel,
}: {
  page: number;
  totalPages: number;
  basePath: string;
  ariaLabel?: string;
}) {
  if (totalPages <= 1) return null;
  const href = (n: number) => (n === 1 ? basePath : `${basePath}/p/${n}`);
  const nums = pageNumbers(page, totalPages);

  const linkCls =
    "inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-line bg-white px-3 text-sm font-semibold text-ink transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";
  const offCls =
    "inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-line bg-surface-alt px-3 text-sm font-semibold text-muted";
  const curCls =
    "inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-accent bg-accent px-3 text-sm font-bold text-white";

  return (
    <nav
      aria-label={ariaLabel ?? PAGE_NAV.label}
      className="mt-8 flex flex-wrap items-center justify-center gap-1.5"
    >
      {page > 1 ? (
        <Link href={href(1)} className={linkCls} aria-label={PAGE_NAV.first}>«</Link>
      ) : (
        <span aria-hidden className={offCls}>«</span>
      )}
      {page > 1 ? (
        <Link href={href(page - 1)} className={linkCls} rel="prev">{PAGE_NAV.prev}</Link>
      ) : (
        <span aria-hidden className={offCls}>{PAGE_NAV.prev}</span>
      )}

      {/* 모바일 축약 */}
      <span className="mx-1 inline-flex min-h-11 items-center px-2 text-sm font-semibold text-muted sm:hidden">
        {PAGE_NAV.current(page, totalPages)}
      </span>

      {/* 데스크톱 번호창 */}
      <span className="hidden flex-wrap items-center gap-1.5 sm:inline-flex">
        {nums.map((n, i) =>
          n === "ellipsis" ? (
            <span key={`e${i}`} aria-hidden className="px-1 text-muted">…</span>
          ) : n === page ? (
            <span key={n} aria-current="page" className={curCls}>{n}</span>
          ) : (
            <Link key={n} href={href(n)} className={linkCls} aria-label={PAGE_NAV.pageAria(n)}>{n}</Link>
          ),
        )}
      </span>

      {page < totalPages ? (
        <Link href={href(page + 1)} className={linkCls} rel="next">{PAGE_NAV.next}</Link>
      ) : (
        <span aria-hidden className={offCls}>{PAGE_NAV.next}</span>
      )}
      {page < totalPages ? (
        <Link href={href(totalPages)} className={linkCls} aria-label={PAGE_NAV.last}>»</Link>
      ) : (
        <span aria-hidden className={offCls}>»</span>
      )}
    </nav>
  );
}
