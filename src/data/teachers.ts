/**
 * Teachers(전문 선생님 소개) 캐러셀 데이터 단일 소스.
 *
 * 컴포넌트(Teachers.tsx)에는 문자열을 하드코딩하지 않는다.
 * 톤(CLAUDE.md): 차분한 신뢰감. "컨설턴트/컨설팅/코치/코칭/멘토" 금지 → "선생님".
 * 색: 주황(accent) + 차콜/웜 뉴트럴 + 흰색 (보라 없음). 카드 배경은 레인보우 금지, 브랜드 톤 변주만.
 *
 * ⚠️ 선생님 정보(이름·학력·한마디)는 "실제 사실"이어야 한다. 아래 값은 전부 교체용 플레이스홀더다.
 *    허위 학력·멘트를 넣지 말 것. 사진은 본인 동의 전제(없으면 회색 플레이스홀더 유지).
 */

/** 제목 한 조각. emphasis 면 주황(accent) 강조. */
export type TextSegment = {
  text: string;
  emphasis?: boolean;
};

/** 카드 배경 톤 키 — 브랜드 톤 변주(레인보우 아님). 아래 3종을 순환 사용. */
export type TeacherTone = "charcoal" | "cream" | "peach";

/** 선생님 카드 한 개. 모두 실제 정보로 교체. */
export type TeacherCard = {
  /** 이름/호칭 (마스킹 가능, 예: "김O영 선생님") */
  name: string;
  /** 선생님 한마디(헤드라인) — 카드 상단 큰 문구 */
  headline: string;
  /** 해시태그 3개(# 없이 단어만; 컴포넌트가 # 를 붙임) */
  tags: string[];
  /** 학력/소속 한 줄 (카드 하단) */
  credential: string;
  /** 누끼 사진 경로 (없으면 회색 플레이스홀더) */
  photo: string;
  /** 카드 배경 톤 */
  tone: TeacherTone;
};

export const teachers = {
  /** 섹션 상단 작은 라벨 */
  label: "Our Teacher",

  /** 제목 — 마지막 강조 줄만 주황(accent). 타 브랜드 문구 사용 금지. */
  heading: {
    title: [
      { text: "언제 어디서나, 나와 잘 맞는 선생님과 1:1로" },
    ] satisfies TextSegment[],
    emphasis: "지식의참견이 연결합니다",
  },

  /**
   * 자동재생 간격(ms). 0 이면 끔(기본값 — 사용자가 직접 넘기는 방식 우선).
   * 켜고 싶으면 6000 정도(느리게)로. 사용자가 조작/호버하면 자동 일시정지.
   */
  autoplayMs: 0,

  /**
   * 선생님 카드 — 전부 교체용 플레이스홀더(이름/학력/한마디에 "교체" 표기).
   * 실제 선생님 정보로 채우고, 사진은 같은 경로 파일을 교체한다. tone 은 charcoal/cream/peach 중 선택.
   */
  list: [
    {
      name: "○○○ 선생님",
      headline: "선생님 한마디를 여기에 적어주세요 (교체)",
      tags: ["담당과목", "대상학년", "수업스타일"],
      credential: "학력 · 소속 (교체 필요)",
      photo: "/images/teacher-1.png",
      tone: "charcoal",
    },
    {
      name: "○○○ 선생님",
      headline: "선생님 한마디를 여기에 적어주세요 (교체)",
      tags: ["담당과목", "대상학년", "수업스타일"],
      credential: "학력 · 소속 (교체 필요)",
      photo: "/images/teacher-2.png",
      tone: "cream",
    },
    {
      name: "○○○ 선생님",
      headline: "선생님 한마디를 여기에 적어주세요 (교체)",
      tags: ["담당과목", "대상학년", "수업스타일"],
      credential: "학력 · 소속 (교체 필요)",
      photo: "/images/teacher-3.png",
      tone: "peach",
    },
    {
      name: "○○○ 선생님",
      headline: "선생님 한마디를 여기에 적어주세요 (교체)",
      tags: ["담당과목", "대상학년", "수업스타일"],
      credential: "학력 · 소속 (교체 필요)",
      photo: "/images/teacher-4.png",
      tone: "charcoal",
    },
    {
      name: "○○○ 선생님",
      headline: "선생님 한마디를 여기에 적어주세요 (교체)",
      tags: ["담당과목", "대상학년", "수업스타일"],
      credential: "학력 · 소속 (교체 필요)",
      photo: "/images/teacher-5.png",
      tone: "cream",
    },
    {
      name: "○○○ 선생님",
      headline: "선생님 한마디를 여기에 적어주세요 (교체)",
      tags: ["담당과목", "대상학년", "수업스타일"],
      credential: "학력 · 소속 (교체 필요)",
      photo: "/images/teacher-6.png",
      tone: "peach",
    },
  ] satisfies TeacherCard[],

  /** 섹션 하단 공통 CTA — 전환 동선은 #consult(무료 상담 신청). 개별 선택 버튼 없음. */
  cta: {
    label: "이런 선생님들과 만나보세요 — 무료 상담 신청",
    href: "#consult",
  },
} as const;
