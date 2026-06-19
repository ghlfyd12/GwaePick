import { site } from "@/data/site";

/*
 * 푸터.
 * - 사이트명 / 슬로건 / 연락처 placeholder / 저작권 표기
 * - 어두운 배경 금지 — 밝은 회색 톤으로 차분하게
 */
export default function Footer() {
  return (
    <footer className="border-t border-line bg-surface-alt">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <p className="text-lg font-bold text-accent">{site.name}</p>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-ink">
          {site.slogan}
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
