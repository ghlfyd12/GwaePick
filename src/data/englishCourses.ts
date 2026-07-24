/**
 * /power/english(어학의참견 영어 상세) 수업 과정 데이터 단일 소스.
 *
 * 두 소스의 과정을 통합·중복 제거한 21개 과정(3그룹). 카피는 확정본이라 임의 수정 금지
 * (조사·띄어쓰기 보정만). 협력사명·통계·후기·성과 보장·느낌표·대체 호칭(강사 등) 미사용.
 * 색은 accent 토큰(퍼플, /power 스코프)만 — 컴포넌트에서 처리(이 파일은 텍스트만).
 */

export type EnglishCourseGroup = "age" | "purpose" | "exam";

export interface EnglishCourse {
  id: string;
  group: EnglishCourseGroup;
  name: string;
  description: string;
  level: string;
}

/** 그룹 소제목 — 렌더 순서 age → purpose → exam. */
export const englishCourseGroups: { key: EnglishCourseGroup; title: string }[] = [
  { key: "age", title: "연령별 기본 과정" },
  { key: "purpose", title: "목적별 실전 과정" },
  { key: "exam", title: "시험·유학 준비 과정" },
];

export const englishCourses: EnglishCourse[] = [
  /* ── 그룹 A — 연령·수준별 회화 ── */
  {
    id: "phonics",
    group: "age",
    name: "파닉스",
    description: "정확한 발음과 단어, 문장을 익히며 영어의 첫걸음을 떼는 과정",
    level: "유아·초등 저학년",
  },
  {
    id: "elementary-conversation",
    group: "age",
    name: "초등 회화",
    description:
      "말하기·듣기·쓰기·읽기 4개 영역 기반의 수업으로 말문을 열어주는 단계 학습",
    level: "초등",
  },
  {
    id: "middle-conversation",
    group: "age",
    name: "중등 회화",
    description:
      "학교 교재에 충실한 회화 수업과 듣기 관리로 내신과 수행평가까지 함께 챙기는 과정",
    level: "중등",
  },
  {
    id: "high-conversation",
    group: "age",
    name: "고등 회화",
    description:
      "학교별 교과 과정을 반영한 수업과 모의고사 듣기 훈련으로 내신·수능을 관리하는 과정",
    level: "고등",
  },
  {
    id: "adult-conversation",
    group: "age",
    name: "성인 회화",
    description:
      "기초 문장을 만드는 초급부터 유창한 대화의 고급까지 단계별로 진행하는 정규 과정",
    level: "전 수준",
  },
  {
    id: "basic-verbs",
    group: "age",
    name: "기초동사",
    description:
      "have, get, take처럼 원어민이 실제 회화에서 자주 쓰는 동사 100개의 다양한 의미를 익혀 문장으로 만드는 연습",
    level: "초중급",
  },

  /* ── 그룹 B — 실전·목적별 ── */
  {
    id: "free-talking",
    group: "purpose",
    name: "프리토킹",
    description: "제한된 표현에서 벗어나 일상 대화를 자연스럽게 이어가는 연습",
    level: "중급 이상",
  },
  {
    id: "debate",
    group: "purpose",
    name: "영어 토론",
    description:
      "자신의 생각과 의견을 논리적으로 표현하며 세련된 문장을 구사하는 과정",
    level: "중고급",
  },
  {
    id: "newspaper",
    group: "purpose",
    name: "영자신문",
    description:
      "최신 기사를 선생님과 함께 읽고 토론하며 독해력·어휘력·시사 상식까지 넓히는 과정",
    level: "중급 이상",
  },
  {
    id: "business",
    group: "purpose",
    name: "비즈니스 회화",
    description:
      "통화, 미팅, 해외 출장, 프레젠테이션 등 실제 비즈니스 상황의 핵심 표현을 패턴 중심으로 익히는 과정",
    level: "중급 이상",
  },
  {
    id: "interview",
    group: "purpose",
    name: "인터뷰 대비",
    description:
      "국제학교·대학 면접·입사 면접의 질문 유형을 파악하고 선생님의 1:1 교정으로 집중 준비하는 과정",
    level: "중급 이상",
  },
  {
    id: "cabin-crew",
    group: "purpose",
    name: "승무원 면접",
    description:
      "국내·외국 항공사 면접 단기 준비 과정. 실제 면접 형식으로 수업하며 Small Talk와 기내 방송문까지 연습",
    level: "초중급 이상",
  },
  {
    id: "travel",
    group: "purpose",
    name: "여행영어",
    description:
      "숙소 예약, 길 찾기 등 최신 여행 상황이 반영된 실전 표현과 여행 주제 프리토킹",
    level: "전 수준",
  },
  {
    id: "study-abroad-prep",
    group: "purpose",
    name: "어학연수 준비",
    description: "출국 전 현지 상황별 표현을 미리 익히고 프리토킹으로 연결",
    level: "초중급",
  },

  /* ── 그룹 C — 시험·유학·라이팅 ── */
  {
    id: "certification",
    group: "exam",
    name: "인증시험 대비",
    description:
      "토익(TOEIC)·토플(TOEFL)·아이엘츠(IELTS)·오픽(OPIc)·토익스피킹 등 수준별 영어 인증시험을 유형과 출제 의도 중심으로 준비",
    level: "중급 이상",
  },
  {
    id: "sat",
    group: "exam",
    name: "SAT 대비",
    description:
      "국제학교 재학생과 유학 중인 학생을 위한 미국 대학 입학 준비 과정",
    level: "유학·국제학교",
  },
  {
    id: "us-textbook",
    group: "exam",
    name: "미국교과서",
    description:
      "최신 미국 교과서를 활용해 독해 실력과 교과 지식을 함께 넓히는 과정",
    level: "초·중등",
  },
  {
    id: "international-school",
    group: "exam",
    name: "국제학교 대비",
    description:
      "미국 교과 과정 수업과 학교 과제·내신 관리까지 국제학교 맞춤으로 진행하는 과정",
    level: "국제학교",
  },
  {
    id: "essay",
    group: "exam",
    name: "에세이 수업",
    description: "자기소개서, 영어 에세이, 논문 준비에 특화된 라이팅 수업",
    level: "중급 이상",
  },
  {
    id: "grammar",
    group: "exam",
    name: "영어 문법",
    description: "문법 기초부터 응용 연습, 서술형 대비까지 이어지는 영문법 과정",
    level: "전 수준",
  },
  {
    id: "story",
    group: "exam",
    name: "영어 스토리",
    description:
      "명작·설명문 등 다양한 형식의 읽기와 독후 활동으로 사고력을 키우는 과정",
    level: "초·중등",
  },
];

/** 섹션 2 — 수업 관리 시스템(고정 카피). */
export const englishLessonSystem = {
  title: "수업이 끝나도 남는 것들",
  sub: "매 수업의 내용이 기록으로 남아, 복습과 다음 수업의 방향이 됩니다.",
  cards: [
    {
      title: "문법·발음 교정 리포트",
      desc: "수업 중 나온 문장을 선생님이 교정해 정리하고, 발음이 흔들린 단어는 따로 짚어 연습 포인트로 남겨 드립니다.",
    },
    {
      title: "수업 녹음 복습",
      desc: "수업 내용이 자동 녹음되어 언제든 다시 들으며 복습할 수 있습니다.",
    },
    {
      title: "영역별 성취도 진단",
      desc: "문법, 정확성, 발음, 유창성, 듣기, 어휘 여섯 영역의 성취도를 확인하며 부족한 부분부터 채워 갑니다.",
    },
  ],
} as const;

/** 섹션 3 — 영작 교정 안내(고정 카피). */
export const englishWriting = {
  title: "기본 문장 연습부터 에세이까지, 단계적으로 진행되는 영작 교정",
  body: "매회 지금 실력에 맞는 영작 숙제가 제공되고, 작성한 문장을 교정받으며 영어식 사고로 에세이를 쓰는 힘을 기릅니다. 영작 교정은 수업에 포함되어 추가 비용이 없습니다.",
} as const;
