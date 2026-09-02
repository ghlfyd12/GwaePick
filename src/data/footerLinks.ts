/**
 * 전역 푸터 링크 그룹 — 사이트와이드 내부 링크(크롤 경로) 공급 단일 소스.
 *
 * 목적: pSEO 페이지가 사이트맵으로만 발견되는 고아 상태를 완화하기 위해, 전 페이지에 렌더되는
 *       푸터에서 지역·과목 허브로 정적 <a> 링크를 흘려보낸다(내부 링크 감사 P1-a).
 *
 * 원칙:
 *  - 지역(시/도)·과목 목록은 기존 단일 소스에서 파생한다(sido.ts / subjects.ts). 하드코딩 중복 금지.
 *  - 서비스·어학 그룹은 실존하는 라우트만 나열한다(404 링크 금지). 상담 경로는 site.cta 재사용.
 *  - 앵커 텍스트에 키워드("서울 과외" · "영어 과외")를 포함한다.
 */
import { sidoList } from "@/data/sido";
import { subjects } from "@/data/subjects";
import { site } from "@/data/site";

export type FooterLink = { label: string; href: string };
export type FooterGroup = { title: string; links: FooterLink[] };

/** 그룹 1 — 지역별 과외: 17개 시/도 허브(/tutoring/by-region/{slug}). sido.ts 파생. */
const regionLinks: FooterLink[] = sidoList.map((s) => ({
  label: `${s.label} 과외`,
  href: `/tutoring/by-region/${s.slug}`,
}));

/** 그룹 2 — 과목별 과외: 8과목(/tutoring/by-subject/{slug}). subjects.ts 파생. 비수학 과목 링크 공급이 핵심. */
const subjectLinks: FooterLink[] = subjects.map((s) => ({
  label: `${s.label} 과외`,
  href: `/tutoring/by-subject/${s.slug}`,
}));

/** 그룹 3 — 바로가기: 실존하는 정적/허브 페이지만. 상담 링크는 site.cta 재사용. */
const serviceLinks: FooterLink[] = [
  { label: "홈", href: "/" },
  { label: "학교별 과외", href: "/tutoring/by-school" },
  { label: site.cta.label, href: site.cta.href },
  { label: "수업 후기", href: "/reviews" },
  { label: "교사진 소개", href: "/teachers" },
];

/** 그룹 4 — 어학의참견(/power): 실존하는 하위 허브만. */
const powerLinks: FooterLink[] = [
  { label: "어학의참견", href: "/power" },
  { label: "영어 회화 과외", href: "/power/english" },
  { label: "일본어 과외", href: "/power/japanese" },
  { label: "중국어 과외", href: "/power/chinese" },
];

/** 그룹 5 — 검고의참견(/gumjung): 급별 허브 + 지역 목록(실존 라우트만). */
const gumjungLinks: FooterLink[] = [
  { label: "검고의참견", href: "/gumjung" },
  { label: "고졸 검정고시", href: "/gumjung/gojol" },
  { label: "중졸 검정고시", href: "/gumjung/jungjol" },
  { label: "지역별 검정고시", href: "/gumjung/regions" },
];

export const footerGroups: FooterGroup[] = [
  { title: "지역별 과외", links: regionLinks },
  { title: "과목별 과외", links: subjectLinks },
  { title: "바로가기", links: serviceLinks },
  { title: "어학의참견", links: powerLinks },
  { title: "검고의참견", links: gumjungLinks },
];
