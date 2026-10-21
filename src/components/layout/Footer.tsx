import Link from "next/link";
import ConsultLink from "@/components/ui/ConsultLink";
import { site } from "@/data/site";
import { footerGroups, REGION_GROUP_TITLE } from "@/data/footerLinks";

/*
 * 푸터.
 * - 상단: 사이트와이드 내부 링크 그룹(지역·과목·바로가기·어학) — 정적 <a>, 크롤 경로 공급(내부 링크 감사 P1-a)
 * - 하단: 사이트명 / 슬로건 / 연락처 / 저작권 표기
 * - 어두운 배경 금지 — 밝은 회색 톤으로 차분하게. 링크는 중립 회색 기본, 호버에만 accent(경로별 코랄/퍼플).
 *
 * collapseRegions: 상세 페이지에서 "지역별 과외"(전국 17개 시도) 그룹을 접는다. `details/summary` 라
 * JS 없이도 펼칠 수 있고, 접힌 상태에서도 링크가 DOM 에 남아 크롤 경로가 보존된다(표시만 토글).
 */
export default function Footer({ collapseRegions = false }: { collapseRegions?: boolean }) {
  return (
    <footer className="border-t border-line bg-surface-alt">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        {/* 사이트와이드 내부 링크 — 전 페이지 렌더 크롤 경로 */}
        <nav
          aria-label="사이트 링크"
          className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 md:grid-cols-4"
        >
          {footerGroups.map((group) => {
            const collapsed = collapseRegions && group.title === REGION_GROUP_TITLE;
            const list = (
              // 접힘 상태 표시 토글은 CSS 로 명시한다 — 이 환경에서는 details 의 UA 기본
              // 숨김이 적용되지 않아 링크가 그대로 보였다. [open] 기반이라 JS 없이도 펼쳐진다.
              <ul className={collapsed ? "mt-3 hidden space-y-2 group-open:block" : "mt-3 space-y-2"}>
                {group.links.map((link) => {
                  const cls =
                    "break-keep text-[13px] leading-relaxed text-muted transition-colors hover:text-accent hover:underline";
                  return (
                    <li key={`${group.title}-${link.href}-${link.label}`}>
                      {/* 상담 링크만 경로별 도착지가 갈린다(/power → 어학 전용 폼). 나머지는 정적 <a>. */}
                      {link.href === site.cta.href ? (
                        <ConsultLink className={cls}>{link.label}</ConsultLink>
                      ) : (
                        <Link href={link.href} className={cls}>
                          {link.label}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            );
            return (
              <div key={group.title}>
                {collapsed ? (
                  <details className="group">
                    <summary className="cursor-pointer list-none break-keep text-sm font-semibold text-ink marker:content-none">
                      전국 지역별 과외 보기
                      <span aria-hidden="true" className="ml-1 text-muted group-open:hidden">+</span>
                      <span aria-hidden="true" className="ml-1 text-muted hidden group-open:inline">−</span>
                    </summary>
                    {list}
                  </details>
                ) : (
                  <>
                    <p className="break-keep text-sm font-semibold text-ink">{group.title}</p>
                    {list}
                  </>
                )}
              </div>
            );
          })}
        </nav>

        <hr className="mt-10 border-line" />

        <p className="mt-8 text-lg font-bold text-accent">{site.name}</p>
        <p className="mt-3 max-w-md whitespace-pre-line break-keep text-sm leading-relaxed text-ink">
          {site.footerTagline}
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
          © {site.copyrightYear} {site.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
