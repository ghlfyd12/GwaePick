"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { allDongOf, type Sido } from "@/data/sidoRegions";

/*
 * RegionDongBrowser — 시/도의 동(洞) 탐색 UI.
 *
 * 시군구 "탭"(맨 앞 전체보기) + 동 그리드. 모두 가나다순. 클라이언트 상태 전환(URL 미변경).
 * 동 클릭 → dongHref(/#consult?sido&sigungu&dong). 데이터는 sidoRegions.ts 에서만.
 * 색: 선택 탭=브랜드 주황(accent) 채움(보라 토큰 미사용 — CLAUDE.md 규칙). 모바일 우선.
 */

/** 동 링크 생성(추후 pSEO 상세로 교체하기 쉽게 한 함수로 분리). */
export function dongHref(sidoSlug: string, sigunguSlug: string, dongSlug: string) {
  return `/#consult?sido=${sidoSlug}&sigungu=${sigunguSlug}&dong=${dongSlug}`;
}

export default function RegionDongBrowser({ sido }: { sido: Sido }) {
  // null = 전체보기(기본), 그 외 = 시군구 slug
  const [active, setActive] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  // 시군구 탭(방어적 가나다 재정렬)
  const sigungu = useMemo(
    () => [...sido.sigungu].sort((a, b) => a.name.localeCompare(b.name, "ko")),
    [sido],
  );

  // 현재 탭의 동 목록(가나다)
  const items = useMemo(() => {
    if (active === null) {
      return allDongOf(sido.slug); // {name, slug, sigungu, sigunguSlug}
    }
    const sg = sigungu.find((s) => s.slug === active);
    return [...(sg?.dong ?? [])]
      .sort((a, b) => a.name.localeCompare(b.name, "ko"))
      .map((d) => ({ ...d, sigungu: sg!.name, sigunguSlug: sg!.slug }));
  }, [active, sigungu, sido.slug]);

  // 이름 부분일치 필터(현재 탭 범위 안)
  const q = query.trim();
  const filtered = q ? items.filter((d) => d.name.includes(q)) : items;

  const tabClass = (selected: boolean) =>
    `shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
      selected
        ? "bg-accent text-white"
        : "border border-accent/30 bg-white text-muted hover:border-accent hover:text-accent"
    }`;

  return (
    <div>
      {/* 동 이름 필터 */}
      <div className="mx-auto mb-4 max-w-md">
        <label htmlFor="dong-filter" className="sr-only">
          동 이름 검색
        </label>
        <input
          id="dong-filter"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="동 이름으로 찾기"
          className="min-h-12 w-full rounded-xl border border-line bg-white px-4 text-base text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
        />
      </div>

      {/* 시군구 탭 바 — 가로 스크롤(스크롤바 숨김) */}
      <div
        role="tablist"
        aria-label={`${sido.label} 시군구`}
        className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <button
          type="button"
          role="tab"
          aria-selected={active === null}
          onClick={() => setActive(null)}
          className={tabClass(active === null)}
        >
          전체보기
        </button>
        {sigungu.map((sg) => (
          <button
            key={sg.slug}
            type="button"
            role="tab"
            aria-selected={active === sg.slug}
            onClick={() => setActive(sg.slug)}
            className={tabClass(active === sg.slug)}
          >
            {sg.name}
          </button>
        ))}
      </div>

      {/* 동 그리드 */}
      <p className="mt-5 text-sm text-muted" aria-live="polite">
        총 {filtered.length.toLocaleString("ko-KR")}개 동
      </p>
      {filtered.length === 0 ? (
        <p className="mt-6 break-keep text-center text-muted">
          “{q}” 으로 찾은 동이 없습니다. 바로 상담받으시면 동네에 맞춰 연결해
          드립니다.
        </p>
      ) : (
        <ul className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((d) => (
            <li key={`${d.sigunguSlug}-${d.slug}`}>
              <Link
                href={dongHref(sido.slug, d.sigunguSlug, d.slug)}
                className="flex h-full flex-col items-center justify-center rounded-xl border border-line bg-white px-3 py-3 text-center transition-colors hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <span className="break-keep text-sm font-semibold text-ink">
                  {d.name}
                </span>
                {active === null && (
                  <span className="mt-0.5 break-keep text-xs text-muted">
                    {d.sigungu}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
