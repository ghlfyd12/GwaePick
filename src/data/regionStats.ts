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
import { metroExpansionDongPairs } from "@/data/cityDong";
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

/* ── 대표동 선정 ───────────────────────────────────────────────────────────
 * desc 롱테일용 "{구} {대표동}" 의 대표동을 고른다.
 *
 * ⚠️ 데이터 제약: schools.ts 는 **시군구까지만** 학교를 매핑하고 동 정보가 없다
 * (lib/regionSchoolPick.ts 주석과 동일 사실). 따라서 "동별 학교 수"는 기존 데이터로
 * 직접 셀 수 없다. 원본 무수정 원칙을 지키면서 취지("학교가 가장 많은 동")에 가장
 * 가깝게 가기 위해, **학교명이 동명을 딴다**는 국내 관행을 이용해 근사한다:
 *   점수 = 해당 시군구 고교·중학교 중 교명이 그 동의 어간으로 시작하는 학교 수
 *   (예: 온천동 → "온천중"·"온천고", 사직동 → "사직고").
 * 동률이면 가나다순 첫 번째. 전 동 점수가 0 이면 가나다순 첫 번째.
 *
 * 후보는 cityDong 의 기초 동(사이트맵 등재분)으로 제한한다 → 대표동은 항상
 * 동×과목 실페이지가 있는 동이 된다(번호 행정동·"n가" 는 후보에서 제외됨).
 */
/** "온천1동"·"반여2동"·"중앙동" → "온천"·"반여"·"중앙" (어간). 읍·면도 동일 처리. */
function dongStem(name: string): string {
  return name.replace(/\d+$/, "").replace(/[동읍면가]$/, "").replace(/\d+$/, "");
}

const repDongById: Map<string, string> = (() => {
  const m = new Map<string, string>();
  // 시군구 slug → 기초 동 slug 집합(사이트맵 등재 = 실페이지 보장)
  const baseDongSlugs = new Map<string, Set<string>>();
  for (const p of metroExpansionDongPairs) {
    const key = `${p.sido}/${p.sigungu}`;
    if (!baseDongSlugs.has(key)) baseDongSlugs.set(key, new Set());
    baseDongSlugs.get(key)!.add(p.dong);
  }
  for (const r of regions) {
    const sidoSlug = METRO_SIDO_SLUG[r.province];
    if (!sidoSlug || !statsById.has(r.id)) continue;
    const sido = REGIONS.find((s) => s.slug === sidoSlug);
    const sg = sido?.sigungu.find((s) => s.name === r.cityQuery);
    if (!sg) continue;
    const allowed = baseDongSlugs.get(`${sidoSlug}/${sg.slug}`);
    const cands = sg.dong
      .filter((d) => !allowed || allowed.has(d.slug))
      .sort((a, b) => a.name.localeCompare(b.name, "ko"));
    if (!cands.length) continue;
    const pool = schoolsInSigungu(sidoSlug, sg.slug).filter(
      (s) => s.level === "high" || s.level === "middle",
    );
    let best = cands[0];
    let bestScore = -1;
    for (const d of cands) {
      const stem = dongStem(d.name);
      // 1글자 어간("우동"→"우")은 오매칭이 심해 점수화하지 않는다.
      const score = stem.length >= 2 ? pool.filter((s) => s.name.startsWith(stem)).length : 0;
      if (score > bestScore) {
        best = d;
        bestScore = score;
      }
    }
    m.set(r.id, best.name);
  }
  return m;
})();

/** 광역시 구·군의 대표동 이름. 대상 밖이면 null. */
export function getRepresentativeDong(regionId: string): string | null {
  return repDongById.get(regionId) ?? null;
}
