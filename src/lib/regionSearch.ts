import { REGIONS } from "@/data/sidoRegions";
import { dongHref } from "@/data/dongPageCopy";

/*
 * 전국 통합 지역 검색 인덱스 — sidoRegions.ts(REGIONS)에서 파생한 순수 함수.
 * 시/도 label · 시군구 name · 동 name 을 평탄화해 부분일치 검색에 사용.
 * 목적지: 동→dongHref(동 허브) / 시군구→시/도 페이지 #sg-{slug}(동 브라우저 탭 활성) / 시/도→시/도 페이지.
 * 하드코딩 없음. 라우팅 규칙은 기존 dongHref·[sido] 해시 동선을 재사용.
 */

export type RegionKind = "dong" | "sigungu" | "sido";

export interface RegionSearchItem {
  kind: RegionKind;
  label: string; // 매칭 대상 + 결과의 주요 표시 텍스트
  sub: string; // 보조 표시(시군구 · 시/도 등)
  href: string;
  key: string;
}

/** REGIONS 전체를 평탄화한 검색 인덱스(약 6천+ 항목). 컴포넌트에서 useMemo 로 1회 생성. */
export function buildRegionSearchIndex(): RegionSearchItem[] {
  const items: RegionSearchItem[] = [];
  for (const sido of REGIONS) {
    items.push({
      kind: "sido",
      label: sido.label,
      sub: "시·도",
      href: `/tutoring/by-region/${sido.slug}`,
      key: `sido:${sido.slug}`,
    });
    for (const sg of sido.sigungu) {
      items.push({
        kind: "sigungu",
        label: sg.name,
        sub: sido.label,
        // 시/도 페이지로 이동하며 해당 시군구 탭 활성(RegionDongBrowser 가 #sg- 해시 수신)
        href: `/tutoring/by-region/${sido.slug}#sg-${sg.slug}`,
        key: `sg:${sido.slug}:${sg.slug}`,
      });
      for (const d of sg.dong) {
        items.push({
          kind: "dong",
          label: d.name,
          sub: `${sg.name} · ${sido.label}`,
          href: dongHref(sido.slug, sg.slug, d.slug),
          key: `d:${sido.slug}:${sg.slug}:${d.slug}`,
        });
      }
    }
  }
  return items;
}

/**
 * 부분일치 검색. 시작 일치 > 포함, 짧은 라벨 우선, 종류(동>시군구>시도) 가중.
 * limit 개까지 반환. 전체 스캔(수천 항목)이라 입력 디바운스와 함께 쓴다.
 */
export function searchRegions<T extends { label: string; kind: string }>(
  index: T[],
  rawQuery: string,
  limit = 8,
): T[] {
  const q = rawQuery.trim();
  if (!q) return [];
  const matches: { item: T; score: number }[] = [];
  for (const item of index) {
    const at = item.label.indexOf(q);
    if (at < 0) continue;
    const kindBias = item.kind === "dong" ? 0 : item.kind === "sigungu" ? 1 : 2;
    // 점수 낮을수록 상위: 시작 일치(0) vs 중간 포함(100) + 라벨 길이 + 종류 가중
    const score = (at === 0 ? 0 : 100) + item.label.length + kindBias * 3;
    matches.push({ item, score });
  }
  matches.sort((a, b) => a.score - b.score || a.item.label.localeCompare(b.item.label, "ko"));
  return matches.slice(0, limit).map((m) => m.item);
}
