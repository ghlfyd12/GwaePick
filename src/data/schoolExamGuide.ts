/**
 * 학교×과목 상세의 "내신·기출" 정보 섹션 카피 단일 소스(신규).
 *
 * 배경: 서치어드바이저에서 "OO고 내신 / OO고 기출 / OO고 수학교과서" 같은 정보 탐색
 *   질의가 노출되나 CTR 이 낮다(제목·스니펫에 내신·기출 정보 약속이 드러나지 않음).
 *   이 섹션은 고등학교 × 핵심 5과목(국·영·수·사·과) 페이지에만 렌더해 그 의도를 수용한다.
 *
 * 구성(옵션 C): 학교급×과목 "밑판" + 페이지별 주입(학교명·인근 학교·계열).
 *   - 밑판(SUBJECT_BASE): 과목별 도입 + 출제/기출 접근 문단 2변주(학교 slug 해시로 택1).
 *   - 계열(detectTrack): 학교명에 실제로 드러나는 유형만 분기(여학교·국제·과학·외국어·
 *     예술·체육·마이스터). 그 외는 '일반'으로 계열 문장을 생략한다.
 *   - 인근 학교: 같은 지역 학교명을 문장에 넣어 페이지별 차별화(내부 문맥, 링크 아님).
 *
 * 톤 규칙(반드시 준수):
 *   - 정보성·차분한 동료 교사 어투. 컨설턴트/멘토/강사 금지, 느낌표 금지.
 *   - 과장(최고·무조건·100%)·성과 보장(오른다·보장) 금지. "준비합니다/확인합니다/도움이 됩니다" 수준.
 *   - 실존 학교의 출제 경향·난이도를 단정하지 않는다. 학교명은 슬롯으로만 넣는다.
 */

import { hashSlug } from "@/lib/contentVariant";

/** 이 섹션 대상 과목 — 국·영·수·사·과. 고등학교에서만 렌더. */
export const EXAM_GUIDE_SUBJECTS: ReadonlySet<string> = new Set([
  "korean",
  "english",
  "math",
  "social",
  "science",
]);

/** 과목 밑판: 도입 1문단 + 출제/기출 접근 2변주(해시로 택1). {school} 슬롯 사용. */
const SUBJECT_BASE: Record<
  string,
  { intro: string; approach: [string, string] }
> = {
  korean: {
    intro:
      "고등학교 국어 내신은 문학·독서·화법과 작문까지 범위가 넓고, 학교마다 다루는 작품과 부교재가 다릅니다. {school} 국어는 학교 진도에 맞춰 배운 지문을 다시 정리하고, 기출에서 자주 나온 문제 유형을 함께 살펴보며 준비합니다.",
    approach: [
      "기출은 학교의 출제 방향을 읽는 자료가 됩니다. 지난 시험에서 어떤 지문과 유형이 나왔는지 확인하고, 서술형 배점이 큰 경우 답안을 직접 써 보는 연습까지 함께 준비합니다.",
      "내신 범위가 정해지면 교과서와 부교재 지문을 먼저 정리하고, 기출에서 반복된 유형부터 취약한 부분을 보강합니다. 시험이 가까워질수록 새로 배우기보다 정리에 무게를 둡니다.",
    ],
  },
  english: {
    intro:
      "고등학교 영어 내신은 교과서와 부교재, 모의고사 변형까지 학교마다 출제 범위가 다릅니다. {school} 영어는 학교 시험 범위에 맞춰 구문 독해와 어휘를 필요한 순서로 채우며 준비합니다.",
    approach: [
      "기출을 보면 지문 출처와 문항 유형의 경향이 드러납니다. 반복되는 어법 포인트와 서술형 유형을 정리하고, 부교재 지문은 변형 문제까지 함께 대비합니다.",
      "내신과 수능을 함께 준비해야 하는 시기에는 학습 균형을 먼저 설계합니다. 시험 범위 안의 지문을 정확히 해석하는 훈련을 우선하고, 남은 기간에 맞춰 취약 유형을 보강합니다.",
    ],
  },
  math: {
    intro:
      "고등학교 수학은 단원 간 연결이 강해 한 번 놓친 개념이 다음 단원까지 이어집니다. {school} 수학 내신은 시험 범위의 취약 단원을 먼저 진단하고 개념의 원리부터 다시 쌓으며 준비합니다.",
    approach: [
      "기출은 학교가 자주 내는 문제의 난이도와 유형을 보여 줍니다. 반복 출제되는 유형을 골라 풀이 과정을 점검하고, 틀린 문제는 다음 수업의 출발점으로 삼아 같은 유형에서 다시 막히지 않게 관리합니다.",
      "내신 시험은 범위가 정해져 있어 계획을 세우기 좋습니다. 단원별로 개념을 정리한 뒤 학교 기출과 유사 문제로 점검하고, 시험 직전에는 실전 형식으로 시간 관리까지 연습합니다.",
    ],
  },
  social: {
    intro:
      "고등학교 사회는 암기량이 많아 보이지만, 실제 시험은 개념 간 흐름과 자료 해석을 함께 묻습니다. {school} 사회 내신은 단원 구조를 먼저 잡고 원인과 결과의 흐름으로 정리하며 준비합니다.",
    approach: [
      "기출을 보면 학교가 자료 해석형과 서술형 중 어디에 무게를 두는지 드러납니다. 반복되는 개념과 자료 유형을 정리하고, 서술형은 핵심어를 넣어 답안을 구성하는 연습을 함께합니다.",
      "내신 범위가 정해지면 단원별 핵심 개념을 먼저 묶고, 기출에서 자주 나온 자료와 도표를 해석하는 훈련을 이어 갑니다. 수행평가 일정까지 학교 일정에 맞춰 준비합니다.",
    ],
  },
  science: {
    intro:
      "고등학교 과학은 개념 이해와 자료·그래프 해석이 함께 요구됩니다. {school} 과학 내신은 현상을 먼저 설명해 보게 하는 방식으로 개념을 다지고, 시험 범위의 실험과 자료 해석 문제를 단계별로 준비합니다.",
    approach: [
      "기출은 학교가 계산형과 개념형 중 어디에 무게를 두는지 보여 줍니다. 반복 출제되는 실험과 그래프 유형을 정리하고, 자주 틀리는 개념은 다시 설명해 보며 확인합니다.",
      "내신 범위가 정해지면 단원 개념을 먼저 정리한 뒤 학교 기출과 유사 문제로 점검합니다. 선택 과목과 학교 진도에 맞춰 다루는 범위를 조정합니다.",
    ],
  },
};

/** 학교명에 실제로 드러나는 계열만 감지(단정 회피). 없으면 null → 계열 문장 생략. */
function detectTrack(name: string): string | null {
  if (/여고|여자고/.test(name)) return "female";
  if (/국제고/.test(name)) return "국제";
  if (/과학고/.test(name)) return "과학";
  if (/외국어고|외고/.test(name)) return "외국어";
  if (/예술고|예고/.test(name)) return "예술";
  if (/체육고|체고/.test(name)) return "체육";
  if (/마이스터/.test(name)) return "마이스터";
  return null;
}

/** 계열 문장(주입) — 감지된 유형만. 학교 분위기·학습 부담을 안전하게 서술(출제 단정 없음). */
function trackClause(track: string | null, displayName: string): string | null {
  if (!track) return null;
  // displayName 은 항상 고등학교명(…고/…고등학교)으로 끝나 받침이 없다 → 조사 "는".
  if (track === "female") {
    return `${displayName}는 여학생이 다니는 학교입니다. 학교 분위기와 시험 출제 방식을 상담에서 함께 확인해 맞는 선생님을 연결해 드립니다.`;
  }
  return `${displayName}는 ${track} 계열 학교로, 일반 교과와 계열 과정을 함께 준비해야 하는 부담이 있습니다. 시험 기간에는 과목별 우선순위를 정해 준비하는 것이 도움이 됩니다.`;
}

/** 인근 학교 문장(주입) — 같은 지역 학교명 2곳을 문맥에 넣어 페이지별 차별화. */
function nearbyClause(
  sigunguName: string,
  subjectLabel: string,
  nearby: { name: string }[],
): string | null {
  const names = nearby.slice(0, 2).map((s) => s.name);
  if (names.length === 0) return null;
  return `${sigunguName}에서는 ${names.join("·")} 등 인근 학교 재학생도 각자 학교 진도와 시험 범위에 맞춰 ${subjectLabel} 내신을 준비합니다.`;
}

export interface SchoolExamGuide {
  heading: string;
  paragraphs: string[];
}

/**
 * 고교 × 핵심5과목만 내신·기출 섹션 데이터 반환. 그 외 조합은 null(섹션 미렌더).
 * @param levelLabel schools.ts 의 라벨("고등학교"/"중학교"/"초등학교")
 */
export function buildSchoolExamGuide(params: {
  schoolSlug: string;
  schoolName: string;
  displayName: string;
  levelLabel: string;
  sigunguName: string;
  subjectSlug: string;
  subjectLabel: string;
  nearby: { name: string }[];
}): SchoolExamGuide | null {
  const {
    schoolSlug,
    schoolName,
    displayName,
    levelLabel,
    sigunguName,
    subjectSlug,
    subjectLabel,
    nearby,
  } = params;

  if (levelLabel !== "고등학교") return null;
  const base = SUBJECT_BASE[subjectSlug];
  if (!base || !EXAM_GUIDE_SUBJECTS.has(subjectSlug)) return null;

  const heading = `${schoolName} ${subjectLabel} 내신·기출 대비`;
  const approach = base.approach[hashSlug(schoolSlug) % 2];
  const track = trackClause(detectTrack(displayName), displayName);
  const near = nearbyClause(sigunguName, subjectLabel, nearby);

  const paragraphs = [
    base.intro.replace("{school}", schoolName),
    approach,
    ...(track ? [track] : []),
    ...(near ? [near] : []),
  ];

  return { heading, paragraphs };
}
