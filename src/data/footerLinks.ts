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

/** 전국 17개 시도 목록 그룹의 제목 — 상세 페이지에서 접을 대상을 이 값으로 식별한다. */
export const REGION_GROUP_TITLE = "지역별 과외";

/**
 * 전국 시도 목록을 접을 경로인가.
 *
 * 상세 페이지(학교×과목·지역 상세)에서 전국 17개 시도가 펼쳐져 있으면 "전국 업체" 인상을 줘
 * 지역 신뢰성을 떨어뜨린다. 홈·전국 허브는 그 목록이 본래 역할이므로 그대로 펼친다.
 * 접어도 링크는 DOM 에 남으므로(details/summary) 크롤 경로는 보존된다.
 */
const TOP_LEVEL_STATIC = new Set([
  "", "reviews", "teachers", "blog", "apply", "privacy", "power", "gumjung", "tutoring",
]);
export function shouldCollapseRegionGroup(pathname: string): boolean {
  const seg = pathname.split("/").filter(Boolean);
  // 학교×과목 상세 — /tutoring/by-school/{학교}/{과목}. 시도 허브·페이지네이션(/p/n)은 제외.
  if (seg[0] === "tutoring" && seg[1] === "by-school" && seg.length === 4 && seg[2] !== "p") return true;
  // 지역 상세 — /tutoring/by-region/{시도}/{...} 2단 이상. 시도 허브(3세그먼트)는 제외.
  if (seg[0] === "tutoring" && seg[1] === "by-region" && seg.length >= 4) return true;
  // 지역 랜딩 — /{지역id} 단일 세그먼트 중 알려진 정적 상단 경로가 아닌 것.
  if (seg.length === 1 && !TOP_LEVEL_STATIC.has(seg[0])) return true;
  return false;
}

export const footerGroups: FooterGroup[] = [
  { title: REGION_GROUP_TITLE, links: regionLinks },
  { title: "과목별 과외", links: subjectLinks },
  { title: "바로가기", links: serviceLinks },
  { title: "어학의참견", links: powerLinks },
  { title: "검고의참견", links: gumjungLinks },
];
