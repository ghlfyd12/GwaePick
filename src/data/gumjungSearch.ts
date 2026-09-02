/**
 * 검고의참견 /gumjung/regions 지역 탐색 데이터 — 253 시군구(examRegions 재사용) 파생.
 *
 * 지역 페이지는 과목 차원이 없어(지역당 1장), 어학 검색보다 단순하다. 시군구 253만 담는다.
 * 압축 포맷은 어학과 동일: { sidos: string[], items: [name, sidoIdx] | [name, sidoIdx, slug] }.
 */
import { examRegions } from "@/data/byRegionExam";

export interface GumjungSearchIndex {
  sidos: string[];
  items: (readonly [string, number] | readonly [string, number, string])[];
}

export interface GumjungSigunguGroup {
  sidoLabel: string;
  sigungu: { name: string; slug: string }[];
}

/** 시도 정식명 → 짧은 표기(칩 라벨용). */
function shortSido(label: string): string {
  return label.replace(/특별자치도|특별자치시|특별시|광역시|도$/u, "") || label;
}

/** 시도별 시군구 그룹(examRegions 등장 순서 유지). SSR 목록·아코디언용. */
export function gumjungRegionGroups(): GumjungSigunguGroup[] {
  const groups: GumjungSigunguGroup[] = [];
  const idx = new Map<string, number>();
  for (const r of examRegions) {
    let i = idx.get(r.sidoLabel);
    if (i === undefined) {
      i = groups.length;
      idx.set(r.sidoLabel, i);
      groups.push({ sidoLabel: r.sidoLabel, sigungu: [] });
    }
    groups[i].sigungu.push({ name: r.name, slug: r.slug });
  }
  return groups;
}

/** 시도 필터 칩 — {label(짧게), full(정식명)}. */
export function gumjungSidoChips(): { label: string; full: string }[] {
  const seen = new Set<string>();
  const chips: { label: string; full: string }[] = [];
  for (const r of examRegions) {
    if (seen.has(r.sidoLabel)) continue;
    seen.add(r.sidoLabel);
    chips.push({ label: shortSido(r.sidoLabel), full: r.sidoLabel });
  }
  return chips;
}

/** 경량 검색 인덱스(정적 라우트로 지연 로드). 시군구 253만. */
export function buildGumjungRegionSearchIndex(): GumjungSearchIndex {
  const sidos: string[] = [];
  const sidoIdx = (label: string): number => {
    let i = sidos.indexOf(label);
    if (i === -1) {
      i = sidos.length;
      sidos.push(label);
    }
    return i;
  };
  const items: GumjungSearchIndex["items"] = [];
  for (const r of examRegions) {
    const gi = sidoIdx(r.sidoLabel);
    items.push(r.name === r.slug ? ([r.name, gi] as const) : ([r.name, gi, r.slug] as const));
  }
  return { sidos, items };
}
