/**
 * 어학 썸네일 전용 지역 라벨 축약 — **썸네일 라벨만** 바꾸고 페이지 title·본문·메타는 건드리지 않는다.
 *
 * 긴 지역명("전주시 완산구 중앙동1가")이 그대로 들어가면 줄 전체가 작아져 썸네일 가독성이 떨어진다.
 * 상위 지역 매핑은 **기존 데이터 소스**(powerRegionsExpansion 의 sigunguName)에서만 가져오고,
 * 새 수기 테이블은 만들지 않는다.
 *
 * 규칙
 *  1. 동/읍/면 단위 → 소속 시군구로 올린다("전주시 완산구 중앙동1가" → "완산구").
 *  2. "{시} {구}" 복합 → 구만("수원시 팔달구" → "팔달구", "고양시 일산동구" → "일산동구").
 *  3. "{시도약칭} {구}" 접미형("서울 강서구"·"대구 북구")은 **그대로** 둔다 — 떼면 다른 지역과 섞인다.
 *  4. 이미 짧은 지역(송파구·강남구)은 그대로.
 *  5. 어떤 규칙도 못 맞추면 원본 그대로(폴백).
 */
import { getExpansionRegion } from "@/data/powerRegionsExpansion";

/** 접미형 판별용 시도 약칭 — 이 토큰이 앞에 오면 축약하지 않는다. */
const SIDO_SHORT_PREFIX = new Set([
  "서울", "부산", "대구", "인천", "광주", "대전", "울산", "세종",
  "경기", "강원", "충북", "충남", "전북", "전남", "경북", "경남", "제주",
]);

/** "{시} {구}" → "구", 그 외는 그대로. */
function sigunguTail(name: string): string {
  const t = name.trim().split(/\s+/);
  if (t.length === 2 && /시$/.test(t[0]) && /구$/.test(t[1])) return t[1];
  return name;
}

/**
 * 썸네일 지역줄 라벨. regionParam 은 URL [region] 값(확장 지역 조회 키).
 * 실패하면 regionName 을 그대로 돌려준다.
 */
export function thumbRegionLabel(regionParam: string, regionName: string): string {
  const exp = getExpansionRegion(regionParam);

  // 1. 동/읍/면 — 소속 시군구로 올린다.
  if (exp?.level === "dong" && exp.sigunguName) return sigunguTail(exp.sigunguName);

  const t = regionName.trim().split(/\s+/);

  // 3. "{시도약칭} {구}" 접미형은 유지.
  if (t.length === 2 && SIDO_SHORT_PREFIX.has(t[0])) return regionName;

  // 2. "{시} {구}" 복합 → 구만.
  if (t.length === 2 && /시$/.test(t[0]) && /구$/.test(t[1])) return t[1];

  // 동명이 이름에 섞인 3토큰 이상("인천 서구 백석동") — 가운데 시군구 토큰을 쓴다.
  if (t.length >= 3) {
    const mid = t.find((x, i) => i > 0 && /[시군구]$/.test(x));
    if (mid) return mid;
  }

  // 4·5. 짧은 지역·미해석 → 원본.
  return regionName;
}
