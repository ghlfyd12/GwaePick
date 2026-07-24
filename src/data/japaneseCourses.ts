/**
 * /power/japanese(어학의참견 일본어 상세) 확장 섹션 데이터 단일 소스.
 *
 * 공감 도입 · 1:1 수업 포인트 · 수준별 로드맵 · 추천 과정 8종. 카피는 확정본이라 임의 수정 금지
 * (조사·띄어쓰기 보정만). 협력사명·가격/시간 수치·성과 보장·기간 표기·느낌표·대체 호칭(강사 등) 미사용.
 * 색은 accent 토큰(퍼플, /power 스코프)만 — 컴포넌트에서 처리.
 */

/** 섹션 0 — 공감 도입. */
export const japaneseIntro = {
  title: "일본어, 왜 하면 할수록 더 어려워질까요",
  bubbles: [
    "한자와 문법이 장벽처럼 느껴지지 않았나요",
    "단순 암기에만 의존하지 않았나요",
    "체계적인 학습법이 부족하지 않았나요",
  ],
  closing: "혼자 외우는 공부가 아니라, 맞는 선생님과 말하며 배우면 달라집니다.",
} as const;

/** 섹션 1 — 1:1 수업 포인트(체크 4 + 특징 칩 2). */
export const japaneseOneOnOne = {
  title: "1:1 맞춤 수업으로 배우는 일본어",
  points: [
    "회화, 문법, 시험 등 목적별 맞춤 학습 설계",
    "일본인 원어민·교포·한국인 선생님 중에서 상담으로 맞는 분을 연결",
    "수업부터 관리까지 같은 선생님이 이어가는 전담제",
    "모의시험과 피드백으로 실전 감각까지 훈련",
  ],
  chips: ["수업 녹음 복습 제공", "실시간 학습 피드백"],
} as const;

/** 섹션 2 — 수준별 로드맵(3단계, 화살표 흐름). */
export const japaneseRoadmap = {
  title: "기초가 없어도 단계대로 나아가는 학습 로드맵",
  stages: [
    {
      level: "왕초보·초급",
      items: [
        "히라가나·가타카나 완전 정복",
        "기초 발음·억양 익히기",
        "생활 필수 단어·기본 어휘 학습",
        "기초 문장구조·표현 익히기",
      ],
    },
    {
      level: "중급",
      items: [
        "기초 문법 정리와 응용 문법 학습",
        "기본 한자 학습",
        "주제별 일상 회화 연습",
        "상황별 문장 패턴 훈련",
      ],
    },
    {
      level: "고급",
      items: [
        "고급 문법과 비즈니스 표현 학습",
        "한자 학습 확장",
        "자유 회화·토론 연습",
        "JLPT N2~N1 대비 과정",
      ],
    },
  ],
  note: "참고용 예시이며, 학습자의 수준과 목표에 따라 기간과 구성은 달라집니다.",
} as const;

/** 섹션 3 — 추천 과정 카드. link 는 내부 링크가 붙는 과정만. */
export interface JapaneseCourse {
  id: string;
  name: string;
  description: string;
  level: string;
  link?: { label: string; href: string };
}

export const japaneseCourses: JapaneseCourse[] = [
  {
    id: "basic",
    name: "기초 과정",
    description:
      "히라가나·가타카나부터 기초 문법과 문형까지 체계적으로 학습하는 과정",
    level: "입문",
  },
  {
    id: "intermediate",
    name: "중급 과정",
    description:
      "회화와 함께 문법·어휘를 익히고 정확한 작문 실력을 키우는 심화 과정",
    level: "중급",
  },
  {
    id: "school-record",
    name: "내신관리",
    description:
      "수행평가와 듣기 만점 대비로 내신을 관리하는 과정. 특목고 재학생 맞춤 관리",
    level: "중·고등",
    link: { label: "외고·국제중·고 수행평가 안내 →", href: "/power/schools" },
  },
  {
    id: "admission-abroad",
    name: "입시·유학",
    description: "일본 유학과 일본 대학 입시 준비를 위한 실력 향상 수업",
    level: "고등·성인",
  },
  {
    id: "animation",
    name: "애니메이션 과정",
    description:
      "유·초등 대상 애니메이션 활용 수업으로 쉽고 재미있게 시작하는 일본어",
    level: "유·초등",
  },
  {
    id: "hobby-travel",
    name: "취미·여행",
    description: "생활 회화와 현지에서 바로 쓰는 여행 일본어 중심 과정",
    level: "전 수준",
  },
  {
    id: "jlpt-jpt",
    name: "JLPT·JPT",
    description: "시험 대비 단계별 수업과 맞춤 학습 관리",
    level: "중급 이상",
  },
  {
    id: "business",
    name: "비즈니스·취업",
    description: "취업·인터뷰 준비와 유형별 비즈니스 회화, 다양한 패턴 학습",
    level: "중급 이상",
  },
];
