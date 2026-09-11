/**
 * 광역시 구·군 랜딩(/[region]) title·desc 용 자기 데이터 집계 — 순수 추가 모듈.
 *
 * 배경: 경쟁 문서가 title 에 실데이터 수치를 넣어 노출된다. 우리도 "고교 n곳·중학교 m곳" 처럼
 * **우리 사이트가 실제로 보유한 페이지 수**만 쓴다(외부 통계·임의 수치 금지).
 *
 * 원칙:
 *  - **원본 무수정**: regions.ts(자동 생성)·sidoRegions.ts·schools.ts·subjects.ts 를 건드리지 않고
 *    조회만 한다. 시군구 slug 불일치는 기존 schoolsInSigungu(내부에서 SIGUNGU_SLUG_MAP 경유)가 흡수.
 *  - **빌드 타임 1회**: 모듈 로드 시 Map 을 한 번 만들고 generateMetadata 는 조회만 한다(런타임 비용 0).
 *  - **광역시 6곳만**: 서울·경기는 관찰 후 확대 대상이라 의도적으로 제외한다(getRegionStats → null).
 *  - 학교급 수가 0 인 시군구는 null 을 돌려 호출부가 기존 카피로 폴백하게 한다(수치 0 노출 방지).
 *
 * 동 수는 집계하지 않는다 — sidoRegions 의 동 목록은 행정동·법정동·"n가" 가 섞여 있어
 * (부산 중구 50·대구 중구 68) 실제 생활권 수보다 크게 부풀고, title 수치로 쓰면 과장이 된다.
 */
import { regions } from "@/data/regions";
import { REGIONS } from "@/data/sidoRegions";
import { schoolsInSigungu } from "@/lib/schoolRegionIndex";

/** regions.ts 의 province 표기 → sidoRegions slug. 광역시 6곳만(경기 광주시와 광주광역시 혼동 없음). */
const METRO_SIDO_SLUG: Record<string, string> = {
  부산: "busan",
  대구: "daegu",
  인천: "incheon",
  광주: "gwangju",
  대전: "daejeon",
  울산: "ulsan",
};

export type RegionStats = {
  /** 고등학교 수(해당 시군구 학교 풀 기준). */
  high: number;
  /** 중학교 수. */
  middle: number;
  /** 초등학교 수(현재 카피 미사용, 확장 대비). */
  elem: number;
};

/** 지역 id("부산-동래구") → 집계. 모듈 로드 시 1회 계산. */
const statsById: Map<string, RegionStats> = (() => {
  const m = new Map<string, RegionStats>();
  for (const r of regions) {
    const sidoSlug = METRO_SIDO_SLUG[r.province];
    if (!sidoSlug) continue; // 광역시 외(서울·경기 등)는 대상 아님
    const sido = REGIONS.find((s) => s.slug === sidoSlug);
    const sg = sido?.sigungu.find((s) => s.name === r.cityQuery);
    if (!sg) continue;
    const pool = schoolsInSigungu(sidoSlug, sg.slug);
    const stats: RegionStats = {
      high: pool.filter((s) => s.level === "high").length,
      middle: pool.filter((s) => s.level === "middle").length,
      elem: pool.filter((s) => s.level === "elem").length,
    };
    if (stats.high < 1 || stats.middle < 1) continue; // 수치 0 노출 방지 → 호출부 폴백
    m.set(r.id, stats);
  }
  return m;
})();

/** 광역시 구·군이면 집계, 그 외(서울·경기·생활권)면 null → 호출부는 기존 카피 유지. */
export function getRegionStats(regionId: string): RegionStats | null {
  return statsById.get(regionId) ?? null;
}

/** 대상 지역 수(검증·리스트 생성용). */
export const metroRegionIds: string[] = [...statsById.keys()];
