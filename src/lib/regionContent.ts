/**
 * pSEO 지역×(학년)×과목 콘텐츠 템플릿 엔진.
 *
 * 입력 라벨로 H1·인트로·핵심 4섹션·FAQ·메타를 조립한다.
 * "지역"은 가장 구체적 단위(동>시군구>시도), 학년이 있으면 과목 앞에 "{학년} " 접두.
 * 톤: 차분한 신뢰. 과장·허위 수치 금지. "컨설턴트" 미사용.
 */

export const CONSULT_PHONE = "010-2177-2720";

/** 과목별 한 줄 교습 방식. */
const subjectIntro: Record<string, string> = {
  국어: "글의 구조를 스스로 짚어내는 독해 훈련 중심으로, 서술형까지 단계적으로.",
  영어: "문장을 끊어 읽는 구문 독해를 기본기로, 어휘를 매일 누적 관리.",
  수학: "왜 그 공식이 나오는지 개념 원리부터, 오답을 다음 수업의 디딤돌로.",
  사회: "원인-결과의 흐름으로 엮어 이해하고, 자료·그래프 해석까지.",
  과학: "현상을 먼저 관찰·설명하게 한 뒤, 실험·그래프 데이터 해석을 단계별로.",
};

export interface RegionContentInput {
  sidoLabel: string;
  sigunguLabel?: string;
  dongLabel?: string;
  gradeLabel?: string;
  subjectLabel: string;
}

export interface RegionContent {
  h1: string;
  intro: string;
  sections: { h2: string; body: string }[];
  faq: { q: string; a: string }[];
  metaTitle: string;
  metaDescription: string;
  ogTitle: string;
}

export function buildRegionContent(input: RegionContentInput): RegionContent {
  const { sidoLabel, sigunguLabel, dongLabel, gradeLabel, subjectLabel } = input;

  // 가장 구체적인 지역 단위
  const region = dongLabel || sigunguLabel || sidoLabel;
  // 학년이 있으면 과목 앞에 접두 ("중등 수학")
  const subjectPhrase = gradeLabel ? `${gradeLabel} ${subjectLabel}` : subjectLabel;
  const h1 = `${region} ${subjectPhrase} 1:1 과외`;

  const intro = `${region}에서 ${subjectLabel} 1:1 과외를 찾고 계신가요? 지식의참견은 직접 가르쳐 본 상담 선생님이 학생의 학년·실력·성향을 듣고, ${region}에서 호흡이 잘 맞는 ${subjectLabel} 선생님을 1:1로 연결해 드립니다. 학원 단체 수업과 달리, 아이 한 명에게 맞춘 진단과 수업으로 시작합니다.`;

  const sections = [
    {
      h2: `왜 ${region} ${subjectPhrase} 1:1 과외인가요?`,
      body: `학원 단체 수업은 평균에 맞춰 진행되지만, 1:1 과외는 ${region} 학생 한 명의 현재 상태에서 출발합니다. 먼저 어디서 막히는지 진단하고, 부족한 부분만 골라 보강하며, 학생과 선생님의 호흡을 맞춰 갑니다. 모르는 것을 그때그때 물어볼 수 있어 ${subjectLabel} 학습의 빈틈이 쌓이지 않습니다.`,
    },
    {
      h2: `${subjectPhrase}, 이렇게 가르칩니다`,
      body: `진단으로 현재 수준과 약점을 확인하고 → 기초 개념을 다시 다진 뒤 → 심화 문제로 적용력을 키우고 → 주기적인 점검으로 빠진 부분을 메웁니다. ${subjectLabel}은 ${subjectIntro[subjectLabel] ?? "개념부터 단계적으로 쌓아 올립니다."}`,
    },
    {
      h2: `${region} 선생님은 이렇게 연결됩니다`,
      body: `직접 가르쳐 본 상담 선생님이 학생의 실력과 성향을 듣고, 어울리는 선생님 두세 분을 추천해 드립니다. 막연히 배정하지 않고, 학생과 호흡이 맞는지를 먼저 봅니다. 함께 시작한 뒤 잘 맞지 않으면 추가 비용 없이 다른 선생님으로 다시 연결해 드립니다.`,
    },
    {
      h2: `상담부터 첫 수업까지`,
      body: `1) 무료 상담 신청 → 2) 상담 선생님이 1:1로 아이 상황을 듣고 → 3) ${region}에 맞는 선생님을 소개 → 4) 첫 수업을 체험해 보고 결정하면 됩니다. 바로 상담을 원하시면 ${CONSULT_PHONE} 으로 전화 주세요.`,
    },
  ];

  const faq = [
    {
      q: "선생님이 맞지 않으면 어떻게 하나요?",
      a: "추가 비용 없이 다른 선생님으로 다시 연결해 드립니다.",
    },
    {
      q: `${region}도 수업이 가능한가요?`,
      a: "네, 선생님과 학생의 호흡이 잘 맞을 수 있도록 자세한 상담을 통해 동선을 파악한 뒤 조율합니다.",
    },
    {
      q: "상담은 어떻게 진행되나요?",
      a: "상담 선생님이 1:1로 아이 상황을 듣고 맞는 선생님을 추천합니다.",
    },
  ];

  const metaTitle = `${region} ${subjectPhrase} 1:1 과외 | 지식의참견`;
  const metaDescription = `${region} ${subjectPhrase} 1:1 맞춤 과외. 직접 가르쳐 본 상담 선생님이 호흡 맞는 선생님을 연결합니다. 무료 상담 ${CONSULT_PHONE}.`;

  return {
    h1,
    intro,
    sections,
    faq,
    metaTitle,
    metaDescription,
    ogTitle: metaTitle,
  };
}
