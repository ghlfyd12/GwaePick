/**
 * 검고의참견(/gumjung) 전용 푸터 데이터 — 단일 소스.
 *
 * 급별 안내 3 + 유형 가이드 7 + 바로가기(홈·상담·지식의참견 메인 교차). 지역 샘플은 검증된 시군구만
 * (examRegions 파일럿 = 라우트 해석 보장). 워딩: 느낌표·금지어 없음. 색은 accent 토큰(청록).
 */
import { GUMJUNG_CONSULT_HREF } from "@/data/service";
import { GUMJUNG_GUIDES } from "@/data/gumjung/guides";
import { GUMJUNG_LEVELS } from "@/data/gumjung/levels";

export type FooterLink = { label: string; href: string };
export type FooterGroup = { title: string; links: FooterLink[] };

/** 지역 샘플 — examRegions 파일럿(라우트 해석 보장, 404 없음). 전체는 /gumjung/regions. */
export const gumjungFooterRegions: FooterLink[] = [
  { label: "강남구", href: "/gumjung/by-region/강남구" },
  { label: "관악구", href: "/gumjung/by-region/관악구" },
  { label: "고양시 덕양구", href: "/gumjung/by-region/고양시 덕양구" },
  { label: "수원시 영통구", href: "/gumjung/by-region/수원시 영통구" },
  { label: "해운대구", href: "/gumjung/by-region/해운대구" },
  { label: "수성구", href: "/gumjung/by-region/수성구" },
];

const levelLinks: FooterLink[] = [
  ...GUMJUNG_LEVELS.map((l) => ({
    label: `${l.name} 검정고시`,
    href: `/gumjung/${l.slug}`,
  })),
  { label: "지역별 검정고시", href: "/gumjung/regions" },
];

const guideLinks: FooterLink[] = GUMJUNG_GUIDES.map((g) => ({
  label: g.navLabel,
  href: `/gumjung/guide/${g.slug}`,
}));

const shortcutLinks: FooterLink[] = [
  { label: "검고의참견 홈", href: "/gumjung" },
  { label: "무료 상담 신청", href: GUMJUNG_CONSULT_HREF },
  { label: "지식의참견 메인", href: "/" },
];

export const gumjungFooterGroups: FooterGroup[] = [
  { title: "급별 안내", links: levelLinks },
  { title: "유형 가이드", links: guideLinks },
  { title: "바로가기", links: shortcutLinks },
];
