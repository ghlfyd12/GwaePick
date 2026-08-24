import Link from "next/link";
import ConsultForm from "@/components/ConsultForm";
import SchoolRegionLinks from "@/components/SchoolRegionLinks";
import { subjectBySlug } from "@/data/subjects";
import { CONSULT_PHONE, STEPS, TRUST } from "@/data/dongPageCopy";
import { buildSchoolFaq } from "@/data/schoolDetailCopy";
import { HUB_SUBJECT_SLUGS, buildHubIntro, buildHubGuide } from "@/data/schoolHubCopy";
import { schoolDetailHref } from "@/lib/schoolHref";

/*
 * SchoolHub — 학교 단위 허브(/tutoring/by-school/{학교}, 과목 없음). 고교 파일럿.
 * "{학교} 과외"(과목 없는 헤드 검색어) 수신 + 과목별 상세로 내부 링크를 뿌리는 노드.
 * 상세(SchoolSubjectDetail)와 디자인 톤 공유, 콘텐츠만 과목 중립.
 */
export default function SchoolHub({
  schoolSlug,
  schoolName,
  schoolFullName,
  levelLabel,
  sidoLabel,
  sidoSlug,
  sigunguName,
  otherSchools,
}: {
  schoolSlug: string;
  schoolName: string;
  /** 약칭→정식명(page.tsx 에서 expandSchoolName). 없으면 null → 약칭만. */
  schoolFullName: string | null;
  levelLabel: string;
  sidoLabel: string;
  sidoSlug: string;
  sigunguName: string;
  otherSchools: { name: string; slug: string }[];
}) {
  const region = `${sidoLabel} ${sigunguName}`;
  const displayName = schoolFullName ?? schoolName;
  // H1: "정식명(약칭) 과외" — 정식명 없으면 약칭만.
  const h1Head = schoolFullName ? `${schoolFullName}(${schoolName})` : schoolName;

  // 과목 카드 — 고교 핵심 5과목만, 각 카드는 학교×과목 상세로.
  const subjectCards = HUB_SUBJECT_SLUGS.map((slug) => subjectBySlug[slug]).filter(
    Boolean,
  );

  const intro = buildHubIntro(displayName, sigunguName);
  const guide = buildHubGuide(displayName);
  const faq = buildSchoolFaq(schoolName, levelLabel);
  const consultMessage = `${schoolName} 과외 문의드립니다.`;

  const otherSchoolLinks = otherSchools
    .slice(0, 12)
    .map((s) => ({ label: s.name, href: `/tutoring/by-school/${s.slug}` }));

  return (
    <>
      {/* 브레드크럼 */}
      <nav aria-label="현재 위치" className="border-b border-line bg-white px-4 py-3 sm:px-6">
        <ol className="mx-auto flex max-w-5xl flex-wrap items-center gap-1 text-sm text-muted">
          <li><Link href="/tutoring/by-school" className="hover:text-accent">학교별</Link></li>
          <li aria-hidden className="text-line">›</li>
          <li><Link href={`/tutoring/by-school/${sidoSlug}`} className="hover:text-accent">{region}</Link></li>
          <li aria-hidden className="text-line">›</li>
          <li aria-current="page" className="break-keep font-semibold text-ink">{schoolName}</li>
        </ol>
      </nav>

      {/* Hero — 유일한 h1 */}
      <section className="border-b border-line bg-surface px-5 py-10 sm:px-6 md:px-10 md:py-14">
        <div className="mx-auto max-w-3xl text-center md:text-left">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent">
            {region} · {levelLabel}
          </p>
          <h1 className="mt-2 break-keep text-3xl font-bold leading-snug text-ink sm:text-4xl">
            {h1Head} 과외 — 1:1 맞춤 개인과외
          </h1>
          <p className="mt-4 break-keep text-base leading-relaxed text-muted sm:text-lg">
            {intro}
          </p>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row md:justify-start">
            <a href="#consult" className="inline-flex min-h-14 w-full max-w-xs items-center justify-center rounded-full bg-accent px-7 py-3 text-base font-semibold text-white shadow-md transition-colors hover:bg-accent-dark sm:w-auto sm:text-lg">
              무료 상담 신청
            </a>
            <a href={`tel:${CONSULT_PHONE}`} className="inline-flex min-h-14 w-full max-w-xs items-center justify-center rounded-full border-2 border-accent bg-white px-7 py-3 text-base font-bold text-accent transition-colors hover:bg-accent/5 sm:w-auto sm:text-lg">
              {CONSULT_PHONE}
            </a>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-3xl space-y-12 px-4 py-12 sm:px-6 sm:py-16">
        {/* 과목별 1:1 과외 — 학교×과목 상세로 내부 링크(고교 5과목) */}
        <section>
          <h2 className="break-keep text-xl font-bold text-ink sm:text-2xl">
            {schoolName} 과목별 1:1 과외
          </h2>
          <ul className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {subjectCards.map((subj) => (
              <li key={subj.slug}>
                <Link
                  href={schoolDetailHref(schoolSlug, subj.slug)}
                  className="block rounded-2xl border border-line bg-white p-5 transition-colors hover:border-accent"
                >
                  <p className="text-base font-bold text-ink">{schoolName} {subj.label} 과외</p>
                  <p className="mt-1 break-keep text-sm leading-relaxed text-muted">
                    {subj.label} 내신·기출과 학교 진도에 맞춘 1:1 수업 안내 보기
                  </p>
                  <span className="mt-3 inline-flex text-sm font-semibold text-accent">
                    {subj.label} 상세 →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-5 break-keep text-base leading-relaxed text-muted sm:text-lg">{guide}</p>
        </section>

        {/* 진행 순서 STEP */}
        <section>
          <h2 className="break-keep text-xl font-bold text-ink sm:text-2xl">상담부터 첫 수업까지</h2>
          <ol className="mt-5 space-y-3">
            {STEPS.map((s) => (
              <li key={s.no} className="flex items-start gap-4 rounded-2xl border border-line bg-white p-4">
                <span className="shrink-0 rounded-full bg-accent/10 px-3 py-1 text-sm font-bold text-accent">STEP {s.no}</span>
                <div>
                  <p className="text-base font-bold text-ink">{s.title}</p>
                  <p className="mt-0.5 break-keep text-sm leading-relaxed text-muted">{s.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* 믿어도 되는 이유 */}
        <section>
          <h2 className="break-keep text-xl font-bold text-ink sm:text-2xl">지식의참견을 믿어도 되는 이유</h2>
          <ul className="mt-5 space-y-3">
            {TRUST.map((t, i) => (
              <li key={i} className="flex items-start gap-3 break-keep text-base leading-relaxed text-ink sm:text-lg">
                <span aria-hidden className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent" />
                {t}
              </li>
            ))}
          </ul>
        </section>

        {/* FAQ (과목 중립) */}
        <section>
          <h2 className="text-xl font-bold text-ink sm:text-2xl">자주 묻는 질문</h2>
          <div className="mt-5 divide-y divide-line border-y border-line">
            {faq.map((f, i) => (
              <details key={i} className="group py-1">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-4 text-base font-semibold text-ink sm:text-lg">
                  <span className="break-keep">{f.q}</span>
                  <span aria-hidden className="shrink-0 text-accent transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="pb-4 break-keep text-base leading-relaxed text-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* 인근 학교 허브 링크 */}
        {otherSchoolLinks.length > 0 && (
          <section>
            <h2 className="break-keep text-xl font-bold text-ink sm:text-2xl">{sigunguName}의 다른 학교</h2>
            <ul className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4">
              {otherSchoolLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="block rounded-xl border border-line bg-white px-3 py-2.5 text-center text-sm font-semibold text-ink transition-colors hover:border-accent hover:text-accent">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* 지역으로 찾기 */}
        <SchoolRegionLinks sidoLabel={sidoLabel} sidoSlug={sidoSlug} />

        {/* 최종 CTA */}
        <section className="rounded-2xl bg-surface px-6 py-8 text-center sm:py-10">
          <p className="break-keep text-base font-medium leading-relaxed text-ink sm:text-lg">
            {schoolName}에서 어떤 선생님이 맞을지 막막하다면, 상담부터 시작하세요. 직접 가르쳐 온 선생님이 함께 찾아 드립니다.
          </p>
          <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a href="#consult" className="inline-flex min-h-14 w-full max-w-xs items-center justify-center rounded-full bg-accent px-7 py-3 text-base font-semibold text-white shadow-md transition-colors hover:bg-accent-dark sm:w-auto sm:text-lg">무료 상담 신청</a>
            <a href={`tel:${CONSULT_PHONE}`} className="inline-flex min-h-14 w-full max-w-xs items-center justify-center rounded-full border-2 border-accent bg-white px-7 py-3 text-base font-bold text-accent transition-colors hover:bg-accent/5 sm:w-auto sm:text-lg">{CONSULT_PHONE}</a>
          </div>
        </section>
      </div>

      {/* 상담 폼(프리필) — #consult */}
      <ConsultForm defaultMessage={consultMessage} />
    </>
  );
}
