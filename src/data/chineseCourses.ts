/**
 * /power/chinese(어학의참견 중국어 상세) 확장 섹션 데이터 단일 소스.
 *
 * 6대 학습 영역 · 수업 진행 3단계 · 추천 과정 8종 · 수업 방식 안내. 카피는 확정본이라 임의 수정 금지
 * (조사·띄어쓰기 보정만). 협력사명·가격/시간 수치·성과 보장/과장·느낌표·대체 호칭(강사 등) 미사용.
 * 색은 accent 토큰(퍼플, /power 스코프)만 — 컴포넌트에서 처리.
 */

/** 섹션 0 — 6대 학습 영역. */
export const chineseAreas = {
  title: "기초부터 시험까지, 전 영역을 짚는 중국어 수업",
  sub: "발음부터 단어, 문장, 실전 연습으로 이어지는 단계별 학습으로 실생활 대화와 상황별 훈련까지 함께 진행합니다.",
  chips: ["발음", "회화·청취", "문법·어휘", "작문·독해", "HSK", "HSKK·OPIc"],
} as const;

/** 섹션 1 — 수업 진행 3단계(세로 흐름). STEP 3 에 성조 질문 예시 말풍선. */
export const chineseProcess = {
  title: "수업은 이렇게 진행됩니다",
  steps: [
    {
      no: "STEP 1",
      title: "학습 진단",
      desc: "선생님이 직접 1:1 레벨 테스트를 진행하고, 맞춤 학습법과 추천 커리큘럼을 안내해 드립니다.",
    },
    {
      no: "STEP 2",
      title: "정규 수업",
      desc: "원어민·교포 선생님과 전화·화상으로 진행하는 1:1 전담 수업. 같은 선생님이 수업부터 관리까지 이어갑니다.",
    },
    {
      no: "STEP 3",
      title: "피드백과 복습",
      desc: "담당 선생님의 피드백과 수업 녹음 파일로 복습하고, 월 평가서로 학습 현황을 함께 확인합니다.",
    },
  ],
  /** STEP 3 카드에 붙는 성조 질문 예시(텍스트 재제작 — 인물 사진·캐릭터 없음). */
  tonExample: {
    question:
      "2성이 자꾸 4성이랑 헷갈려요. 올라야 하는데 떨어지는 느낌이 나요",
    answer:
      "2성은 의문문 톤처럼 살짝 올려주는 느낌입니다. 낮게 시작해서 자연스럽게 올려보고, 거울로 턱과 입모양을 함께 확인하면 훨씬 정확해집니다",
  },
} as const;

/** 섹션 3 — 수업 방식 안내(짧은 마무리). */
export const chineseMethodNote =
  "1:1 화상부터 전화 수업까지 원하는 방식으로 진행할 수 있고, 상담 선생님이 수준과 목표, 호흡까지 보고 맞는 선생님을 연결해 드립니다.";

/** 섹션 2 — 추천 과정 카드. link 는 내부 링크가 붙는 과정만. */
export interface ChineseCourse {
  id: string;
  name: string;
  description: string;
  level: string;
  link?: { label: string; href: string };
}

export const chineseCourses: ChineseCourse[] = [
  {
    id: "basic",
    name: "기초·입문",
    description: "정확한 발음과 단어, 표현을 익히며 중국어의 첫걸음을 떼는 과정",
    level: "입문",
  },
  {
    id: "conversation",
    name: "수준별 회화",
    description:
      "초급부터 고급까지, 지금 레벨과 학습 목표에 맞춰 진행되는 맞춤 수업",
    level: "전 수준",
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
    description: "국내외 대학 입시와 중국 유학, 교환학생 준비를 위한 과정",
    level: "고등·성인",
  },
  {
    id: "vocab-grammar",
    name: "어휘·어법",
    description: "기초 어법을 배우며 중국어의 문장 구조와 활용법을 익히는 과정",
    level: "초중급",
  },
  {
    id: "business",
    name: "비즈니스 회화",
    description: "직장인을 위한 세련된 비즈니스 회화와 프레젠테이션 수업",
    level: "중급 이상",
  },
  {
    id: "hsk",
    name: "HSK",
    description: "급수별 출제 유형을 파악해 단계적으로 준비하는 시험 대비 과정",
    level: "전 수준",
  },
  {
    id: "speaking-tests",
    name: "HSKK·TSC·OPIc",
    description: "말하기 시험 유형에 맞춘 전략적인 학습 설계와 실전 대비",
    level: "중급 이상",
  },
];
