"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type {
  GumjungSearchIndex,
  GumjungSigunguGroup,
} from "@/data/gumjungSearch";

/*
 * GumjungRegionsBrowser — /gumjung/regions 지역 탐색 UI(클라이언트).
 *
 * 검정고시 지역 페이지는 과목 차원이 없어(지역당 1장), PowerRegionsBrowser 를 단순화한 변형이다.
 * 검색 + 시도 필터 칩 + 시군구 253 아코디언. 각 시군구는 /gumjung/by-region/{slug} 로 링크.
 * SEO: 서버에서 초기 렌더 — 253 링크가 초기 HTML 에 포함(접힘 아코디언, DOM 유지). 색은 accent(청록).
 */

const SEARCH_INDEX_URL = "/gumjung/regions/search-index";
const MAX_RESULTS = 60;

export default function GumjungRegionsBrowser({
  sidoChips,
  sigunguGroups,
}: {
  sidoChips: { label: string; full: string }[];
  sigunguGroups: GumjungSigunguGroup[];
}) {
  const [sidoFilter, setSidoFilter] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState<GumjungSearchIndex | null>(null);
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (sidoFilter === null) {
      setOpenMap({});
      return;
    }
    setOpenMap({ [sidoFilter]: true });
  }, [sidoFilter]);

  const toggleOpen = (key: string, open: boolean) =>
    setOpenMap((m) => (m[key] === open ? m : { ...m, [key]: open }));

  const href = useCallback(
    (slug: string) => `/gumjung/by-region/${encodeURIComponent(slug)}`,
    [],
  );

  const loadIndex = useCallback(() => {
    if (index) return;
    fetch(SEARCH_INDEX_URL)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => data && setIndex(data as GumjungSearchIndex))
      .catch(() => {});
  }, [index]);

  const results = useMemo(() => {
    const q = query.trim();
    if (!q || !index) return [];
    const out: { name: string; slug: string; sido: string }[] = [];
    for (const it of index.items) {
      const name = it[0];
      if (!name.includes(q)) continue;
      const slug = (it[2] as string | undefined) ?? name;
      out.push({ name, slug, sido: index.sidos[it[1]] });
      if (out.length >= MAX_RESULTS) break;
    }
    return out;
  }, [query, index]);

  const showResults = query.trim().length > 0;
  const visibleSido = (label: string) => sidoFilter === null || sidoFilter === label;

  return (
    <div>
      {/* 1. 지역 검색창 */}
      <div className="relative mx-auto max-w-xl">
        <label htmlFor="gumjung-region-search" className="sr-only">
          지역 이름으로 찾기
        </label>
        <input
          id="gumjung-region-search"
          type="text"
          value={query}
          onFocus={loadIndex}
          onChange={(e) => {
            setQuery(e.target.value);
            loadIndex();
          }}
          placeholder="지역 이름으로 찾기 (예: 강남, 수원, 해운대)"
          autoComplete="off"
          className="min-h-12 w-full rounded-xl border border-line bg-white px-4 text-base text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
        />

        {showResults && (
          <div className="absolute left-0 right-0 top-full z-20 mt-2 max-h-80 overflow-y-auto rounded-xl border border-line bg-white p-2 shadow-lg">
            {index === null ? (
              <p className="px-3 py-4 text-center text-sm text-muted">불러오는 중…</p>
            ) : results.length === 0 ? (
              <p className="px-3 py-4 text-center text-sm text-muted">
                “{query.trim()}” 으로 찾은 지역이 없습니다. 상담으로 바로 연결해 드립니다.
              </p>
            ) : (
              <ul>
                {results.map((r) => (
                  <li key={r.slug}>
                    <Link
                      href={href(r.slug)}
                      className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-accent/5"
                    >
                      <span className="break-keep text-sm font-semibold text-ink">
                        {r.name}
                      </span>
                      <span className="shrink-0 break-keep text-xs text-muted">{r.sido}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* 2. 시도 필터 칩 */}
      <div
        role="tablist"
        aria-label="시도 필터"
        className="mt-6 flex flex-nowrap gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <button
          type="button"
          role="tab"
          aria-selected={sidoFilter === null}
          onClick={() => setSidoFilter(null)}
          className={chipClass(sidoFilter === null)}
        >
          전체보기
        </button>
        {sidoChips.map((s) => (
          <button
            key={s.full}
            type="button"
            role="tab"
            aria-selected={sidoFilter === s.full}
            onClick={(e) => {
              setSidoFilter(s.full);
              e.currentTarget.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
            }}
            className={chipClass(sidoFilter === s.full)}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* 3. 시군구 그룹(시도별) — 기본 접힘 아코디언. 링크는 접혀도 DOM 유지(SEO). */}
      <ul className="mt-10 space-y-3">
        {sigunguGroups.map((group) => (
          <li key={group.sidoLabel} hidden={!visibleSido(group.sidoLabel)}>
            <details
              className="group border-b border-line"
              open={!!openMap[group.sidoLabel]}
              onToggle={(e) => toggleOpen(group.sidoLabel, e.currentTarget.open)}
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-2 py-3 [&::-webkit-details-marker]:hidden">
                <span className="break-keep text-xl font-bold text-accent sm:text-2xl">
                  {group.sidoLabel}
                </span>
                <ChevronIcon />
              </summary>
              <ul className="flex flex-wrap gap-x-4 gap-y-2 pb-4">
                {group.sigungu.map((sg) => (
                  <li key={sg.slug}>
                    <Link
                      href={href(sg.slug)}
                      className="break-keep text-[13px] font-medium text-ink transition-colors hover:text-accent hover:underline sm:text-sm"
                    >
                      {sg.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </details>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ChevronIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="shrink-0 text-accent transition-transform group-open:rotate-180"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function chipClass(selected: boolean): string {
  return `shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
    selected
      ? "bg-accent text-white"
      : "border border-accent/30 bg-white text-muted hover:border-accent hover:text-accent"
  }`;
}
