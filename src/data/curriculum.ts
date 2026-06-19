/**
 * Curriculum(중단) 섹션 데이터 단일 소스.
 *
 * 좌우 2단: 왼쪽 = 원래 디자인 이미지(제목 포함 1장), 오른쪽 = '이런 고민이라면' 6가지 체크.
 * (이전의 코드 그래픽 — 육각형/막대그래프/상승 애니메이션 — 은 제거됨.)
 *
 * ⚠️ 이미지는 금지어를 "맞춤 상담"으로 고친 수정본을 사용한다(원본 그대로 금지).
 * ⚠️ 실제 이미지로 교체할 때 width/height 를 실제 픽셀 크기로 맞추면 비율이 정확해진다.
 */

/** 오른쪽 '이런 고민이라면' 한 줄. before + (주황 강조)keyword + after 로 렌더. */
export type ConcernItem = {
  /** 아이콘 키 — Curriculum.tsx 의 ConcernIcon 에 대응 */
  icon: "trending" | "award" | "compass" | "target" | "heart" | "bulb";
  /** 강조 앞부분 */
  before: string;
  /** 주황(accent) 강조 키워드 */
  keyword: string;
  /** 강조 뒷부분 */
  after: string;
};

export const curriculum = {
  /** 화면엔 숨기고 검색엔진/접근성용으로만 노출하는 제목(이미지 안에 시각적 제목 포함). */
  srTitle: "성적대별 1:1 맞춤 커리큘럼",

  /** 왼쪽: 원래 디자인 이미지(제목 포함 1장). */
  graphic: {
    src: "/images/curriculum-graphic.png",
    alt: "성적대별 1:1 맞춤 커리큘럼 안내 — 상위권 성적 굳히기, 중하위권 탈출하기, 특목고·최상위권대학 합격하기",
    /** 이미지 원본 픽셀 크기(비율 계산용). */
    width: 945,
    height: 683,
    /** 렌더 최대 폭(px) — 원본 폭(945)에 맞춰 업스케일 방지. 더 크게/작게는 이 값만 조절. */
    maxWidthPx: 945,
  },

  /** 오른쪽: '이런 고민이라면' 체크 블록. 키워드만 주황 강조. */
  concerns: {
    title: "이런 고민 중이라면, 지금 함께 하세요!",
    subtitle: "더 나은 학교생활과 꿈을 위한 6가지 체크포인트",
    items: [
      { icon: "trending", before: "공부는 하지만 ", keyword: "성적이 오르지 않는", after: " 학생" },
      { icon: "award", before: "지금보다 더 ", keyword: "상위권으로", after: " 올라가고 싶은 학생" },
      { icon: "compass", before: "어디서부터 ", keyword: "공부를 시작", after: "해야 할지 모르는 학생" },
      { icon: "target", before: "목표를 잡아주고 성적으로 ", keyword: "결과가 나오길", after: " 바라는 학생" },
      { icon: "heart", before: "학업에 대한 ", keyword: "흥미나 의욕", after: "이 낮은 학생" },
      { icon: "bulb", before: "집중력이 부족해 ", keyword: "자기주도학습", after: "이 안 되는 학생" },
    ] satisfies ConcernItem[],
  },
} as const;
