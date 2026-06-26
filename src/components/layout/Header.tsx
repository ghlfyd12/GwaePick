"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import CTAButton from "@/components/ui/CTAButton";
import { site, type NavItem } from "@/data/site";

/*
 * 상단 고정 헤더.
 * - sticky 고정, 흰 배경 + 옅은 하단 보더 / 좌측 로고 · 우측 CTA(항상 노출)
 * - 네비(site.nav): 데스크톱 가로 정렬, 모바일 햄버거.
 * - children 있는 항목("1:1과외수업")은 데스크톱 드롭다운 / 모바일 아코디언(자체 페이지 이동 없음).
 *   색은 기존 브랜드 토큰(흰 패널 + 주황 강조) 사용(보라/녹색 미사용 — CLAUDE.md 규칙).
 *
 * 데이터(브랜드명·네비·CTA)는 src/data/site.ts 단일 소스에서 가져온다.
 */
export default function Header() {
  const [open, setOpen] = useState(false);
  const [mobileSub, setMobileSub] = useState<string | null>(null);
  const pathname = usePathname();

  // 라우트형 메뉴(/teachers 등)는 현재 경로와 일치하면 active(주황 강조).
  const isActive = (href: string) =>
    href.startsWith("/") && !href.includes("#") && pathname === href;
  // 드롭다운 트리거: 하위 항목 중 현재 경로가 있으면 active.
  const isParentActive = (item: NavItem) =>
    !!item.children?.some((c) => isActive(c.href));

  const closeAll = () => {
    setOpen(false);
    setMobileSub(null);
  };

  // 모바일 헤더 로고 옆 빠른 메뉴 — site.nav 에서 학교별/지역별만 뽑아 사용(하드코딩 금지).
  const mobileQuick = ["/tutoring/by-school", "/tutoring/by-region"]
    .map((href) => site.nav.find((n) => n.href === href))
    .filter((n): n is NavItem => Boolean(n));

  return (
    <header className="sticky top-0 z-40 w-full border-b border-line bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-2 sm:gap-3 sm:px-3 md:h-20 lg:h-24 lg:gap-4">
        {/* 좌측: 로고 + 태그라인(데스크톱만). min-w-0 래퍼 — xl 좁은 폭에서 태그라인이 먼저 양보해
            가로 스크롤 방지(데스크톱 기존 동작과 동일). 모바일 빠른 메뉴는 우측으로 이동. */}
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex shrink-0 items-baseline gap-2">
            <Link
              href="/"
              className="text-lg font-bold text-accent md:text-3xl lg:text-4xl xl:text-5xl"
              onClick={closeAll}
            >
              {site.name}
            </Link>
            <span className="hidden min-w-0 truncate whitespace-nowrap text-sm font-medium text-muted md:inline lg:text-base">
              {site.headerTagline}
            </span>
          </div>
        </div>

        {/* 데스크톱 네비 (md 이상) */}
        <nav
          className="hidden items-center gap-5 md:flex lg:gap-8 xl:gap-10"
          aria-label="주요 메뉴"
        >
          {site.nav.map((item) =>
            item.children ? (
              <DesktopDropdown
                key={item.label}
                item={item}
                isActive={isActive}
                parentActive={isParentActive(item)}
              />
            ) : (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={`whitespace-nowrap text-base font-medium transition-colors lg:text-xl xl:text-2xl ${
                  isActive(item.href)
                    ? "font-semibold text-accent"
                    : "text-muted hover:text-ink"
                }`}
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>

        {/* 우측: 모바일 빠른 메뉴 + CTA(데스크톱만) + 모바일 햄버거 */}
        <div className="flex shrink-0 items-center gap-2">
          {/* 모바일 전용 — 학교별/지역별(짧게) + 무료상담 (햄버거 옆) */}
          <div className="flex items-center gap-1.5 md:hidden">
            {mobileQuick.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeAll}
                aria-current={isActive(item.href) ? "page" : undefined}
                className="whitespace-nowrap rounded-full border border-accent/40 px-2.5 py-1.5 text-sm font-semibold text-ink transition-colors hover:border-accent hover:text-accent"
              >
                {item.label.replace(/\s*과외$/, "")}
              </Link>
            ))}
            <Link
              href={site.cta.href}
              onClick={closeAll}
              className="whitespace-nowrap rounded-full bg-accent px-2.5 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-accent-dark"
            >
              무료상담
            </Link>
          </div>

          {/* CTA — Hero 안 무료상담 버튼과 중복이라 모바일에선 숨김 */}
          <div className="hidden md:block">
            <CTAButton
              href={site.cta.href}
              size="lg"
              className="px-5 text-base lg:px-6 lg:text-xl lg:min-h-14 xl:text-2xl"
            >
              {site.cta.label}
            </CTAButton>
          </div>

          {/* 햄버거 (모바일 전용) */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
            className="inline-flex h-12 w-12 items-center justify-center rounded-lg text-ink transition-colors hover:bg-surface-alt md:hidden"
          >
            {open ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* 모바일 네비 패널 */}
      {open && (
        <nav
          id="mobile-nav"
          aria-label="주요 메뉴"
          className="border-t border-line bg-white md:hidden"
        >
          <ul className="mx-auto max-w-6xl px-4 py-2 sm:px-6">
            {site.nav.map((item) =>
              item.children ? (
                <li key={item.label}>
                  {/* 아코디언 트리거 */}
                  <button
                    type="button"
                    onClick={() =>
                      setMobileSub((v) => (v === item.label ? null : item.label))
                    }
                    aria-expanded={mobileSub === item.label}
                    className={`flex w-full items-center justify-between rounded-lg px-2 py-3 text-base font-medium transition-colors hover:bg-surface-alt ${
                      isParentActive(item) ? "font-semibold text-accent" : "text-ink"
                    }`}
                  >
                    {item.label}
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                      className={`transition-transform ${mobileSub === item.label ? "rotate-180" : ""}`}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                  {/* 하위 항목 */}
                  {mobileSub === item.label && (
                    <ul className="mb-1 ml-2 border-l border-line pl-2">
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            onClick={closeAll}
                            aria-current={isActive(child.href) ? "page" : undefined}
                            className={`block rounded-lg px-2 py-2.5 text-base transition-colors hover:bg-surface-alt ${
                              isActive(child.href)
                                ? "font-semibold text-accent"
                                : "text-muted"
                            }`}
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ) : (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={closeAll}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className={`block rounded-lg px-2 py-3 text-base font-medium transition-colors hover:bg-surface-alt ${
                      isActive(item.href) ? "font-semibold text-accent" : "text-ink"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ),
            )}
          </ul>
        </nav>
      )}
    </header>
  );
}

/** 데스크톱 드롭다운 — 호버/포커스로 열고, 클릭 토글·Esc 닫기. children 은 실제 페이지 링크. */
function DesktopDropdown({
  item,
  isActive,
  parentActive,
}: {
  item: NavItem;
  isActive: (href: string) => boolean;
  parentActive: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
        }}
        className={`inline-flex items-center gap-1 whitespace-nowrap text-base font-medium transition-colors lg:text-xl xl:text-2xl ${
          parentActive ? "font-semibold text-accent" : "text-muted hover:text-ink"
        }`}
      >
        {item.label}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-1/2 top-full z-50 -translate-x-1/2 pt-3">
          <ul
            role="menu"
            className="min-w-44 rounded-xl border border-line bg-white p-2 shadow-lg"
          >
            {item.children!.map((child) => (
              <li key={child.href} role="none">
                <Link
                  role="menuitem"
                  href={child.href}
                  onClick={() => setOpen(false)}
                  aria-current={isActive(child.href) ? "page" : undefined}
                  className={`block whitespace-nowrap rounded-lg px-3 py-2 text-base font-medium transition-colors hover:bg-surface-alt lg:text-lg ${
                    isActive(child.href) ? "text-accent" : "text-ink"
                  }`}
                >
                  {child.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
