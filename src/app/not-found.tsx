"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "@/data/site";
import { POWER_CONSULT_HREF, isPowerPath } from "@/data/service";

/*
 * 전역 404(not-found) — 루트 layout 안에 렌더된다(헤더·푸터·플로팅·RootShell 상속).
 * 브랜드 분기는 usePathname 단일 기준(isPowerPath): /power(및 하위)는 어학의참견 문구·링크,
 * 그 외는 지식의참견. 색은 accent 토큰만 — /power 스코프(.power-theme)에서 자동 퍼플, 메인은 코랄.
 * HTTP 상태코드는 Next 가 404 로 유지한다(소프트 404 아님).
 */

const MAIN_LINKS = [
  { label: "지역별 과외 보기", href: "/tutoring/by-region" },
  { label: "학교별 과외 보기", href: "/tutoring/by-school" },
  { label: "과목별 과외 보기", href: "/tutoring/by-subject" },
];

const POWER_LINKS = [
  { label: "지역별 보기", href: "/power/regions" },
  { label: "영어", href: "/power/english" },
  { label: "일본어", href: "/power/japanese" },
];

const MAIN_BODY =
  "주소가 바뀌었거나 잘못 입력된 페이지입니다. 아래에서 찾으시는 내용으로 이동할 수 있습니다.";
const POWER_BODY =
  "주소가 바뀌었거나 잘못 입력된 페이지입니다. 지역 이름은 시군구 단위로 찾을 수 있습니다. (예: 해운대구, 부산 중구)";

export default function NotFound() {
  const isPower = isPowerPath(usePathname());
  const links = isPower ? POWER_LINKS : MAIN_LINKS;
  const body = isPower ? POWER_BODY : MAIN_BODY;
  const ctaHref = isPower ? POWER_CONSULT_HREF : site.cta.href;

  return (
    <section className="mx-auto flex max-w-2xl flex-col items-center px-5 py-20 text-center sm:px-6 sm:py-28">
      <p className="text-5xl font-bold text-accent sm:text-6xl">404</p>
      <h1 className="mt-5 break-keep text-2xl font-bold leading-snug text-ink sm:text-3xl">
        페이지를 찾을 수 없습니다
      </h1>
      <p className="mx-auto mt-4 max-w-xl break-keep text-base leading-relaxed text-muted sm:text-lg">
        {body}
      </p>

      <ul className="mt-8 flex flex-wrap justify-center gap-3">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="inline-flex min-h-12 items-center break-keep rounded-full border border-accent/40 bg-white px-5 py-2.5 text-sm font-semibold text-accent transition-colors hover:border-accent hover:bg-accent/5 sm:text-base"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-8">
        <Link
          href={ctaHref}
          className="inline-flex min-h-14 items-center justify-center rounded-full bg-accent px-8 text-base font-semibold text-white shadow-md transition-colors hover:bg-accent-dark sm:text-lg"
        >
          {site.cta.label}
        </Link>
      </div>
    </section>
  );
}
