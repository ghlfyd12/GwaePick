/**
 * OUR TEACHER 캐러셀 "섹션 카피/설정" 단일 소스(카드 데이터 아님).
 *
 * 카드(선생님)는 teachers.ts 에서 랜덤 추출한다. 이 파일은 섹션 제목·라벨·CTA·자동재생만 담는다.
 * 카피를 컴포넌트에 하드코딩하지 않기 위해 분리(CLAUDE.md 데이터 분리 원칙).
 */

/** 제목 한 조각. */
export type TextSegment = { text: string; emphasis?: boolean };

/** 카드 배경 톤 키 — 브랜드 톤 변주(레인보우 아님). 컴포넌트가 인덱스로 순환 적용. */
export type TeacherTone = "charcoal" | "cream" | "peach";

export const teacherCarousel = {
  /** 섹션 상단 작은 라벨 */
  label: "Our Teacher",

  /** 제목 — 마지막 강조 줄만 주황(accent). */
  heading: {
    title: [
      { text: "언제 어디서나, 나와 잘 맞는 선생님과 1:1로" },
    ] satisfies TextSegment[],
    emphasis: "지식의참견이 연결합니다",
  },

  /** 자동재생 간격(ms). 0 이면 끔(기본 — 사용자가 직접 넘김). */
  autoplayMs: 0,

  /** 섹션 하단 공통 CTA — 전환 동선은 #consult(무료 상담 신청). */
  cta: {
    label: "이런 선생님들과 만나보세요 — 무료 상담 신청",
    href: "#consult",
  },
} as const;
