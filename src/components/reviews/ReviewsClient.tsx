"use client";

import { useMemo, useState } from "react";
import ReviewHeroStats from "./ReviewHeroStats";
import ReviewCard from "./ReviewCard";
import {
  reviewItems,
  reviewSubjects,
  reviewGrades,
} from "@/data/reviewItems";
import { site } from "@/data/site";

/*
 * ReviewsClient — 후기 페이지 본문(클라이언트). 평점 배너 + 과목/학년 필터 + 카드 리스트.
 * 필터: 과목 그룹·학년 그룹 각각 단일 선택, 둘 다 적용(AND). 둘 다 '전체'면 전체.
 * 페이지네이션: 처음 15개 + 더보기. 필터 변경 시 15개로 리셋. 상태는 useState(스토리지 미사용).
 * 데이터·평점·건수는 reviewItems.ts 그대로 — 하드코딩/과장 없음.
 */

const ALL = "전체";
const PAGE_SIZE = 15;

export default function ReviewsClient() {
  const [subject, setSubject] = useState<string>(ALL);
  const [grade, setGrade] = useState<string>(ALL);
  const [visible, setVisible] = useState<number>(PAGE_SIZE);

  const filtered = useMemo(
    () =>
      reviewItems.filter(
        (r) =>
          (subject === ALL || r.subject === subject) &&
          (grade === ALL || r.grade === grade),
      ),
    [subject, grade],
  );

  const shown = filtered.slice(0, visible);
  const hasMore = visible < filtered.length;

  // 필터 변경 시 노출 개수 리셋.
  const pickSubject = (v: string) => {
    setSubject(v);
    setVisible(PAGE_SIZE);
  };
  const pickGrade = (v: string) => {
    setGrade(v);
    setVisible(PAGE_SIZE);
  };
  const resetFilters = () => {
    setSubject(ALL);
    setGrade(ALL);
    setVisible(PAGE_SIZE);
  };

  const chipClass = (active: boolean) =>
    `inline-flex min-h-9 items-center rounded-full px-3 py-1.5 text-xs font-semibold break-keep transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:text-sm ${
      active
        ? "bg-accent text-white"
        : "border border-line bg-white text-ink hover:border-accent hover:text-accent"
    }`;

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-12 sm:px-6 sm:py-16">
      <header className="text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-accent">
          수업 후기
        </p>
        <h1 className="mt-2 break-keep text-3xl font-bold leading-snug text-ink sm:text-4xl">
          학부모님들이 남겨 주신 후기
        </h1>
      </header>

      {/* 1. 평점 요약 배너 */}
      <ReviewHeroStats />

      {/* 2. 필터 — 과목 그룹 / 학년 그룹 (각각 단일 선택) */}
      <div className="space-y-4">
        <div>
          <p className="mb-2 text-sm font-semibold text-muted">과목</p>
          <ul className="flex flex-wrap gap-2">
            {[ALL, ...reviewSubjects].map((s) => (
              <li key={s}>
                <button
                  type="button"
                  aria-pressed={subject === s}
                  onClick={() => pickSubject(s)}
                  className={chipClass(subject === s)}
                >
                  {s}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold text-muted">학년</p>
          <ul className="flex flex-wrap gap-2">
            {[ALL, ...reviewGrades].map((g) => (
              <li key={g}>
                <button
                  type="button"
                  aria-pressed={grade === g}
                  onClick={() => pickGrade(g)}
                  className={chipClass(grade === g)}
                >
                  {g}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 3. 결과 개수 + 리스트 */}
      <p className="text-sm text-muted" aria-live="polite">
        총 {filtered.length}건
      </p>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-line bg-surface px-6 py-12 text-center">
          <p className="break-keep text-base font-medium text-ink">
            조건에 맞는 후기가 아직 없습니다
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full border-2 border-accent bg-white px-6 py-2 text-sm font-bold text-accent transition-colors hover:bg-accent/5"
          >
            필터 초기화
          </button>
        </div>
      ) : (
        <>
          <ul className="space-y-4">
            {shown.map((item) => (
              <ReviewCard key={item.id} item={item} />
            ))}
          </ul>

          {hasMore && (
            <div className="text-center">
              <button
                type="button"
                onClick={() => setVisible((v) => v + PAGE_SIZE)}
                className="inline-flex min-h-12 items-center justify-center rounded-full border-2 border-accent bg-white px-7 py-2.5 text-base font-bold text-accent transition-colors hover:bg-accent/5"
              >
                더보기 ({filtered.length - shown.length}건 남음)
              </button>
            </div>
          )}
        </>
      )}

      {/* 5. 하단 상담 CTA */}
      <section className="rounded-2xl bg-surface px-6 py-8 text-center sm:py-10">
        <p className="break-keep text-base font-medium leading-relaxed text-ink sm:text-lg">
          우리 아이에게 맞는 선생님이 궁금하다면, 상담부터 시작하세요. 직접
          가르쳐 온 선생님이 함께 찾아 드립니다.
        </p>
        <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href={site.cta.href}
            className="inline-flex min-h-14 w-full max-w-xs items-center justify-center rounded-full bg-accent px-7 py-3 text-base font-semibold text-white shadow-md transition-colors hover:bg-accent-dark sm:w-auto sm:text-lg"
          >
            {site.cta.label}
          </a>
          <a
            href={`tel:${site.contact.phone}`}
            className="inline-flex min-h-14 w-full max-w-xs items-center justify-center rounded-full border-2 border-accent bg-white px-7 py-3 text-base font-bold text-accent transition-colors hover:bg-accent/5 sm:w-auto sm:text-lg"
          >
            {site.contact.phone}
          </a>
        </div>
      </section>
    </div>
  );
}
