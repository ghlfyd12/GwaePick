/**
 * 어학의참견(/power) 전용 푸터 링크 4열 — 단일 소스.
 *
 * 메인 지식의참견 푸터(footerLinks.ts)와 분리한다(어학 포지셔닝 + 신규 학교/지역 축 진입점).
 * 실존 라우트만 나열한다(404 링크 금지). 지역은 sido.ts 파생, 학교 안내는 /power/schools 허브.
 * 워딩: 느낌표·금지어 없음. 색은 accent 토큰(퍼플, /power 스코프).
 */
import { sidoList } from "@/data/sido";
import { POWER_CONSULT_HREF } from "@/data/service";

export type FooterLink = { label: string; href: string };
export type FooterGroup = { title: string; links: FooterLink[] };

/** 1열 — 지역별 어학과외: 17개 시/도 → /power/[region](지역 영어 회화 상세). */
const regionLinks: FooterLink[] = sidoList.map((s) => ({
  label: `${s.label} 어학과외`,
  href: `/power/${encodeURIComponent(s.label)}`,
}));

/** 2열 — 어학 수업: 언어 상세 3종 + 교사진. */
const lessonLinks: FooterLink[] = [
  { label: "영어 회화 과외", href: "/power/english" },
  { label: "중국어 과외", href: "/power/chinese" },
  { label: "일본어 과외", href: "/power/japanese" },
  { label: "선생님 소개", href: "/power/teachers" },
];

/** 3열 — 학교별 안내: 외고·국제중·국제고 허브(/power/schools). */
const schoolLinks: FooterLink[] = [
  { label: "외고 수행평가 안내", href: "/power/schools" },
  { label: "국제중·국제고 수행평가", href: "/power/schools" },
  { label: "외고 어학 수업 안내", href: "/power/schools" },
];

/** 4열 — 바로가기: 홈·상담·후기 + 지식의참견 메인 교차 링크. */
const shortcutLinks: FooterLink[] = [
  { label: "어학의참견 홈", href: "/power" },
  { label: "무료 상담 신청", href: POWER_CONSULT_HREF },
  { label: "수업 후기", href: "/reviews" },
  { label: "지식의참견 메인", href: "/" },
];

export const powerFooterGroups: FooterGroup[] = [
  { title: "지역별 어학과외", links: regionLinks },
  { title: "어학 수업", links: lessonLinks },
  { title: "학교별 안내", links: schoolLinks },
  { title: "바로가기", links: shortcutLinks },
];
