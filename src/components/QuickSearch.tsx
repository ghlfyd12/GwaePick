"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { searchRegions } from "@/lib/regionSearch";
import {
  buildHeroIndex,
  KIND_TAG,
  type HeroSearchKind,
  type HeroSearchItem,
} from "@/lib/heroSearch";

/*
 * QuickSearch — 히어로 공통 빠른 검색(지역/학교/과목). 클라이언트 전용(추가 API 없음).
 * searchKind 로 인덱스 소스만 교체, 매칭/디바운스/키보드/드롭다운은 공통.
 * 인덱스 useMemo 1회 생성, 입력 150ms 디바운스 + 결과 8개. ↑/↓ 이동·Enter 선택·Esc 닫기.
 */
export default function QuickSearch({
  kind,
  label,
  placeholder,
  emptyMessage = "검색 결과가 없습니다",
}: {
  kind: HeroSearchKind;
  label: string;
  placeholder: string;
  emptyMessage?: string;
}) {
  const router = useRouter();
  const index = useMemo(() => buildHeroIndex(kind), [kind]);

  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  const rootRef = useRef<HTMLDivElement>(null);
  const uid = useId();
  const inputId = `${uid}-input`;
  const listId = `${uid}-list`;
  const optId = (i: number) => `${uid}-opt-${i}`;

  // 입력 150ms 디바운스
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 150);
    return () => clearTimeout(t);
  }, [query]);

  const results = useMemo(
    () => searchRegions(index, debounced, 8),
    [index, debounced],
  );

  // 바깥 클릭 시 닫기
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const hasQuery = query.trim().length > 0;
  const showDropdown = open && hasQuery;

  const go = (item: HeroSearchItem) => {
    setOpen(false);
    setQuery("");
    router.push(item.href);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if (!showDropdown || results.length === 0) {
      if (e.key === "ArrowDown") setOpen(true);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i <= 0 ? results.length - 1 : i - 1));
    } else if (e.key === "Enter") {
      if (active >= 0 && active < results.length) {
        e.preventDefault();
        go(results[active]);
      }
    }
  };

  return (
    <div ref={rootRef} className="relative mx-auto mt-6 max-w-md md:mx-0">
      <label
        htmlFor={inputId}
        className="mb-1.5 block text-left text-sm font-semibold text-ink"
      >
        {label}
      </label>
      <input
        id={inputId}
        type="text"
        role="combobox"
        aria-expanded={showDropdown}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={active >= 0 ? optId(active) : undefined}
        autoComplete="off"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setActive(-1); // 입력 바뀌면 키보드 활성 항목 리셋
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className="min-h-12 w-full rounded-xl border border-line bg-white px-4 text-base text-ink shadow-sm placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
      />

      {showDropdown && (
        <ul
          id={listId}
          role="listbox"
          aria-label={`${label} 결과`}
          className="absolute z-30 mt-2 max-h-80 w-full overflow-y-auto rounded-xl border border-line bg-white py-1 text-left shadow-lg"
        >
          {results.length === 0 ? (
            <li className="break-keep px-4 py-3 text-sm text-muted">
              {emptyMessage}
            </li>
          ) : (
            results.map((item, i) => (
              <li
                key={item.key}
                id={optId(i)}
                role="option"
                aria-selected={i === active}
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => setActive(i)}
                onClick={() => go(item)}
                className={`flex cursor-pointer items-center justify-between gap-3 px-4 py-2.5 ${
                  i === active ? "bg-accent/10" : ""
                }`}
              >
                <span className="min-w-0">
                  <span className="block truncate text-base font-semibold text-ink">
                    {item.label}
                  </span>
                  <span className="block truncate text-xs text-muted">
                    {item.sub}
                  </span>
                </span>
                {KIND_TAG[item.kind] && (
                  <span className="shrink-0 rounded-full bg-surface-alt px-2 py-0.5 text-[11px] font-semibold text-muted">
                    {KIND_TAG[item.kind]}
                  </span>
                )}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
