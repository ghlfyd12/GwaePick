/**
 * TeacherIntro('선생님 소개' 인트로) 블록 데이터 단일 소스.
 *
 * Teachers(교사진 카드) 섹션 바로 위에 들어가는 좌(사진)·우(텍스트) 인트로.
 * 컴포넌트(TeacherIntro.tsx)에는 문자열을 하드코딩하지 않는다.
 *
 * 워딩 규칙(CLAUDE.md): "코칭/코치/컨설팅/컨설턴트/멘토" 금지 → "선생님 / 직접 가르치고 관리".
 * 브랜드명은 '지식의참견'으로 통일. 색은 주황(accent) 강조(파랑/보라 금지).
 */

/** 강조 항목 한 개(앞에 주황 포인트 마커). */
export type IntroHighlight = {
  text: string;
};

export const teacherIntro = {
  /** 제목 — 주황(accent) 강조. 헤더 브랜드명('지식의참견')과 일치. */
  title: "지식의참견 선생님은..",

  /** 본문 — 가독성 높은 진한 회색. */
  body: "학생이 희망하는 과목을 1:1 온·오프라인으로 직접 가르치고, 아이가 올바른 공부 습관과 실력을 기를 수 있도록 끝까지 함께 관리하는 선생님입니다.",

  /** 강조 항목(주황 포인트 마커). */
  highlights: [
    { text: "온·오프라인 선택 및 병행 가능" },
    { text: "과목 및 학년 선택 가능" },
  ] satisfies IntroHighlight[],

  /** 헤드샷 사진. public/images/teacher-intro.png 에 저장. */
  photo: {
    src: "/images/teacher-intro.png",
    alt: "지식의참견 선생님 소개 사진",
    width: 800,
    height: 800,
  },
} as const;
