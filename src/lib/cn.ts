/**
 * 조건부 className 을 공백으로 합치는 작은 헬퍼.
 * 외부 의존성 없이 falsy 값을 걸러낸다. (clsx 대체)
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
