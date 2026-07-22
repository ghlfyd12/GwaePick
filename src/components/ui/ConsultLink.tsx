"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { POWER_CONSULT_HREF, isPowerPath } from "@/data/service";
import { site } from "@/data/site";

/*
 * 경로에 따라 도착지가 갈리는 상담 링크.
 *  - /power(및 하위) → 어학 전용 폼(/power/consult)
 *  - 그 외 → 메인 지식의참견 폼(site.cta.href)
 *
 * 서버 컴포넌트(푸터 등) 안에서 이 링크 하나만 client 로 두려고 분리했다.
 * 판별·도착지는 service.ts 단일 소스를 쓰므로 헤더 CTA·플로팅 버튼과 항상 같은 기준이다.
 */
export default function ConsultLink({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const href = isPowerPath(usePathname()) ? POWER_CONSULT_HREF : site.cta.href;
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
