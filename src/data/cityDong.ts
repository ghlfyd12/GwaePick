/**
 * 광역시 동×과목 pSEO 2차 확장 — 사이트맵 노출용 "기초 동" 목록(파생, 신규).
 *
 * seoulDong.ts 의 필터 로직(strict + 명소 프리픽스 복구)을 파라미터화한 범용 헬퍼.
 * sidoRegions.ts(전국 동 데이터)에서 시도를 읽어, 번호 행정동(대저1동)·가(을지로1가)를
 * 제외한 "기초 동"만 추린다(읍/면은 그대로 유지). base 형이 없어 통째로 빠지는 잘 알려진
 * 주거 법정동은 recoverPrefix 로 복구한다(부산 동대신동·서대신동·토성동·봉래동 = 가-법정동).
 *
 * 광역시엔 파일럿이 없어 제외 로직이 필요없다. 렌더는 기존 resolveNew(온디맨드 ISR)가
 * 그대로 처리 — 라우트·컴포넌트 변경 없음. 이 목록은 "사이트맵 등재" 큐레이션 전용이다.
 * seoulDong.ts 는 무변경(서울 1차 회귀 방지) — 이 파일은 광역시(및 향후 도 지역)를 담당한다.
 */
import { getSido } from "@/data/sidoRegions";

/** 번호 행정동(대치1동)·가(을지로1가) 판별 — 제외 대상. */
const isNumberedOrGa = (name: string): boolean =>
  /\d+동$/.test(name) || /\d+가$/.test(name);

export type CityDongPair = { sido: string; sigungu: string; dong: string };

/**
 * 한 시도의 기초 동(+명소 복구) — {시도 slug, 시군구 slug, 동 slug}.
 * recoverPrefix: 이름이 이 프리픽스로 시작하면 가/번호형이라도 유지(명소 복구).
 */
export function buildCityDongPairs(
  sidoSlug: string,
  recoverPrefix: readonly string[] = [],
): CityDongPair[] {
  const sido = getSido(sidoSlug);
  if (!sido) return [];
  const out: CityDongPair[] = [];
  for (const sg of sido.sigungu) {
    for (const d of sg.dong) {
      const excluded =
        isNumberedOrGa(d.name) &&
        !recoverPrefix.some((p) => d.name.startsWith(p));
      if (excluded) continue;
      out.push({ sido: sidoSlug, sigungu: sg.slug, dong: d.slug });
    }
  }
  return out;
}

/**
 * 6대 광역시 config. 부산만 유형 A(가-법정동) 명소 복구.
 * 유형 B(번호 행정동만 존재: 첨단·계양·안심·고산·농소 등)는 strict 유지로 미복구.
 */
const METRO_CITIES: { slug: string; recover: readonly string[] }[] = [
  { slug: "busan", recover: ["동대신동", "서대신동", "토성동", "봉래동"] },
  { slug: "daegu", recover: [] },
  { slug: "incheon", recover: [] },
  { slug: "gwangju", recover: [] },
  { slug: "daejeon", recover: [] },
  { slug: "ulsan", recover: [] },
];

/** 6대 광역시 기초 동(+부산 명소 복구) — 사이트맵 등재용. */
export const metroExpansionDongPairs: CityDongPair[] = METRO_CITIES.flatMap((c) =>
  buildCityDongPairs(c.slug, c.recover),
);
