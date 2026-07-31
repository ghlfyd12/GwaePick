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
  /** 있으면 드롭다운(데스크톱)·아코디언(모바일) 트리거가 된다(자체 페이지 이동 없음). */
  children?: NavItem[];
};

export const site = {
  /** 사이트명(브랜드명) — 이 한 줄만 수정하면 헤더·푸터·메타 전체에 반영된다. */
  name: "지식의참견",

  /** 로고 옆 태그라인 — 데스크톱에서만 작게 노출(모바일 숨김). */
  headerTagline: "일대일 과외",

  /**
   * 배포 도메인(절대경로 기준). canonical·OG·sitemap·robots 가 이 값을 사용한다.
   * 도메인 확정 시 이 한 줄만 교체하면 메타데이터 전체에 반영된다.
   */
  url: "https://xn--l89av43blfdm0cm7d.com",

  /**
   * URL 공유 미리보기(OG/트위터) 이미지 단일 소스.
   * metadataBase 기준 절대 URL 로 변환된다. 자체 openGraph 를 정의하는 하위 페이지도 이 값을 함께 지정해 상속한다.
   */
  ogImage: {
    url: "/og/og-default.jpg",
    width: 1024,
    height: 677,
    alt: "지식의참견 — 직접 가르쳐 본 선생님이 1:1로 연결하는 맞춤 과외",
  },

  /**
   * 어학의참견(/power 및 하위) 전용 OG/브랜드 — 메인(지식의참견)과 분리한다.
   * Next.js 는 openGraph 를 얕게 병합(하위가 openGraph 를 정의하면 부모 images 소실)하므로,
   * /power 각 페이지·빌더에서 site.ogImage/site.name 대신 이 값을 지정해 어학 이미지·사이트명으로 오버라이드한다.
   * (메인 경로에는 노출되지 않아 브랜드가 섞이지 않는다.)
   */
  power: {
    name: "어학의참견",
    ogImage: {
      url: "/og/og-power.jpg",
      width: 896,
      height: 597,
      alt: "어학의참견 — 직접 가르쳐 온 선생님이 1:1로 연결하는 맞춤 어학 과외",
    },
  },

  /** 핵심 슬로건 (CLAUDE.md 고정 규칙) */
  slogan: "선생님을 보는 눈은, 선생님이 가장 정확합니다.",

  /** 푸터 태그라인(두 줄, \n 으로 줄바꿈) */
  footerTagline:
    "취약과목 집중관리부터 공부습관까지\n체계적인 맞춤관리로 확실한 결과를 만듭니다.",

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
    { label: "지역별 과외", href: "/tutoring/by-region" },
    { label: "학교별 과외", href: "/tutoring/by-school" },
    { label: "과목별 과외", href: "/tutoring/by-subject" },
    { label: "교사진", href: "/teachers" },
    { label: "수업후기", href: "/reviews" },
  ] as NavItem[],

  /** 연락처 (실제 값) */
  contact: {
    phone: "010-2177-2720",
    email: "kar9777@naver.com",
    hours: "매일 09:00 - 23:00 / 주말 상담 가능",
    kakao: "@studykim",
    /** 카카오톡 오픈채팅 1:1 링크 — '카톡 상담' 버튼(플로팅·상담폼)이 참조. 링크 변경 시 이 값만 교체. */
    kakaoChannelUrl: "https://open.kakao.com/o/sOxzonXg",
  },

  /** 푸터 저작권 표기 연도 */
  copyrightYear: 2026,
} as const;
