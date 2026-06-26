/**
 * 과외 상위 카테고리(학교별·지역별·과목별) 안내 데이터 단일 소스.
 *
 * 향후 pSEO(지역×학년×과목 상세) 상위 카테고리. 컴포넌트에 카드 내용을 하드코딩하지 않는다.
 */
export interface CategoryItem {
  id: string;
  title: string;
  desc: string;
}

export const subjects: CategoryItem[] = [
  { id: "korean",  title: "국어", desc: "글의 구조부터 잡는 독해·서술형" },
  { id: "english", title: "영어", desc: "구문 독해와 어휘로 탄탄하게" },
  { id: "math",    title: "수학", desc: "개념 원리부터 오답 관리까지" },
  { id: "social",  title: "사회", desc: "흐름으로 이해하는 암기 과목" },
  { id: "science", title: "과학", desc: "현상 관찰에서 문제 적용까지" },
  { id: "history", title: "역사", desc: "흐름으로 꿰는 한국사·세계사" },
  { id: "essay",   title: "논술", desc: "읽고 생각을 글로 정리하는 힘" },
  { id: "coding",  title: "코딩", desc: "스스로 만들며 배우는 코딩" },
];

export const schoolLevels: CategoryItem[] = [
  { id: "elementary", title: "초등", desc: "기초와 공부 습관을 함께 잡는 시기" },
  { id: "middle",     title: "중등", desc: "약점 진단 후 맞춤 보강" },
  { id: "high",       title: "고등", desc: "내신·수능·수행 전략 관리" },
];

export const regions: CategoryItem[] = [
  { id: "daechi", title: "대치동", desc: "대치 지역 1:1 과외 상담" },
  { id: "mokdong", title: "목동", desc: "목동 지역 1:1 과외 상담" },
];
