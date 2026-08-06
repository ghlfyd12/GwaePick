import Image from "next/image";
import Link from "next/link";
import ConsultForm from "@/components/ConsultForm";
import type { Subject } from "@/data/subjects";
import SubjectTabs from "@/components/SubjectTabs";
import { CONSULT_PHONE, STEPS, TRUST, REVIEW_PLACEHOLDERS } from "@/data/dongPageCopy";
import {
  buildSchoolIntro,
  buildWhySchool,
  buildSchoolFaq,
  buildStrategyCards,
  buildRelatedKeywords,
  buildSubjectOverview,
} from "@/data/schoolDetailCopy";
import { schoolDetailHref } from "@/lib/schoolHref";
import { selectSchoolContent } from "@/lib/contentVariant";
import SchoolStruggles from "@/components/school/SchoolStruggles";
import SchoolExamPrep from "@/components/school/SchoolExamPrep";
import SchoolRegionLinks from "@/components/SchoolRegionLinks";
import type { SchoolArticle } from "@/data/schoolArticleSections";
import PageBanner from "@/components/PageBanner";
import { buildSchoolBanner } from "@/data/pageBannerCopy";
import { THUMB_SUBJECTS, thumbPath, thumbAlt } from "@/lib/thumb";

/*
 * SchoolSubjectDetail — 학교×과목 상세(서버 컴포넌트). 지역 상세(DongSubjectDetail)와 동일 골격·디자인.
 * 콘텐츠 맥락만 '지역' → '학교'. 공통 데이터(STEP·믿는 이유·후기)는 dongPageCopy.ts 재사용.
 */

// 학교 Hero 학생 사진 — 동 페이지와 별개 에셋. 학교급에 따라 분기.
const SCHOOL_HERO_IMAGE = "/images/school-students.png"; // 중·고(기존, 교복 학생)
const SCHOOL_HERO_IMAGE_ELEM = "/images/school-elementary.png"; // 초등(함께 공부하는 초등학생)

export default function SchoolSubjectDetail({
  schoolSlug,
  schoolName,
  schoolFullName,
  levelLabel,
  sidoLabel,
  sidoSlug,
  sigunguName,
  subject,
  otherSchools,
  article = null,
}: {
  schoolSlug: string;
  schoolName: string;
  /** 약칭→정식명(page.tsx 에서 expandSchoolName 으로 계산). 변환 불가 시 null. */
  schoolFullName: string | null;
  levelLabel: string;
  sidoLabel: string;
  sidoSlug: string;
  sigunguName: string;
  subject: Subject;
  otherSchools: { name: string; slug: string }[];
  /** 아티클형 목차 섹션(파일럿 고교×핵심5과목만). null 이면 렌더하지 않아 기존 출력과 동일. */
  article?: SchoolArticle | null;
}) {
  const region = `${sidoLabel} ${sigunguName}`;
  // H1 의 지역 파트 — 정식명이 있으면 "{시군구} {정식명}", 없으면 "{시군구}"만(메타 title 과 동일 규칙).
  const h1RegionPart = schoolFullName ? `${sigunguName} ${schoolFullName}` : sigunguName;
  const intro = buildSchoolIntro(schoolName, subject.label, levelLabel);
  const why = buildWhySchool(schoolName, levelLabel);
  const faq = buildSchoolFaq(schoolName, levelLabel);
  const isElem = levelLabel === "초등학교";
  // 파일럿: 고교×핵심5과목은 히어로를 페이지별 텍스트 썸네일(생성 라우트)로 교체.
  // 그 외(초·중·타 과목)는 기존 학생 사진 유지 — 실측 후 별도 승인 시 확대.
  const useThumb = levelLabel === "고등학교" && THUMB_SUBJECTS.has(subject.slug);
  // 히어로 이미지 — 초등만 새 이미지, 중·고는 기존 그대로(학교급 데이터 기준 분기).
  const heroImage = useThumb
    ? thumbPath(schoolSlug, subject.slug)
    : isElem
      ? SCHOOL_HERO_IMAGE_ELEM
      : SCHOOL_HERO_IMAGE;
  const heroAlt = useThumb
    ? thumbAlt(schoolName, subject.label)
    : isElem
      ? "함께 공부하는 초등학생들"
      : "교복을 입은 학생들";
  const displayName = schoolFullName ?? schoolName; // 정식명, 없으면 약칭
  const strategyCards = buildStrategyCards(schoolName, schoolFullName, levelLabel, subject.label, subject.why);
  const relatedKeywords = buildRelatedKeywords(schoolName, displayName, isElem);
  // "과목별 1:1 과외" — 전 학교급. 초등 8과목 / 중·고등 5과목.
  const subjectOverview = buildSubjectOverview(displayName, isElem);
  const consultMessage = `${schoolName} ${subject.label} 과외 문의드립니다.`;

  // 학교급×과목 고유 콘텐츠(자주 겪는 어려움 · 시험 대비 관리) — 학교 slug 해시로 결정론적 변형 선택.
  const schoolContentVariant = selectSchoolContent(schoolSlug, levelLabel, subject.slug);

  // 내부 링크
  const otherSchoolLinks = otherSchools
    .slice(0, 12)
    .map((s) => ({ label: s.name, href: schoolDetailHref(s.slug, subject.slug) }));

  // JSON-LD(Service·FAQPage·BreadcrumbList)는 라우트 레벨에서 lib/seo.ts 로 중앙 삽입한다
  // (컴포넌트 하드코딩 제거 — 중복 스키마 방지).

  return (
    <>
      {/* 브레드크럼 */}
      <nav aria-label="현재 위치" className="border-b border-line bg-white px-4 py-3 sm:px-6">
        <ol className="mx-auto flex max-w-5xl flex-wrap items-center gap-1 text-sm text-muted">
          <li><Link href="/tutoring/by-school" className="hover:text-accent">학교별</Link></li>
          <li aria-hidden className="text-line">›</li>
          <li><Link href={`/tutoring/by-school/${sidoSlug}`} className="hover:text-accent">{region}</Link></li>
          <li aria-hidden className="text-line">›</li>
          <li className="break-keep font-medium text-ink">{schoolName}</li>
          <li aria-hidden className="text-line">›</li>
          <li aria-current="page" className="font-semibold text-ink">{subject.label}</li>
        </ol>
      </nav>

      {/* 1. Hero — 좌: 학생 사진 / 우: 텍스트(모바일은 사진 위·텍스트 아래) */}
      <section className="border-b border-line bg-surface px-5 py-10 sm:px-6 md:px-10 md:py-14">
        <div className="mx-auto grid max-w-5xl items-center gap-8 md:grid-cols-2 md:gap-10">
          {/* 왼쪽 — 학생 사진(학교급별: 초등/중·고, 고정 비율·인물 중심) */}
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-md">
            <Image
              src={heroImage}
              alt={heroAlt}
              fill
              priority
              sizes="(min-width: 768px) 512px, 100vw"
              className="object-cover object-center"
              unoptimized
            />
          </div>

          {/* 오른쪽 — 텍스트(모바일 가운데 / 데스크톱 왼쪽 정렬) */}
          <div className="text-center md:text-left">
            <p className="text-sm font-semibold uppercase tracking-widest text-accent">
              {region} · {levelLabel}
            </p>
            <h1 className="mt-2 break-keep text-3xl font-bold leading-snug text-ink sm:text-4xl">
              {schoolName} {subject.label} 과외 — {h1RegionPart} 1:1 맞춤 개인과외 수업
            </h1>
            <p className="mt-4 break-keep text-base leading-relaxed text-muted sm:text-lg">
              직접 가르쳐 온 선생님이 {schoolName} 학생에게 가장 잘 맞는 {subject.label}{" "}
              선생님을 배정하여 취약과목 집중관리부터 공부습관까지 체계적인 맞춤관리로
              확실한 결과를 만듭니다.
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
        </div>
      </section>

      {/* 과목 선택 탭 — 같은 학교의 다른 과목 페이지로 전환(현재 과목 활성) */}
      <SubjectTabs
        currentSlug={subject.slug}
        makeHref={(s) => schoolDetailHref(schoolSlug, s)}
      />

      <div className="mx-auto max-w-3xl space-y-12 px-4 py-12 sm:px-6 sm:py-16">
        {/* 2. 학교 맞춤 도입 */}
        <p className="break-keep text-base leading-relaxed text-muted sm:text-lg">{intro}</p>

        {/* 2-1. 아티클형 목차 + 소제목 섹션(파일럿 고교×핵심5과목만) — 없으면 미렌더(기존과 동일) */}
        {article && (
          <div className="space-y-8">
            {/* 상단 앵커 목차 — 초기 SSR HTML 에 <a href="#..."> 로 존재(JS 의존 없음) */}
            <nav
              aria-label="목차"
              className="rounded-2xl border border-line bg-surface p-5 sm:p-6"
            >
              <p className="text-sm font-semibold text-accent">목차</p>
              <ul className="mt-3 space-y-2">
                {article.toc.map((t) => (
                  <li key={t.id}>
                    <a
                      href={`#${t.id}`}
                      className="break-keep text-base font-medium text-ink underline-offset-4 hover:text-accent hover:underline sm:text-lg"
                    >
                      {t.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            {/* 소제목(H2) 4개 + 본문 — 전체 펼침(접기 없음) */}
            {article.sections.map((s) => (
              <section
                key={s.id}
                id={s.id}
                aria-labelledby={`${s.id}-heading`}
                className="scroll-mt-24"
              >
                <h2
                  id={`${s.id}-heading`}
                  className="break-keep text-xl font-bold text-ink sm:text-2xl"
                >
                  {s.heading}
                </h2>
                <p className="mt-3 break-keep text-base leading-relaxed text-muted sm:text-lg">
                  {s.body}
                </p>
                {/* 섹션 4 아래 — 기존 스타일 "무료 상담 신청" CTA(상담폼 #consult 로 이동) */}
                {s.id === "consult-check" && (
                  <div className="mt-6">
                    <a
                      href="#consult"
                      className="inline-flex min-h-14 w-full max-w-xs items-center justify-center rounded-full bg-accent px-7 py-3 text-base font-semibold text-white shadow-md transition-colors hover:bg-accent-dark sm:w-auto sm:text-lg"
                    >
                      무료 상담 신청
                    </a>
                  </div>
                )}
              </section>
            ))}
          </div>
        )}

        {/* 3. 왜 1:1 과외일까요 */}
        <section>
          <h2 className="break-keep text-xl font-bold text-ink sm:text-2xl">
            왜 {schoolName}에서 1:1 {subject.label} 과외일까요?
          </h2>
          <p className="mt-3 break-keep text-base leading-relaxed text-muted sm:text-lg">{why}</p>
          <p className="mt-3 break-keep text-base font-medium leading-relaxed text-ink sm:text-lg">{subject.why}</p>
          {subject.forWhom && subject.forWhom.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-semibold text-muted">이런 학생에게 도움이 됩니다</p>
              <ul className="mt-2 space-y-2">
                {subject.forWhom.map((w, i) => (
                  <li key={i} className="flex items-start gap-3 break-keep text-base leading-relaxed text-ink">
                    <span aria-hidden className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent" />
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* 3-1. 공용 안내 배너 (재학생 맞춤 문구 — 학교급 분기) */}
        <PageBanner content={buildSchoolBanner(schoolName, subject.label, levelLabel)} />

        {/* 4. 커리큘럼 4단계 */}
        <section>
          <h2 className="break-keep text-xl font-bold text-ink sm:text-2xl">{subject.label}, 이렇게 가르칩니다</h2>
          <ol className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {subject.curriculum.map((c, i) => (
              <li key={i} className="rounded-2xl border border-line bg-white p-5">
                <p className="text-sm font-semibold text-accent">{c.step}</p>
                <p className="mt-1 text-base font-bold text-ink">{c.title}</p>
                <p className="mt-1 break-keep text-sm leading-relaxed text-muted">{c.desc}</p>
              </li>
            ))}
          </ol>
          {subject.teaching && (
            <div className="mt-5 rounded-2xl bg-surface p-5">
              <p className="text-sm font-semibold text-accent">수업 방식</p>
              <p className="mt-2 break-keep text-base leading-relaxed text-ink">{subject.teaching}</p>
            </div>
          )}
        </section>

        {/* 4-1. 학교급×과목 고유 콘텐츠 — 자주 겪는 어려움 / 시험 대비 관리(하단 상담 CTA) */}
        {schoolContentVariant && (
          <>
            <SchoolStruggles schoolName={schoolName} struggles={schoolContentVariant.struggles} />
            <SchoolExamPrep schoolName={schoolName} examPrep={schoolContentVariant.examPrep} />
          </>
        )}

        {/* 5. 진행 순서 STEP */}
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

        {/* 6. 믿어도 되는 이유 3가지 */}
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

        {/* 7. 후기(placeholder) */}
        <section>
          <h2 className="break-keep text-xl font-bold text-ink sm:text-2xl">수업 후기</h2>
          <ul className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {REVIEW_PLACEHOLDERS.map((r, i) => (
              <li key={i} className="rounded-2xl border border-line bg-white p-5">
                <p className="inline-flex rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-semibold text-accent">{r.label}</p>
                <p className="mt-2 break-keep text-sm leading-relaxed text-ink">“{r.text}”</p>
                <p className="mt-2 text-xs text-muted">— {r.author}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* 8. FAQ */}
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

        {/* 8-1. 학습 전략 카드 4개 (SEO 콘텐츠, 학교명·학교급·과목 기반) */}
        <section>
          <h2 className="break-keep text-xl font-bold text-ink sm:text-2xl">{schoolName} {subject.label} 학습 전략</h2>
          <ul className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {strategyCards.map((c, i) => (
              <li key={i} className="rounded-2xl border border-line bg-white p-5">
                <p className="text-base font-bold text-ink">{c.title}</p>
                <p className="mt-2 break-keep text-sm leading-relaxed text-muted">{c.body}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* 8-1b. 과목별 1:1 과외 — 중·고등만. 전부 장식 태그(클릭 불가). 표시명=정식명(없으면 약칭) */}
        {subjectOverview && (
          <section>
            <h2 className="break-keep text-xl font-bold text-ink sm:text-2xl">{subjectOverview.title}</h2>
            <ul className="mt-4 flex flex-wrap gap-2.5">
              {subjectOverview.tags.map((t) => (
                <li key={t}>
                  <span className="inline-flex rounded-full bg-surface-alt px-4 py-2 text-sm font-medium text-muted sm:text-base">
                    {t}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* 8-2. 관련 검색어 — 전부 장식 태그(클릭 불가) */}
        <section>
          <h2 className="break-keep text-xl font-bold text-ink sm:text-2xl">관련 검색어</h2>
          <ul className="mt-4 flex flex-wrap gap-2.5">
            {relatedKeywords.map((k) =>
              k.href ? (
                <li key={k.label}>
                  <Link href={k.href} className="inline-flex rounded-full border border-accent/30 px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-accent hover:text-accent sm:text-base">
                    {k.label}
                  </Link>
                </li>
              ) : (
                <li key={k.label}>
                  <span className="inline-flex rounded-full bg-surface-alt px-4 py-2 text-sm font-medium text-muted sm:text-base">
                    {k.label}
                  </span>
                </li>
              ),
            )}
          </ul>
        </section>

        {/* 9. 내부 링크 블록 */}
        <section className="space-y-8">
          {otherSchoolLinks.length > 0 && (
            <div>
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
              {otherSchools.length > 12 && (
                <p className="mt-3 text-center text-sm">
                  <Link href={`/tutoring/by-school/${sidoSlug}`} className="font-semibold text-accent hover:underline">더보기 →</Link>
                </p>
              )}
            </div>
          )}
        </section>

        {/* 9-1. 지역으로 찾기 — 학교→지역 스택 연결(시도 허브, 과목 중립: 학교 데이터가 동 미포함) */}
        <SchoolRegionLinks sidoLabel={sidoLabel} sidoSlug={sidoSlug} />

        {/* 10. 최종 CTA */}
        <section className="rounded-2xl bg-surface px-6 py-8 text-center sm:py-10">
          <p className="break-keep text-base font-medium leading-relaxed text-ink sm:text-lg">
            {schoolName}에서 어떤 {subject.label} 선생님이 맞을지 막막하다면, 상담부터 시작하세요. 직접 가르쳐 온 선생님이 함께 찾아 드립니다.
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
