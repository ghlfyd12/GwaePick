"use client";

import {
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import Link from "next/link";
import type { SchoolSido, SchoolLevel } from "@/data/schools";
import { schoolHref } from "@/lib/schoolHref";

/*
 * SchoolBrowser — 시/도의 학교 탐색 UI(지역 RegionDongBrowser 와 동일 패턴, 지도 없음).
 *
 * 시군구 "탭"(맨 앞 전체보기) + 학교급(초·중·고) 필터 + 학교 그리드(가나다) + 학교명 검색.
 * 전체보기는 처음 24개 + "학교 더보기"로 24개씩. 학교 클릭 → schoolHref(상담 컨텍스트).
 * 데이터는 prop(sido)만 사용 — schools.ts(730KB)는 서버에서 추출해 이 시/도분만 전달(타입만 import).
 */

const INITIAL_COUNT = 24;
const STEP = 24;

// 필터 버튼용 라벨(LEVEL_LABEL 과 동일) + 카드 배지용 짧은 라벨. (데이터 import 없이 로컬)
const LEVELS: { key: "all" | SchoolLevel; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "elem", label: "초등학교" },
  { key: "middle", label: "중학교" },
  { key: "high", label: "고등학교" },
];
const BADGE: Record<SchoolLevel, string> = { elem: "초", middle: "중", high: "고" };

export default function SchoolBrowser({ sido }: { sido: SchoolSido }) {
  const [active, setActive] = useState<string | null>(null); // null = 전체보기
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState<"all" | SchoolLevel>("all");
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);

  // 탭 바 가로 스와이프(데스크톱 드래그). 터치는 네이티브 스크롤.
  const tabBarRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ active: false, startX: 0, startScroll: 0 });
  const draggedRef = useRef(false);

  const onTabPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch") return;
    const el = tabBarRef.current;
    if (!el) return;
    dragRef.current = { active: true, startX: e.clientX, startScroll: el.scrollLeft };
    draggedRef.current = false;
  };
  const onTabPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active || !tabBarRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    if (Math.abs(dx) > 5) draggedRef.current = true;
    tabBarRef.current.scrollLeft = dragRef.current.startScroll - dx;
  };
  const endTabDrag = () => {
    dragRef.current.active = false;
  };
  const selectTab = (slug: string | null, e: ReactMouseEvent<HTMLButtonElement>) => {
    if (draggedRef.current) {
      draggedRef.current = false;
      return;
    }
    setActive(slug);
    setVisibleCount(INITIAL_COUNT);
    e.currentTarget.scrollIntoView({ inline: "center", behavior: "smooth", block: "nearest" });
  };

  // 시군구 탭(가나다)
  const sigungu = useMemo(
    () => [...sido.sigungu].sort((a, b) => a.name.localeCompare(b.name, "ko")),
    [sido],
  );

  // 현재 탭의 학교(가나다, 시군구 라벨 동반)
  const items = useMemo(() => {
    if (active === null) {
      return sigungu
        .flatMap((sg) =>
          sg.schools.map((s) => ({ ...s, sigungu: sg.name, sigunguSlug: sg.slug })),
        )
        .sort((a, b) => a.name.localeCompare(b.name, "ko"));
    }
    const sg = sigungu.find((s) => s.slug === active);
    return [...(sg?.schools ?? [])]
      .sort((a, b) => a.name.localeCompare(b.name, "ko"))
      .map((s) => ({ ...s, sigungu: sg!.name, sigunguSlug: sg!.slug }));
  }, [active, sigungu]);

  // 학교급 필터 + 이름 검색
  const q = query.trim();
  const filtered = items
    .filter((s) => level === "all" || s.level === level)
    .filter((s) => (q ? s.name.includes(q) : true));

  // 노출 제한: 전체보기 + 검색 없을 때만(시군구 탭은 전체 표시)
  const limited = active === null && !q;
  const visible = limited ? filtered.slice(0, visibleCount) : filtered;
  const hasMore = limited && visibleCount < filtered.length;

  const tabClass = (selected: boolean) =>
    `shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
      selected
        ? "bg-accent text-white"
        : "border border-accent/30 bg-white text-muted hover:border-accent hover:text-accent"
    }`;

  return (
    <div>
      {/* 학교 이름 검색 */}
      <div className="mx-auto mb-4 max-w-md">
        <label htmlFor="school-filter" className="sr-only">
          학교 이름 검색
        </label>
        <input
          id="school-filter"
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setVisibleCount(INITIAL_COUNT);
          }}
          placeholder="학교 이름으로 찾기"
          className="min-h-12 w-full rounded-xl border border-line bg-white px-4 text-base text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
        />
      </div>

      {/* 시군구 탭 바 — 가로 스와이프, 줄바꿈 금지, 스크롤바 숨김 */}
      <div className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-6 bg-gradient-to-r from-white to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-6 bg-gradient-to-l from-white to-transparent"
        />
        <div
          ref={tabBarRef}
          role="tablist"
          aria-label={`${sido.label} 시군구`}
          onPointerDown={onTabPointerDown}
          onPointerMove={onTabPointerMove}
          onPointerUp={endTabDrag}
          onPointerLeave={endTabDrag}
          className="flex flex-nowrap cursor-grab select-none gap-2 overflow-x-auto scroll-smooth pb-1 active:cursor-grabbing [-ms-overflow-style:none] [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{ touchAction: "pan-x" }}
        >
          <button
            type="button"
            role="tab"
            aria-selected={active === null}
            onClick={(e) => selectTab(null, e)}
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
              onClick={(e) => selectTab(sg.slug, e)}
              className={tabClass(active === sg.slug)}
            >
              {sg.name}
            </button>
          ))}
        </div>
      </div>

      {/* 학교급 필터 */}
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {LEVELS.map((lv) => {
          const on = level === lv.key;
          return (
            <button
              key={lv.key}
              type="button"
              aria-pressed={on}
              onClick={() => {
                setLevel(lv.key);
                setVisibleCount(INITIAL_COUNT);
              }}
              className={`min-h-9 rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                on
                  ? "bg-primary text-white"
                  : "border border-line bg-white text-muted hover:border-primary hover:text-ink"
              }`}
            >
              {lv.label}
            </button>
          );
        })}
      </div>

      {/* 학교 그리드 */}
      <p className="mt-5 text-sm text-muted" aria-live="polite">
        총 {filtered.length.toLocaleString("ko-KR")}개 학교
      </p>
      {filtered.length === 0 ? (
        <p className="mt-6 break-keep text-center text-muted">
          {q ? `“${q}” 으로 찾은 학교가 없습니다. ` : "해당 조건의 학교가 없습니다. "}
          바로 상담받으시면 학교에 맞춰 안내해 드립니다.
        </p>
      ) : (
        <>
          <ul className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
            {visible.map((s) => (
              <li key={`${s.sigunguSlug}-${s.slug}`}>
                <Link
                  href={schoolHref(sido.slug, s.sigunguSlug, s)}
                  className="flex h-full flex-col items-center justify-center gap-1 rounded-xl border border-line bg-white px-3 py-3 text-center transition-colors hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  <span className="flex items-center gap-1.5">
                    <span aria-hidden className="rounded-full bg-accent/10 px-1.5 py-0.5 text-[11px] font-bold text-accent">
                      {BADGE[s.level]}
                    </span>
                    <span className="break-keep text-sm font-semibold text-ink">{s.name}</span>
                  </span>
                  {active === null && (
                    <span className="break-keep text-xs text-muted">{s.sigungu}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>

          {hasMore && (
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setVisibleCount((c) => c + STEP)}
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-accent/40 bg-white px-6 py-2.5 text-sm font-semibold text-accent transition-colors hover:bg-accent/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:text-base"
              >
                학교 더보기
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
