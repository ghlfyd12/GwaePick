/**
 * WhyUs(지식의참견이 다른 이유) 섹션의 모든 카피/데이터 단일 소스.
 *
 * 컴포넌트(WhyUs.tsx)에는 문자열을 하드코딩하지 않는다.
 * 정체성(고정): 알고리즘/AI가 아니라 "직접 가르쳐 본 선생님"이 1:1 상담으로 찾고 직접 관리.
 * 금지 표현(CLAUDE.md): 상담 외주 직함류, 코치류 호칭, 경쟁사명, 알고리즘/자동진단 중심 표현 → 모두 "선생님 / 상담 선생님 / 관리"로.
 *
 * ⚠️ 숫자 지표(stats)의 수치·문구는 "사실"이어야 한다. 아래 값은 디자인 시안 기준 초안이므로
 *    설립연도·누적 회원수 등이 실제와 다르면 반드시 실제 값으로 교체한다(허위 금지).
 * ⚠️ 이미지(blocks[].image)는 회색 플레이스홀더 경로다. 우리 사진으로 교체 예정.
 */

/** (A) 숫자 강조 띠 한 칸. value 는 0→목표값 카운트업되는 숫자, unit 은 옆에 고정. */
export type WhyUsStat = {
  /** 카운트업 목표 숫자(단위 제외) */
  value: number;
  /** 숫자 뒤 단위 (애니메이션 대상 아님) */
  unit?: string;
  /** 지표 이름 */
  label: string;
  /** 작은 부가설명 */
  note: string;
  /** 아이콘 키 — WhyUs.tsx 의 StatIcon 에 대응 */
  icon: "award" | "book" | "monitor" | "users";
};

/** (B) 이미지+텍스트 교차 블록 한 개. */
export type WhyUsBlock = {
  id: string;
  /** 둥근 알약 배지 문구 */
  badge: string;
  /** 큰 제목 */
  title: string;
  /** 본문 */
  body: string;
  /** 이미지 경로(플레이스홀더 — 우리 사진으로 교체) */
  image: string;
  /** 이미지 대체 텍스트(접근성) */
  imageAlt: string;
  /** 데스크톱에서 이미지의 좌/우 위치 (교차 배치). 모바일은 항상 이미지 위. */
  imageSide: "left" | "right";
};

export const whyus = {
  /** 섹션 제목/부제 — 사람(선생님) 중심 정체성을 한 줄로. */
  heading: {
    title: "지식의참견이 다른 이유",
    subtitle:
      "대학생 과외가 아닙니다. 아이들의 성적을 바꿔온 베테랑 교사가 첫 상담부터 직강, 밀착 관리까지 직접 책임집니다.",
  },

  /**
   * (A) 신뢰 지표 4개 (디자인 시안 기준 초안 — 실제 사실과 다르면 교체).
   */
  stats: [
    {
      value: 30,
      unit: "년+",
      label: "교육경력",
      note: "1995년 설립 이래 30년 이상의 교육 노하우",
      icon: "award",
    },
    {
      value: 8,
      unit: "종",
      label: "전문 과외 상품",
      note: "교과·입시·수행평가 / 학습습관·인성·어학·진학",
      icon: "book",
    },
    {
      value: 2,
      unit: "가지",
      label: "수업 방식",
      note: "방문 또는 화상수업 선택 가능",
      icon: "monitor",
    },
    {
      value: 100,
      unit: "만",
      label: "누적 회원수",
      note: "진행회원 월평균 3만 명, 누적 회원 100만 명 돌파!",
      icon: "users",
    },
  ] satisfies WhyUsStat[],

  /** (B) 우리 강점 블록 5개 (좌우 교차). */
  blocks: [
    {
      id: "one-on-one",
      badge: "학생 개인에 최적화된 1:1",
      title: "1:1 맞춤 과외",
      body: "학생 한 명 한 명의 수준과 약점을 먼저 파악해, 꼭 필요한 부분부터 채우는 1:1 맞춤 수업입니다. 직접 가르쳐 본 선생님이 상담으로 시작점을 잡아드립니다.",
      image: "/images/whyus-1.png",
      imageAlt: "선생님이 학생과 1:1로 마주 앉아 수업하는 모습",
      imageSide: "left",
    },
    {
      id: "verified-teacher",
      badge: "검증된 선생님 배정",
      title: "검증된 전문 선생님",
      body: "실력과 경력을 검증한 선생님만 배정합니다. 아이와 호흡이 맞지 않으면 다른 선생님과 호흡을 맞춰볼 수 있도록 조율합니다.",
      image: "/images/whyus-2.png",
      imageAlt: "검증된 전문 선생님이 수업을 준비하는 모습",
      imageSide: "right",
    },
    {
      id: "visit-or-online",
      badge: "원하는 방식으로 선택",
      title: "방문 과외 & 화상 과외",
      body: "선생님이 직접 찾아가는 방문 수업과, 온라인으로 편하게 만나는 화상 수업 중에서 선택할 수 있습니다.",
      image: "/images/whyus-3.png",
      imageAlt: "방문 수업과 화상 수업 장면",
      imageSide: "left",
    },
    {
      // ⚠️ whyus-4.png 교체 권장: 현재 이미지는 'AI 진단' 느낌 + 화면 글자가 깨져 있어
      // 본문(선생님이 결과를 바탕으로 맞춤 관리)과 어울리지 않는다.
      // → '선생님이 리포트를 학부모와 공유하는' 실제 사진으로 교체 권장(imageAlt 가 그 방향).
      id: "report",
      badge: "한눈에 보는 학습 진단",
      title: "데이터 진단 + 선생님의 맞춤 관리",
      body: "학생의 성취도와 강·약점을 한눈에 보이는 리포트로 정리하고, 선생님이 그 결과를 바탕으로 다음 수업을 맞춤 설계합니다. 매 수업 내용과 다음 계획을 학부모님과 공유합니다.",
      image: "/images/whyus-4.png",
      imageAlt: "선생님이 작성한 수업 리포트를 학부모에게 공유하는 모습",
      imageSide: "right",
    },
    {
      id: "all-in-one",
      badge: "입시 전 영역을 한 번에",
      title: "내신·수능·수행평가 통합 관리",
      body: "내신 대비부터 수능 준비, 수행평가, 생활기록부 관리까지 입시에 필요한 영역을 지식의참견 하나로 통합 관리합니다.",
      image: "/images/whyus-5.png",
      imageAlt: "내신·수능·수행평가 자료를 함께 정리하는 모습",
      imageSide: "left",
    },
  ] satisfies WhyUsBlock[],
} as const;
