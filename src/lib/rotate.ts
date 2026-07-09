/**
 * 문자열 키 기반 안정 선택 유틸(배포 간 동일 결과).
 *
 * pSEO 대량 페이지에서 문구 변주(로테이션)를 고정 시드로 고르기 위한 공용 헬퍼.
 * lib/seo.ts 의 description 로테이션과 동일 계열(31-해시)이며, 다른 섹션에서도 재사용한다.
 */

/** 문자열 → 32비트 해시(코드포인트 누적, 배포 간 안정). */
export function hashKey(key: string): number {
  let h = 0;
  for (const ch of key) h = (h * 31 + (ch.codePointAt(0) ?? 0)) >>> 0;
  return h;
}

/** 키 해시로 배열에서 항상 같은 1개를 고른다(빈 배열이면 undefined). */
export function pickByHash<T>(arr: readonly T[], key: string): T {
  return arr[hashKey(key) % arr.length];
}
