/**
 * 페이지네이션 순수 유틸(결정론적). 컴포넌트 인라인 금지 — 목록 분할·번호창을 한 곳에서.
 */

export type Paged<T> = {
  items: T[];
  page: number;
  totalPages: number;
  total: number;
  size: number;
};

/** items 를 size 개씩 나눠 page(1-base) 슬라이스를 반환. page 는 [1, totalPages] 로 클램프. */
export function paginate<T>(items: readonly T[], page: number, size: number): Paged<T> {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / size));
  const p = Math.min(Math.max(1, Math.trunc(page) || 1), totalPages);
  return { items: items.slice((p - 1) * size, p * size), page: p, totalPages, total, size };
}

/** 총 페이지 수(항목 0개면 1). */
export function pageCount(total: number, size: number): number {
  return Math.max(1, Math.ceil(total / size));
}

/**
 * 번호창 — 현재 페이지 ±span + 처음/끝, 사이가 벌어지면 "ellipsis".
 * 예) page=5,total=54,span=2 → [1,"ellipsis",3,4,5,6,7,"ellipsis",54]
 */
export function pageNumbers(
  page: number,
  totalPages: number,
  span = 2,
): (number | "ellipsis")[] {
  const set = new Set<number>([1, totalPages]);
  for (let i = page - span; i <= page + span; i += 1) {
    if (i >= 1 && i <= totalPages) set.add(i);
  }
  const sorted = [...set].sort((a, b) => a - b);
  const out: (number | "ellipsis")[] = [];
  for (let i = 0; i < sorted.length; i += 1) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) out.push("ellipsis");
    out.push(sorted[i]);
  }
  return out;
}
