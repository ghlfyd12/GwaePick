/**
 * 서비스 구분 — 지식의참견(메인) / 어학의참견(/power). 상담 리드에 어느 서비스에서 왔는지 표시.
 * 클라이언트·서버 양쪽에서 import(서버 전용 의존성 없음). 오타 방지를 위해 값은 여기서만 정의.
 */
export const SERVICE = {
  main: "지식의참견",
  power: "어학의참견",
} as const;

export type ServiceName = (typeof SERVICE)[keyof typeof SERVICE];

export const ALL_SERVICES: readonly ServiceName[] = [SERVICE.main, SERVICE.power];

/** 현재 경로로 서비스 판별 — /power(및 하위)면 어학의참견, 그 외 지식의참견. */
export function serviceFromPath(pathname: string | null | undefined): ServiceName {
  const p = pathname ?? "";
  return p === "/power" || p.startsWith("/power/") ? SERVICE.power : SERVICE.main;
}

export function isServiceName(v: unknown): v is ServiceName {
  return v === SERVICE.main || v === SERVICE.power;
}
