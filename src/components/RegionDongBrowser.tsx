"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import Link from "next/link";
import { allDongOf, type Sido } from "@/data/sidoRegions";
import { dongHref } from "@/data/dongPageCopy";

/*
 * RegionDongBrowser — 시/도의 동(洞) 탐색 UI.
 *
 * 시군구 "탭"(맨 앞 전체보기) + 동 그리드. 모두 가나다순. 클라이언트 상태 전환(URL 미변경).
 * 동 클릭 → dongHref(과목 컨텍스트 없으면 동 허브). 데이터는 sidoRegions.ts 에서만.
 * 색: 선택 탭=브랜드 주황(accent) 채움(보라 토큰 미사용 — CLAUDE.md 규칙). 모바일 우선.
 */

// 전체보기 탭 초기 노출 개수 + 더보기 1회당 증가량(개별 시군구·검색 중엔 미적용).
const INITIAL_COUNT = 24;
const STEP = 24;

export default function RegionDongBrowser({ sido }: { sido: Sido }) {
  // null = 전체보기(기본), 그 외 = 시군구 slug
  const [active, setActive] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  // 전체보기 동 그리드 노출 개수(탭 전환·검색 변경 시 INITIAL_COUNT 로 리셋)
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);
  const rootRef = useRef<HTMLDivElement>(null);

  // 지도(RegionMap)에서 시군구 폴리곤 클릭 시 `#sg-{slug}` 앵커로 이동 → 해당 시군구 탭 활성 + 스크롤.
  useEffect(() => {
    const slugs = new Set(sido.sigungu.map((s) => s.slug));
    const applyHash = () => {
      const m = window.location.hash.match(/^#sg-(.+)$/);
      if (!m) return;
      const slug = decodeURIComponent(m[1]);
      if (!slugs.has(slug)) return;
      setActive(slug);
      setQuery("");
      setVisibleCount(INITIAL_COUNT);
      rootRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, [sido]);

  // 탭 바 가로 스와이프(데스크톱 드래그). 터치는 네이티브 스크롤 사용.
  const tabBarRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ active: false, startX: 0, startScroll: 0 });
  const draggedRef = useRef(false);

  const onTabPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch") return; // 터치는 네이티브 가로 스크롤
    const el = tabBarRef.current;
    if (!el) return;
    dragRef.current = { active: true, startX: e.clientX, startScroll: el.scrollLeft };
    draggedRef.current = false;
  };
  const onTabPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active || !tabBarRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    if (Math.abs(dx) > 5) draggedRef.current = true; // 임계값 — 살짝 끌면 클릭 유지
    tabBarRef.current.scrollLeft = dragRef.current.startScroll - dx;
  };
  const endTabDrag = () => {
    dragRef.current.active = false;
  };
  const selectTab = (
    slug: string | null,
    e: ReactMouseEvent<HTMLButtonElement>,
  ) => {
    if (draggedRef.current) {
      draggedRef.current = false;
      return; // 드래그였으면 탭 선택 무시
    }
    setActive(slug);
    setVisibleCount(INITIAL_COUNT); // 탭 전환 시 노출 개수 리셋
    // 선택 탭을 가운데로
    e.currentTarget.scrollIntoView({
      inline: "center",
      behavior: "smooth",
      block: "nearest",
    });
  };

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

  // 노출 개수 제한은 전체보기 탭 + 검색 없을 때만(개별 시군구는 동 수가 적어 전체 표시).
  const limited = active === null && !q;
  const visibleDongs = limited ? filtered.slice(0, visibleCount) : filtered;
  const hasMore = limited && visibleCount < filtered.length;

  const tabClass = (selected: boolean) =>
    `shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
      selected
        ? "bg-accent text-white"
        : "border border-accent/30 bg-white text-muted hover:border-accent hover:text-accent"
    }`;

  return (
    <div ref={rootRef} style={{ scrollMarginTop: "1.5rem" }}>
      {/* 동 이름 필터 */}
      <div className="mx-auto mb-4 max-w-md">
        <label htmlFor="dong-filter" className="sr-only">
          동 이름 검색
        </label>
        <input
          id="dong-filter"
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setVisibleCount(INITIAL_COUNT); // 검색어 변경 시 노출 개수 리셋
          }}
          placeholder="동 이름으로 찾기"
          className="min-h-12 w-full rounded-xl border border-line bg-white px-4 text-base text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
        />
      </div>

      {/* 시군구 탭 바 — 가로 스와이프/드래그, 줄바꿈 금지, 스크롤바 숨김 */}
      <div className="relative">
        {/* 양 끝 페이드 힌트(클릭 통과) */}
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
        <>
          <ul className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
            {visibleDongs.map((d) => (
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

          {/* 동 더보기 — 전체보기 탭에서 아직 안 보인 동이 남았을 때만(보조 스타일, CTA 와 구분). */}
          {hasMore && (
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setVisibleCount((c) => c + STEP)}
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-accent/40 bg-white px-6 py-2.5 text-sm font-semibold text-accent transition-colors hover:bg-accent/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:text-base"
              >
                동 더보기
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
