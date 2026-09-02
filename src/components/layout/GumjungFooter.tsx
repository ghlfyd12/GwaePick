import Link from "next/link";
import { site } from "@/data/site";
import { SERVICE } from "@/data/service";
import {
  gumjungFooterGroups,
  gumjungFooterRegions,
} from "@/data/gumjungFooterLinks";

const enc = (s: string) => encodeURIComponent(s);

/*
 * 검고의참견(/gumjung) 전용 푸터 — 메인·어학 푸터와 분리된 브랜드 푸터.
 *
 * FooterSwitch(client)가 /gumjung(및 하위)에서만 이 컴포넌트를 렌더한다. 메인·어학 푸터는 그대로.
 * 색은 accent 토큰만 — /gumjung 스코프(.gumjung-theme)에서 청록으로 렌더된다(하드코딩 없음).
 */
const GUMJUNG_TAGLINE =
  "학교 밖에서 다시 시작하는 준비\n출제 범위에 맞춰 필요한 것부터 1:1로 채웁니다.";

export default function GumjungFooter() {
  return (
    <footer className="border-t border-line bg-surface-alt">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        {/* 지역 샘플 — 전체는 /gumjung/regions */}
        <section aria-label="지역별 검정고시">
          <div className="flex items-center justify-between gap-3">
            <p className="break-keep text-sm font-semibold text-ink">
              지역별 검정고시
            </p>
            <Link
              href="/gumjung/regions"
              className="shrink-0 break-keep text-[13px] font-semibold text-accent transition-colors hover:underline"
            >
              지역 전체 보기 →
            </Link>
          </div>
          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
            {gumjungFooterRegions.map((r) => (
              <li key={r.href}>
                <Link
                  href={`/gumjung/by-region/${enc(r.label)}`}
                  className="break-keep text-[13px] text-muted transition-colors hover:text-accent hover:underline"
                >
                  {r.label} 검정고시
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <hr className="my-10 border-line" />

        <nav
          aria-label="검고의참견 사이트 링크"
          className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3"
        >
          {gumjungFooterGroups.map((group) => (
            <div key={group.title}>
              <p className="break-keep text-sm font-semibold text-ink">
                {group.title}
              </p>
              <ul className="mt-3 space-y-2">
                {group.links.map((link) => (
                  <li key={`${group.title}-${link.href}-${link.label}`}>
                    <Link
                      href={link.href}
                      className="break-keep text-[13px] leading-relaxed text-muted transition-colors hover:text-accent hover:underline"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <hr className="mt-10 border-line" />

        <p className="mt-8 text-lg font-bold text-accent">{SERVICE.gumjung}</p>
        <p className="mt-3 max-w-md whitespace-pre-line break-keep text-sm leading-relaxed text-ink">
          {GUMJUNG_TAGLINE}
        </p>

        <dl className="mt-8 grid gap-2 text-sm text-muted sm:grid-cols-2">
          <div className="flex gap-2">
            <dt className="font-medium text-ink">상담 문의</dt>
            <dd>{site.contact.phone}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="font-medium text-ink">이메일</dt>
            <dd>{site.contact.email}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="font-medium text-ink">카카오톡</dt>
            <dd>{site.contact.kakao}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="font-medium text-ink">운영 시간</dt>
            <dd>{site.contact.hours}</dd>
          </div>
        </dl>

        <p className="mt-10 text-xs text-muted">
          © {site.copyrightYear} {SERVICE.gumjung}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
