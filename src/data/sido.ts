/**
 * 전국 17개 시/도 목록 단일 소스(지도 외 링크 그리드·라우트 파라미터·메타데이터용).
 *
 * slug 는 korea-sido.json 의 properties.slug 와 일치한다. 하드코딩 금지 — 이 배열에서만 사용.
 */
export interface Sido {
  slug: string;
  label: string;
}

export const sidoList: Sido[] = [
  { slug: "seoul", label: "서울" }, { slug: "busan", label: "부산" },
  { slug: "daegu", label: "대구" }, { slug: "incheon", label: "인천" },
  { slug: "gwangju", label: "광주" }, { slug: "daejeon", label: "대전" },
  { slug: "ulsan", label: "울산" }, { slug: "sejong", label: "세종" },
  { slug: "gyeonggi", label: "경기" }, { slug: "gangwon", label: "강원" },
  { slug: "chungbuk", label: "충북" }, { slug: "chungnam", label: "충남" },
  { slug: "jeonbuk", label: "전북" }, { slug: "jeonnam", label: "전남" },
  { slug: "gyeongbuk", label: "경북" }, { slug: "gyeongnam", label: "경남" },
  { slug: "jeju", label: "제주" },
];

export const sidoBySlug: Record<string, Sido> = Object.fromEntries(
  sidoList.map((s) => [s.slug, s]),
);
