"use client";

import { usePathname } from "next/navigation";

/*
 * RootShell — <body> 하위 전체(헤더·본문·푸터·플로팅)를 감싸는 얇은 클라이언트 래퍼.
 *  - /power(및 하위) 경로에서만 .power-theme 를 붙여 accent 토큰을 퍼플로 스코프한다.
 *    → 공유 컴포넌트(헤더 CTA·플로팅 버튼·상담 폼 등)도 /power 에서만 퍼플, 메인은 코랄.
 *  - display:contents(래퍼가 레이아웃 박스를 만들지 않음)라 <body> 의 flex 레이아웃과
 *    sticky 헤더 동작은 그대로 유지된다. CSS 변수는 contents 요소를 통해서도 상속된다.
 *  - usePathname 은 SSR 시에도 현재 경로를 반환하므로 첫 페인트부터 색이 정확하다(깜빡임 없음).
 */
const POWER_PATH = "/power";
const GUMJUNG_PATH = "/gumjung";

export default function RootShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isPower =
    pathname === POWER_PATH || pathname.startsWith(`${POWER_PATH}/`);
  const isGumjung =
    pathname === GUMJUNG_PATH || pathname.startsWith(`${GUMJUNG_PATH}/`);
  const themeClass = isPower ? " power-theme" : isGumjung ? " gumjung-theme" : "";

  return <div className={`contents${themeClass}`}>{children}</div>;
}
