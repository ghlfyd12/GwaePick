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

/**
 * 어학의참견 전용 상담 폼 경로 — /power 스코프 상담 CTA 의 도착지(단일 소스).
 * 지식의참견 도착지는 site.cta.href 그대로다(여기서 다루지 않는다).
 */
export const POWER_CONSULT_HREF = "/power/consult";

/**
 * /power(및 하위) 경로인지 — 상담 CTA·플로팅 버튼이 같은 기준으로 분기하도록 여기서만 판별한다.
 * pathname 이 null 이어도 안전하다(서비스 판별과 동일 규칙 재사용).
 */
export function isPowerPath(pathname: string | null | undefined): boolean {
  return serviceFromPath(pathname) === SERVICE.power;
}

export function isServiceName(v: unknown): v is ServiceName {
  return v === SERVICE.main || v === SERVICE.power;
}
