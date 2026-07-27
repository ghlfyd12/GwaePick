/**
 * /power 홈 "지역별 어학과외" 칩 데이터 — 앵커 키워드 결정적 회전 단일 소스.
 *
 * 시도 17개(시도 배열 순서)에 회화·과외 5과목을 순환 배정해 앵커를 다양화하고,
 * 링크도 동일 과목의 by-region 페이지로 일치시킨다(앵커=도착지 원칙).
 * 시도 slug 는 확장 지역에 실존하는 정식명(by-region 유효) — 404 금지, 푸터 검증 slug 재사용.
 * 워딩: 느낌표·금지어 없음. 색은 컴포넌트에서 accent(퍼플).
 */

/** 회전 과목 5종(고정 순서): 영어회화 → 일본어회화 → 중국어회화 → 일본어과외 → 중국어과외. */
const ROTATION: { slug: string; word: string }[] = [
  { slug: "english-conversation", word: "영어회화" },
  { slug: "japanese-conversation", word: "일본어회화" },
  { slug: "chinese-conversation", word: "중국어회화" },
  { slug: "japanese-tutoring", word: "일본어과외" },
  { slug: "chinese-tutoring", word: "중국어과외" },
];

/** 시도 17 — 표기(짧게) + 정식명 slug(by-region 유효). 순서 = 시도 배열 순서. */
const SIDO: { label: string; slug: string }[] = [
  { label: "서울", slug: "서울특별시" },
  { label: "부산", slug: "부산광역시" },
  { label: "대구", slug: "대구광역시" },
  { label: "인천", slug: "인천광역시" },
  { label: "광주", slug: "광주광역시" },
  { label: "대전", slug: "대전광역시" },
  { label: "울산", slug: "울산광역시" },
  { label: "세종", slug: "세종특별자치시" },
  { label: "경기", slug: "경기도" },
  { label: "강원", slug: "강원도" },
  { label: "충북", slug: "충청북도" },
  { label: "충남", slug: "충청남도" },
  { label: "전북", slug: "전라북도" },
  { label: "전남", slug: "전라남도" },
  { label: "경북", slug: "경상북도" },
  { label: "경남", slug: "경상남도" },
  { label: "제주", slug: "제주특별자치도" },
];

export type PowerRegionChip = { label: string; href: string };

/** 시도 순서대로 과목을 순환 배정 — 앵커 "{시도} {과목}" / 링크 by-region 동일 과목. */
export const powerHomeRegionChips: PowerRegionChip[] = SIDO.map((s, i) => {
  const r = ROTATION[i % ROTATION.length];
  return {
    label: `${s.label} ${r.word}`,
    href: `/power/by-region/${encodeURIComponent(s.slug)}/${r.slug}`,
  };
});
