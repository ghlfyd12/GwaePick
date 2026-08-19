/**
 * 어학의참견(/power) 전용 푸터 데이터 — 단일 소스.
 *
 * 상단 전폭 "지역별 어학과외"(시도 17 + 주요 구 12 × 회화 3종) + 하단 3열(어학 수업/학교별 안내/바로가기).
 * 지역 slug 는 통합 지역 데이터(963+확장)에 실존하는 값만 정확 일치로 하드코딩(404 링크 금지).
 *   — 클라이언트 번들에 확장 지역 대량 데이터가 실리지 않도록 여기서는 검증된 slug 만 상수로 둔다.
 * 워딩: 느낌표·금지어 없음. 색은 accent 토큰(퍼플, /power 스코프).
 */
import { POWER_CONSULT_HREF } from "@/data/service";

export type FooterLink = { label: string; href: string };
export type FooterGroup = { title: string; links: FooterLink[] };

/** 지역 행 — 라벨(표시명) + slug(by-region/[region] 정확 일치). */
export type RegionRow = { label: string; slug: string };

/** 회화 3종 — 푸터 지역 링크 과목. */
export const POWER_REGION_FOOTER_SUBJECTS: { slug: string; label: string }[] = [
  { slug: "english-conversation", label: "영어회화" },
  { slug: "japanese-conversation", label: "일본어회화" },
  { slug: "chinese-conversation", label: "중국어회화" },
];

/** 시도 17 — 표시명(짧게) + 실존 slug(확장 시도 허브 = 정식명). */
export const powerFooterSido: RegionRow[] = [
  { label: "서울", slug: "서울특별시" },
  { label: "경기", slug: "경기도" },
  { label: "부산", slug: "부산광역시" },
  { label: "대구", slug: "대구광역시" },
  { label: "인천", slug: "인천광역시" },
  { label: "광주", slug: "광주광역시" },
  { label: "대전", slug: "대전광역시" },
  { label: "울산", slug: "울산광역시" },
  { label: "세종", slug: "세종특별자치시" },
  { label: "강원", slug: "강원도" },
  { label: "충북", slug: "충청북도" },
  { label: "충남", slug: "충청남도" },
  { label: "전북", slug: "전라북도" },
  { label: "전남", slug: "전라남도" },
  { label: "경북", slug: "경상북도" },
  { label: "경남", slug: "경상남도" },
  { label: "제주", slug: "제주특별자치도" },
];

/** 주요 구 12 — 서울 5구는 963 평면 slug, 경기 7구는 확장 접미 slug. */
export const powerFooterGu: RegionRow[] = [
  { label: "강남구", slug: "강남구" },
  { label: "서초구", slug: "서초구" },
  { label: "송파구", slug: "송파구" },
  { label: "양천구", slug: "양천구" },
  { label: "노원구", slug: "노원구" },
  { label: "분당구", slug: "성남시 분당구" },
  { label: "중원구", slug: "성남시 중원구" },
  { label: "일산동구", slug: "고양시 일산동구" },
  { label: "일산서구", slug: "고양시 일산서구" },
  { label: "동안구", slug: "안양시 동안구" },
  { label: "수지구", slug: "용인시 수지구" },
  { label: "영통구", slug: "수원시 영통구" },
];

/* ── 하단 3열 ─────────────────────────────────────────────────────── */

/** 어학 수업: 언어 상세 3종 + 어학시험 허브 + 교사진. */
const lessonLinks: FooterLink[] = [
  { label: "영어 회화 과외", href: "/power/english" },
  { label: "중국어 과외", href: "/power/chinese" },
  { label: "일본어 과외", href: "/power/japanese" },
  { label: "어학시험 지역별 안내", href: "/power/exams" },
  { label: "선생님 소개", href: "/power/teachers" },
];

/** 학교별 안내: 외고·국제중·국제고 허브(/power/schools). */
const schoolLinks: FooterLink[] = [
  { label: "외고 수행평가 안내", href: "/power/schools" },
  { label: "국제중·국제고 수행평가", href: "/power/schools" },
  { label: "외고 어학 수업 안내", href: "/power/schools" },
];

/** 바로가기: 홈·상담·후기 + 지식의참견 메인 교차 링크. */
const shortcutLinks: FooterLink[] = [
  { label: "어학의참견 홈", href: "/power" },
  { label: "무료 상담 신청", href: POWER_CONSULT_HREF },
  { label: "수업 후기", href: "/reviews" },
  { label: "지식의참견 메인", href: "/" },
];

/** 하단 3열(지역 블록은 상단 전폭으로 분리). */
export const powerFooterGroups: FooterGroup[] = [
  { title: "어학 수업", links: lessonLinks },
  { title: "학교별 안내", links: schoolLinks },
  { title: "바로가기", links: shortcutLinks },
];
