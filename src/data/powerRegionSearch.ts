/**
 * /power/regions 클라이언트 검색 인덱스(경량) — 시군구 253 + 확장 동 + 신도시 지명.
 *
 * 초기 번들에 넣지 않고 정적 라우트(/power/regions/search-index)로 지연 로드한다
 * (푸터 원칙 — 풀 데이터 클라이언트 유입 금지). 지역명·slug·시도만 담는다.
 *
 * 압축 포맷: { sidos: string[], items: [name, sidoIdx] | [name, sidoIdx, slug] }.
 *   slug 는 name 과 다를 때만(접미 표기 등) 셋째 원소로 담아 용량을 줄인다.
 */
import {
  powerRegionIndexGroups,
  powerExpansionRegions,
} from "@/data/powerRegionsExpansion";
import { powerDistricts } from "@/data/powerDistricts";
import { regions } from "@/data/regions";

/** regions.ts province(약칭) → 정식 시도명(기존 인덱스 sidos 라벨과 정합). */
const SIDO_FULL: Record<string, string> = {
  경기: "경기도",
  서울: "서울특별시",
  부산: "부산광역시",
  대구: "대구광역시",
  인천: "인천광역시",
  광주: "광주광역시",
  대전: "대전광역시",
  울산: "울산광역시",
  세종: "세종특별자치시",
};

export type SearchItem =
  | readonly [string, number]
  | readonly [string, number, string];

export interface PowerRegionSearchIndex {
  sidos: string[];
  items: SearchItem[];
}

export function buildPowerRegionSearchIndex(): PowerRegionSearchIndex {
  const sidos: string[] = [];
  const sidoIdx = (label: string): number => {
    let i = sidos.indexOf(label);
    if (i === -1) {
      i = sidos.length;
      sidos.push(label);
    }
    return i;
  };

  const items: SearchItem[] = [];
  const seen = new Set<string>();
  const add = (name: string, slug: string, sido: string) => {
    if (seen.has(slug)) return;
    seen.add(slug);
    const gi = sidoIdx(sido);
    items.push(name === slug ? ([name, gi] as const) : ([name, gi, slug] as const));
  };

  // 시군구 253(허브 slug)
  for (const g of powerRegionIndexGroups()) {
    for (const sg of g.sigungu) add(sg.name, sg.slug, g.sidoLabel);
  }
  // 확장 동
  for (const r of powerExpansionRegions) {
    if (r.level === "dong") add(r.name, r.slug, r.sidoLabel);
  }
  // 신도시 지명
  for (const d of powerDistricts) add(d.name, d.slug, d.sidoLabel);

  // 963(isKnownPowerRegion) 동 전량 — regions.ts. 검색 인덱스 누락(수내동 등) 해소.
  //   과목 페이지(isByRegionAllowed=isKnownPowerRegion 포함)가 유효하므로 링크 죽지 않는다.
  //   name===slug(한글) 이라 dedup(seen by slug)으로 기존 시군구/확장/신도시와 중복 자동 제거.
  for (const r of regions) {
    const sido = SIDO_FULL[r.province] ?? r.province;
    if (r.dongs && r.dongs.length > 0) {
      for (const dong of r.dongs) add(dong, dong, sido);
    } else {
      add(r.name, r.name, sido);
    }
  }

  return { sidos, items };
}
