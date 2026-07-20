"use client";

import type { RegionSubjectTab } from "@/data/regionSubjectTabs";

/*
 * RegionSubjectTabs — 지역 상세의 과목 탭(시군구 칩과 동일한 스타일의 가로 스크롤 칩 바).
 *
 * 선택 과목에 따라 상위에서 동 버튼 링크를 지역×과목 페이지로 교체한다.
 * 색: 선택=코랄(accent) 채움 + 흰 글자. 보라 토큰 미사용(메인 경로 규칙).
 * 칩 목록 자체의 내부 가로 스크롤만 허용(페이지 가로 스크롤 없음).
 */
export default function RegionSubjectTabs({
  subjects,
  active,
  onSelect,
  ariaLabel = "과목 선택",
}: {
  subjects: RegionSubjectTab[];
  /** null = 전체(기본). 그 외 = 과목 slug. */
  active: string | null;
  onSelect: (slug: string | null) => void;
  ariaLabel?: string;
}) {
  const chipClass = (selected: boolean) =>
    `shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
      selected
        ? "bg-accent text-white"
        : "border border-accent/30 bg-white text-muted hover:border-accent hover:text-accent"
    }`;

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="flex flex-nowrap gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      style={{ touchAction: "pan-x" }}
    >
      <button
        type="button"
        role="tab"
        aria-selected={active === null}
        onClick={() => onSelect(null)}
        className={chipClass(active === null)}
      >
        전체
      </button>
      {subjects.map((s) => (
        <button
          key={s.slug}
          type="button"
          role="tab"
          aria-selected={active === s.slug}
          onClick={() => onSelect(s.slug)}
          className={chipClass(active === s.slug)}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
