/**
 * 서울 동×과목 pSEO 1차 확장 — 사이트맵 노출용 "기초 동" 목록(파생, 신규).
 *
 * sidoRegions.ts(전국 동 데이터, 행정동 단위)에서 서울 25구를 읽어, 검색가치가 낮고
 * near-duplicate 위험이 있는 번호 행정동(대치1동)·가(街, 을지로1가)를 제외한 "기초 동"만 추린다.
 * 단, 기초 base 형이 데이터에 없어 strict 필터에서 통째로 빠지는 잘 알려진 주거 법정동
 * (성수동·금호동·동소문동 = 모두 가-형만 존재)은 허용 프리픽스로 복구한다.
 *
 * 파일럿 4구(강남·서초·송파·양천)는 기존 sitemap pilotDetail 이 전 동을 이미 담당하므로
 * 여기서 제외한다(중복 <loc> 방지, 파일럿 무변경). 렌더는 기존 resolveNew(온디맨드 ISR)가
 * 그대로 처리 — 라우트·컴포넌트 변경 없음. 이 목록은 "사이트맵 등재" 큐레이션 전용이다.
 */
import { getSido } from "@/data/sidoRegions";
import { PILOT } from "@/data/dongPageCopy";

const SEOUL = "seoul";

/** 파일럿 서울 구(사이트맵 pilotDetail 이 이미 커버) — 중복 방지 위해 제외. */
const PILOT_SEOUL_SIGUNGU = new Set(
  PILOT.find((p) => p.sido === SEOUL)?.sigungu ?? [],
);

/** 번호 행정동(대치1동)·가(을지로1가) 판별 — 제외 대상. */
const isNumberedOrGa = (name: string): boolean =>
  /\d+동$/.test(name) || /\d+가$/.test(name);

/**
 * 명소 복구 허용 프리픽스 — 기초 base 가 없어 strict 에서 빠지는 주거 법정동.
 * 이름이 이 프리픽스로 시작하면 가-형이라도 유지한다(성수동1가·금호동2가·동소문동3가 등,
 * 각각 실제 distinct 법정동). 도심 상업 가(충무로·남대문로 등)는 복구하지 않는다.
 */
const RECOVER_PREFIX = ["성수동", "금호동", "동소문동"];

export type SeoulDongPair = { sigungu: string; dong: string };

/** 서울 비파일럿 구의 기초 동(+명소 복구) — {시군구 slug, 동 slug}. */
export const seoulExpansionDongPairs: SeoulDongPair[] = (() => {
  const sido = getSido(SEOUL);
  if (!sido) return [];
  const out: SeoulDongPair[] = [];
  for (const sg of sido.sigungu) {
    if (PILOT_SEOUL_SIGUNGU.has(sg.slug)) continue; // 파일럿 구는 pilotDetail 담당
    for (const d of sg.dong) {
      const excluded =
        isNumberedOrGa(d.name) &&
        !RECOVER_PREFIX.some((p) => d.name.startsWith(p));
      if (excluded) continue;
      out.push({ sigungu: sg.slug, dong: d.slug });
    }
  }
  return out;
})();
