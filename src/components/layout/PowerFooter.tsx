import Link from "next/link";
import { site } from "@/data/site";
import { SERVICE } from "@/data/service";
import {
  powerFooterGroups,
  powerFooterSido,
  powerFooterGu,
  POWER_REGION_FOOTER_SUBJECTS,
  type RegionRow,
} from "@/data/powerFooterLinks";

const enc = (s: string) => encodeURIComponent(s);

/** 지역 1행 — 굵은 허브 링크 + 회화 3종(· 구분). 앵커 텍스트에 지역명 포함. */
function RegionLine({ row }: { row: RegionRow }) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
      <Link
        href={`/power/${enc(row.slug)}`}
        className="break-keep text-[13px] font-semibold text-ink transition-colors hover:text-accent"
      >
        {row.label}
      </Link>
      <span className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
        {POWER_REGION_FOOTER_SUBJECTS.map((subj, i) => (
          <span key={subj.slug} className="inline-flex items-baseline gap-x-1.5">
            {i > 0 && (
              <span aria-hidden className="text-line">
                ·
              </span>
            )}
            <Link
              href={`/power/by-region/${enc(row.slug)}/${subj.slug}`}
              className="break-keep text-[13px] leading-relaxed text-muted transition-colors hover:text-accent hover:underline"
            >
              {row.label} {subj.label}
            </Link>
          </span>
        ))}
      </span>
    </div>
  );
}

/*
 * 어학의참견(/power) 전용 푸터 — 메인 지식의참견 푸터(Footer.tsx)와 분리된 4열.
 *
 * FooterSwitch(client)가 /power(및 하위)에서만 이 컴포넌트를 렌더한다. 메인 푸터는 그대로.
 * 색은 accent 토큰만 — /power 스코프(.power-theme)에서 퍼플로 렌더된다(코랄 하드코딩 없음).
 * 톤·구조는 메인 푸터와 맞추되, 링크 그룹·브랜드명·태그라인만 어학의참견 기준이다.
 */
const POWER_TAGLINE =
  "회화부터 어학시험·입시까지\n원어민·교포 선생님과 1:1로 맞춰 시작합니다.";

export default function PowerFooter() {
  return (
    <footer className="border-t border-line bg-surface-alt">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        {/* ── 지역별 어학과외(전폭) — 시도 17 + 주요 구 12 × 회화 3종 ── */}
        <section aria-label="지역별 어학과외">
          <p className="break-keep text-sm font-semibold text-ink">지역별 어학과외</p>
          <ul className="mt-3 grid grid-cols-1 gap-x-8 gap-y-1.5 md:grid-cols-2">
            {powerFooterSido.map((row) => (
              <li key={row.slug}>
                <RegionLine row={row} />
              </li>
            ))}
          </ul>

          <p className="mt-6 break-keep text-sm font-semibold text-ink">주요 지역 어학과외</p>
          <ul className="mt-3 grid grid-cols-1 gap-x-8 gap-y-1.5 md:grid-cols-2">
            {powerFooterGu.map((row) => (
              <li key={row.slug}>
                <RegionLine row={row} />
              </li>
            ))}
          </ul>
        </section>

        <hr className="my-10 border-line" />

        {/* 사이트와이드 내부 링크 — 전 /power 페이지 렌더 크롤 경로 */}
        <nav
          aria-label="어학의참견 사이트 링크"
          className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3"
        >
          {powerFooterGroups.map((group) => (
            <div key={group.title}>
              <p className="break-keep text-sm font-semibold text-ink">{group.title}</p>
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

        <p className="mt-8 text-lg font-bold text-accent">{SERVICE.power}</p>
        <p className="mt-3 max-w-md whitespace-pre-line break-keep text-sm leading-relaxed text-ink">
          {POWER_TAGLINE}
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
          © {site.copyrightYear} {SERVICE.power}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
