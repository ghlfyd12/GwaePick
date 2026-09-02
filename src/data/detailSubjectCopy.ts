/**
 * 과학·사회·역사 세부 과목 키워드 보강 단일 소스(신규) — subjects.ts 무수정, 오버라이드만.
 *
 * 통합 과목(과학·사회·역사) 페이지가 "{학교} 물리과외" 같은 세부 과목 검색어를 받도록,
 *  - title: 접미 키워드(내신대비 기출…)를 세부 과목 대표 세트로 교체(science/social/history만),
 *  - description: 말미에 세부 과목 나열 1문장 append,
 *  - 본문: 커리큘럼 직후 h2+p 세부 과목 섹션(확정 카피, 학교/지역 변수만 치환).
 *
 * 규칙: 학교별 출제 경향 단정 금지, 성과 보장·느낌표 금지, 호칭은 선생님/상담.
 */

export interface DetailSubjectCopy {
  /** title 접미 교체 키워드(초등·기본). 세부 과목 나열은 여기(초등 보류분)에만 남긴다. */
  titleKeyword: string;
  /**
   * 중·고 title 접미 키워드(수학 형식 — "내신대비 … 교과서 기출 1:1 맞춤지도").
   * 지정된 과목(science·social)만 중·고에서 title 세부 과목 나열을 제거하고 이 값으로 대체.
   * 미지정 과목(history)은 초등·중·고 모두 titleKeyword 사용.
   */
  titleKeywordMidHigh?: string;
  /** description 말미 append 문장(세부 과목 전체 나열) — title 과 무관, 유지. */
  descTail: string;
  /** 본문 세부 과목 섹션(확정 카피). {region} 슬롯 = 학교명 또는 지역명. */
  heading: string;
  /** 본문 단락. 지역/학교 무관 공통 문안(변수 치환 없음 — 확정 카피 그대로). */
  body: string;
}

/** 과목 slug → 세부 과목 카피. 여기 있는 과목(science/social/history)만 오버라이드된다. */
export const detailSubjectCopy: Record<string, DetailSubjectCopy> = {
  science: {
    titleKeyword: "물리 화학 생명과학 지구과학",
    titleKeywordMidHigh: "내신대비 물리 화학 교과서 기출 1:1 맞춤지도",
    descTail: "물리·화학·생명과학·지구과학 등 선택 과목별로 준비합니다.",
    heading: "물리·화학·생명과학·지구과학까지 과목별로 준비합니다",
    body: "고등 과학은 물리학, 화학, 생명과학, 지구과학으로 나뉘고 선택 과목에 따라 준비 방식이 다릅니다. 상담에서 현재 선택 과목과 학교 진도를 확인하고, 해당 과목 지도 경험이 있는 선생님을 연결해 드립니다. 중등 과학은 통합 과정을 기준으로 취약 단원부터 잡아 갑니다.",
  },
  social: {
    titleKeyword: "생활과 윤리 사회문화 한국지리",
    titleKeywordMidHigh: "내신대비 한국사 사회문화 교과서 기출 1:1 맞춤지도",
    descTail: "생활과 윤리·사회문화·한국지리·정치와 법·윤리와 사상 등 선택 과목별로 준비합니다.",
    heading: "생활과 윤리·사회문화·한국지리까지 과목별로 준비합니다",
    body: "고등 사회는 생활과 윤리, 사회문화, 한국지리, 정치와 법, 윤리와 사상 등 선택 과목별로 출제 범위와 준비 방식이 다릅니다. 상담에서 선택 과목을 확인하고 해당 과목을 지도해 온 선생님을 연결해 드립니다. 중등 사회는 학교 진도에 맞춰 개념의 흐름부터 정리합니다.",
  },
  history: {
    titleKeyword: "한국사 동아시아사 세계사",
    descTail: "한국사·동아시아사·세계사 등 과목별로 준비합니다.",
    heading: "한국사·동아시아사·세계사까지 과목별로 준비합니다",
    body: "역사는 한국사, 동아시아사, 세계사로 나뉘며 수능 필수인 한국사부터 선택 과목까지 범위가 다릅니다. 상담에서 준비 중인 과목과 학교 진도를 확인하고 맞는 선생님을 연결해 드립니다.",
  },
};

/** 경기 pSEO(@/data/pseo)는 한글 subject slug("과학")를 쓰므로 영문 키로 별칭 매핑(NFC 정규화). */
const KOREAN_ALIAS = new Map<string, string>(
  [
    ["과학", "science"],
    ["사회", "social"],
    ["역사", "history"],
  ].map(([k, v]) => [k.normalize("NFC"), v]),
);

/** 세부 과목 오버라이드 대상 과목인지(영문 slug 또는 경기 한글 slug 모두 허용, NFC 안전). */
export function getDetailSubjectCopy(subjectSlug?: string): DetailSubjectCopy | null {
  if (!subjectSlug) return null;
  const s = subjectSlug.normalize("NFC");
  const key = detailSubjectCopy[s] ? s : KOREAN_ALIAS.get(s);
  return (key && detailSubjectCopy[key]) || null;
}
