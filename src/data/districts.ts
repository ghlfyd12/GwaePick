/**
 * 서울 25개 자치구 데이터 단일 소스 (지역 상세 페이지 + 지도 연동).
 *
 * name 은 지도 GeoJSON 의 properties.name 과 동일해야 한다(지도 클릭 → slug 매핑).
 * 컴포넌트/페이지에 구 이름을 하드코딩하지 않는다.
 */
export interface District {
  slug: string;
  name: string; // name 은 GeoJSON properties.name 과 동일해야 함
}

export const districts: District[] = [
  { slug: "gangnam", name: "강남구" }, { slug: "gangdong", name: "강동구" },
  { slug: "gangbuk", name: "강북구" }, { slug: "gangseo", name: "강서구" },
  { slug: "gwanak", name: "관악구" }, { slug: "gwangjin", name: "광진구" },
  { slug: "guro", name: "구로구" }, { slug: "geumcheon", name: "금천구" },
  { slug: "nowon", name: "노원구" }, { slug: "dobong", name: "도봉구" },
  { slug: "dongdaemun", name: "동대문구" }, { slug: "dongjak", name: "동작구" },
  { slug: "mapo", name: "마포구" }, { slug: "seodaemun", name: "서대문구" },
  { slug: "seocho", name: "서초구" }, { slug: "seongdong", name: "성동구" },
  { slug: "seongbuk", name: "성북구" }, { slug: "songpa", name: "송파구" },
  { slug: "yangcheon", name: "양천구" }, { slug: "yeongdeungpo", name: "영등포구" },
  { slug: "yongsan", name: "용산구" }, { slug: "eunpyeong", name: "은평구" },
  { slug: "jongno", name: "종로구" }, { slug: "jung", name: "중구" },
  { slug: "jungnang", name: "중랑구" },
];

export const slugByName: Record<string, string> = Object.fromEntries(
  districts.map((d) => [d.name, d.slug]),
);
