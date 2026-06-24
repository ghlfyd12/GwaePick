"use client";

import { useState } from "react";
import Link from "next/link";

/*
 * SigunguGrid — 경기 시/군/구 링크 그리드(가나다 정렬 + 전체 보기 토글).
 *
 * 서버 컴포넌트(page)에서 sigungu({name, slug}) 배열을 props 로 받는다(데이터 원본 불변, 정렬은 복사본).
 * 기본은 VISIBLE_COUNT 개만 노출, "전체 보기"로 펼침. 링크 목적지·버튼 스타일은 기존 유지.
 * 정렬은 결정적이라 서버/클라 첫 렌더가 동일 → 하이드레이션 안전.
 */

type Item = { name: string; slug: string };

/** 기본 노출 개수(쉽게 조정). */
const VISIBLE_COUNT = 8;

export default function SigunguGrid({ sigungu }: { sigungu: Item[] }) {
  const [expanded, setExpanded] = useState(false);

  // 원본 불변 — 정렬된 복사본 사용(한글 가나다)
  const sorted = [...sigungu].sort((a, b) =>
    a.name.localeCompare(b.name, "ko-KR"),
  );
  const visible = expanded ? sorted : sorted.slice(0, VISIBLE_COUNT);
  const hasMore = sorted.length > VISIBLE_COUNT;

  return (
    <div className="mx-auto max-w-4xl">
      {/* 제목 + 개수 뱃지 */}
      <div className="mb-5 flex flex-wrap items-center justify-center gap-2">
        <span className="inline-flex items-center gap-1.5 text-lg font-bold text-ink">
          <PinIcon />
          경기도 시군구 선택
        </span>
        <span className="rounded-full bg-accent/10 px-3 py-1 text-sm font-semibold text-accent">
          {sorted.length}개 지역
        </span>
      </div>

      {/* 링크 그리드 */}
      <nav aria-label="경기 시·군·구 목록">
        <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4">
          {visible.map((sg) => (
            <li key={sg.slug}>
              <Link
                href={`/tutoring/by-region/gyeonggi/${sg.slug}`}
                className="block rounded-xl border border-line bg-white px-3 py-3 text-center text-sm font-semibold text-ink transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:text-base"
              >
                {sg.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* 전체 보기 / 접기 토글 */}
      {hasMore && (
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className="inline-flex min-h-12 items-center justify-center gap-1.5 rounded-full border border-line px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {expanded ? "접기" : "전체 보기"}
            <Chevron up={expanded} />
          </button>
        </div>
      )}
    </div>
  );
}

function PinIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="text-accent"
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function Chevron({ up }: { up: boolean }) {
  return (
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
      className={up ? "rotate-180" : ""}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
