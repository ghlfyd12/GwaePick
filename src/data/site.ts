/**
 * 사이트 공통 텍스트/설정 단일 소스(single source of truth).
 *
 * 헤더·푸터·플로팅 버튼 등 모든 공통 UI는 이 파일에서 텍스트를 가져온다.
 * 컴포넌트에 문자열을 하드코딩하지 않는다. (pSEO 확장 대비)
 *
 * 확정 브랜드명이 나오면 `name` 한 줄만 수정하면 사이트 전체에 반영된다.
 */

export type NavItem = {
  label: string;
  href: string;
};

export const site = {
  /** 사이트명(브랜드명) — 이 한 줄만 수정하면 헤더·푸터·메타 전체에 반영된다. */
  name: "지식의참견",

  /** 핵심 슬로건 (CLAUDE.md 고정 규칙) */
  slogan: "선생님을 보는 눈은, 선생님이 가장 정확합니다.",

  /** 기본 소개 문구 */
  description:
    "직접 가르쳐 온 선생님이 1:1 상담으로 우리 아이에게 가장 잘 맞는 선생님을 연결해 드립니다.",

  /**
   * 유일한 전환 목표 = 무료 상담 신청.
   * 폼 수신 방식이 정해지기 전까지는 메인 페이지의 #consult 앵커로만 연결한다.
   */
  cta: {
    label: "무료 상담 신청",
    href: "/#consult",
  },

  /**
   * 네비게이션 메뉴.
   * 데스크톱은 가로 정렬, 모바일은 햄버거 토글로 노출.
   * href 는 임시 앵커 — 추후 실제 페이지/섹션과 연결.
   */
  nav: [
    { label: "1:1과외수업", href: "/#tutoring" },
    { label: "학원", href: "/#academy" },
    { label: "코딩", href: "/#coding" },
    { label: "외국어", href: "/#language" },
    { label: "수업후기", href: "/#reviews" },
    { label: "상담안내", href: "/#guide" },
  ] satisfies NavItem[],

  /** 연락처 placeholder — 실제 값으로 교체 예정 */
  contact: {
    phone: "010-0000-0000",
    email: "contact@example.com",
    hours: "평일 10:00 – 20:00 / 주말 상담 예약",
    kakao: "@맞춤과외상담",
  },

  /** 푸터 저작권 표기 연도 */
  copyrightYear: 2026,
} as const;
