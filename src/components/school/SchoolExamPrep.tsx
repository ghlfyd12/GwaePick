import type { SchoolContentVariant } from "@/data/schoolContent";
import { CONSULT_PHONE } from "@/data/dongPageCopy";

/*
 * SchoolExamPrep — "시험 대비, 이렇게 관리합니다" 섹션(하단 상담 CTA 포함).
 * 콘텐츠는 schoolContent.ts(학교급×과목 변형)에서 주입받고, {school} 슬롯만 학교명으로 치환한다.
 * CTA 는 기존 학교 상세 페이지와 동일하게 #consult 앵커(하단 ConsultForm)로 연결한다.
 */
export default function SchoolExamPrep({
  schoolName,
  examPrep,
}: {
  schoolName: string;
  examPrep: SchoolContentVariant["examPrep"];
}) {
  const fill = (s: string) => s.replaceAll("{school}", schoolName);

  return (
    <section>
      <h2 className="break-keep text-xl font-bold text-ink sm:text-2xl">{fill(examPrep.title)}</h2>

      <div className="mt-4 space-y-3">
        {examPrep.paragraphs.map((p, i) => (
          <p key={i} className="break-keep text-base leading-relaxed text-muted sm:text-lg">
            {fill(p)}
          </p>
        ))}
      </div>

      <ol className="mt-5 space-y-3">
        {examPrep.steps.map((step, i) => (
          <li
            key={i}
            className="flex items-start gap-4 rounded-2xl border border-line bg-white p-4"
          >
            <span className="shrink-0 rounded-full bg-accent/10 px-3 py-1 text-sm font-bold text-accent">
              {i + 1}단계
            </span>
            <p className="break-keep text-base leading-relaxed text-ink">{fill(step)}</p>
          </li>
        ))}
      </ol>

      {/* 섹션 하단 상담 CTA — 기존 동선(#consult) 재사용 */}
      <div className="mt-6 rounded-2xl bg-surface px-6 py-7 text-center">
        <p className="break-keep text-base font-medium leading-relaxed text-ink sm:text-lg">
          {schoolName} 시험 관리, 어디서부터 시작할지 함께 짚어 드립니다.
        </p>
        <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href="#consult"
            className="inline-flex min-h-14 w-full max-w-xs items-center justify-center rounded-full bg-accent px-7 py-3 text-base font-semibold text-white shadow-md transition-colors hover:bg-accent-dark sm:w-auto sm:text-lg"
          >
            무료 상담 신청
          </a>
          <a
            href={`tel:${CONSULT_PHONE}`}
            className="inline-flex min-h-14 w-full max-w-xs items-center justify-center rounded-full border-2 border-accent bg-white px-7 py-3 text-base font-bold text-accent transition-colors hover:bg-accent/5 sm:w-auto sm:text-lg"
          >
            {CONSULT_PHONE}
          </a>
        </div>
      </div>
    </section>
  );
}
