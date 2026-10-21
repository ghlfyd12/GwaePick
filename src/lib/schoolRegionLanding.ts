import { regions } from "@/data/regions";

/**
 * 학교 소재 시군구 → 시군구 지역 랜딩(/{regionId}) 해석.
 *
 * 학교×과목 상세는 지금까지 시도 허브(/tutoring/by-region/{sido})로만 지역 스택에 연결됐다.
 * 그보다 가까운 "해당 시군구 랜딩"이 있으면 그쪽을 먼저 보여 주는 게 사용자·검색 양쪽에 낫다.
 *
 * 해석은 regions.ts(시군구 랜딩 122개) 와의 **정확 일치**만 인정한다:
 *   province(시도 짧은 표기) + cityQuery === 학교의 시군구명.
 * 경기 일부처럼 schools.ts 가 시 단위("화성")로 묶고 regions.ts 는 일반구 단위
 * ("화성시 만세구" 등)로만 가진 경우에는 어느 구를 고를 근거가 없으므로 **매칭하지 않는다**
 * (임의 선택 금지). 호출부가 시도 허브로 폴백한다.
 *
 * 서버 전용 — 서버 컴포넌트에서만 import 한다(regions.ts 를 클라이언트 번들로 보내지 않는다).
 */

/** 시도 정식명 → regions.ts 의 province 짧은 표기. */
const SIDO_SHORT: Record<string, string> = {
  서울특별시: "서울",
  부산광역시: "부산",
  대구광역시: "대구",
  인천광역시: "인천",
  광주광역시: "광주",
  대전광역시: "대전",
  울산광역시: "울산",
  세종특별자치시: "세종",
  경기도: "경기",
  강원도: "강원",
  강원특별자치도: "강원",
  충청북도: "충북",
  충청남도: "충남",
  전라북도: "전북",
  전북특별자치도: "전북",
  전라남도: "전남",
  경상북도: "경북",
  경상남도: "경남",
  제주특별자치도: "제주",
};

export type RegionLanding = { id: string; name: string };

/** 해당 시군구의 지역 랜딩. 없으면 null(호출부에서 시도 허브로 폴백). */
export function schoolSigunguLanding(
  sidoLabel: string,
  sigunguName: string,
): RegionLanding | null {
  const province = SIDO_SHORT[sidoLabel] ?? sidoLabel;
  const hit = regions.find(
    (r) => r.province === province && r.cityQuery === sigunguName,
  );
  return hit ? { id: hit.id, name: hit.name } : null;
}
