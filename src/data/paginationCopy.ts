/**
 * 페이지네이션 컨트롤 카피(분리). 컴포넌트 하드코딩 금지.
 */
export const PAGE_NAV = {
  label: "페이지 목록",
  first: "처음",
  prev: "이전",
  next: "다음",
  last: "마지막",
  /** 모바일 축약 표기. */
  current: (page: number, total: number) => `${page} / ${total}`,
  /** 번호 링크 aria-label. */
  pageAria: (n: number) => `${n}페이지`,
} as const;
