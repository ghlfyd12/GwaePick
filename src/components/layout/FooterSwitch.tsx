"use client";

import { usePathname } from "next/navigation";
import { isPowerPath } from "@/data/service";
import Footer from "@/components/layout/Footer";
import PowerFooter from "@/components/layout/PowerFooter";

/*
 * 경로별 푸터 선택 — /power(및 하위)는 어학 전용 PowerFooter, 그 외는 기존 메인 Footer.
 *
 * 루트 레이아웃이 <Footer /> 대신 이 스위치를 렌더한다. 메인 Footer.tsx 는 무수정(diff 없음)이며
 * 메인 경로에서는 그대로 그 컴포넌트가 렌더되므로 메인 푸터 출력은 동일하다.
 * 판별은 service.ts 단일 소스(헤더 CTA·플로팅·ConsultLink 와 같은 기준).
 */
export default function FooterSwitch() {
  return isPowerPath(usePathname()) ? <PowerFooter /> : <Footer />;
}
