"use client";

import { useState } from "react";
import Link from "next/link";
import CTAButton from "@/components/ui/CTAButton";
import { site } from "@/data/site";

/*
 * 상단 고정 헤더.
 * - sticky 로 스크롤해도 상단에 고정, 흰 배경 + 옅은 하단 보더
 * - 좌측: 브랜드 로고(site.name) / 우측: 무료 상담 신청 CTA(항상 노출, 크게)
 * - 네비(site.nav, 6개): 데스크톱은 가로 정렬, 모바일은 햄버거 토글 → 세로 리스트
 *
 * 데이터(브랜드명·네비·CTA)는 src/data/site.ts 단일 소스에서 가져온다.
 */
export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-line bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-2 sm:gap-3 sm:px-3 md:h-20 lg:h-24 lg:gap-4">
        {/* 브랜드 로고 — 좌측 끝(여백 최소) + 데스크톱에서 약 2배 확대 */}
        <Link
          href="/"
          className="shrink-0 text-2xl font-bold text-accent md:text-3xl lg:text-4xl xl:text-5xl"
          onClick={() => setOpen(false)}
        >
          {site.name}
        </Link>

        {/* 데스크톱 네비 (md 이상) — 가운데, 데스크톱에서 약 2배 확대(한 줄 유지 우선) */}
        <nav
          className="hidden items-center gap-5 md:flex lg:gap-8 xl:gap-10"
          aria-label="주요 메뉴"
        >
          {site.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap text-base font-medium text-muted transition-colors hover:text-ink lg:text-xl xl:text-2xl"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* 우측: CTA + 모바일 햄버거 */}
        <div className="flex shrink-0 items-center gap-2">
          {/* CTA — 우측 끝 + 텍스트만 약 2배(코랄 알약 유지, 패딩 과확대 금지) */}
          <CTAButton
            href={site.cta.href}
            size="lg"
            className="px-5 text-base lg:px-6 lg:text-xl lg:min-h-14 xl:text-2xl"
          >
            {site.cta.label}
          </CTAButton>

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
              // X 아이콘
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            ) : (
              // 햄버거 아이콘
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* 모바일 네비 패널 (열렸을 때만, md 미만) */}
      {open && (
        <nav
          id="mobile-nav"
          aria-label="주요 메뉴"
          className="border-t border-line bg-white md:hidden"
        >
          <ul className="mx-auto max-w-6xl px-4 py-2 sm:px-6">
            {site.nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-2 py-3 text-base font-medium text-ink transition-colors hover:bg-surface-alt"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
