"use client";

import type { RegionSubjectTab } from "@/data/regionSubjectTabs";

/*
 * RegionSubjectTabs — 지역 상세의 과목 선택 섹션(사이트 기존 과목 필터 칩 SubjectChips 와 통일).
 *
 * "과목 선택" 라벨(작은 회색, 중앙) + 중앙 정렬 칩 목록(모바일 줄바꿈 wrap).
 * 토글: 선택 없음이 기본(전체 동작). 칩 클릭 → 선택, 선택된 칩 재클릭 → 해제(전체 복귀).
 * 선택 과목에 따라 상위에서 동 버튼 링크를 지역×과목 페이지로 교체한다.
 * 색: 선택=코랄(accent) 채움 + 흰 글자, 비선택=흰 배경 + 연한 코랄 테두리 + 진한 글자.
 * 보라 토큰 미사용(메인 경로 규칙). 페이지 가로 스크롤 없음(wrap).
 */
export default function RegionSubjectTabs({
  subjects,
  active,
  onSelect,
}: {
  subjects: RegionSubjectTab[];
  /** null = 선택 없음(전체 동작, 기본). 그 외 = 과목 slug. */
  active: string | null;
  onSelect: (slug: string | null) => void;
}) {
  return (
    <div className="text-center">
      <p className="text-sm font-semibold text-muted">과목 선택</p>
      <ul className="mt-3 flex flex-wrap justify-center gap-2">
        {subjects.map((s) => {
          const selected = active === s.slug;
          return (
            <li key={s.slug}>
              <button
                type="button"
                aria-pressed={selected}
                // 토글 — 선택된 칩을 다시 누르면 해제(전체 상태로 복귀).
                onClick={() => onSelect(selected ? null : s.slug)}
                className={`inline-flex min-h-10 items-center rounded-full px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:text-base ${
                  selected
                    ? "bg-accent text-white"
                    : "border border-accent/30 bg-white text-ink hover:border-accent hover:text-accent"
                }`}
              >
                {s.label}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
