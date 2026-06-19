"use client";

import Image from "next/image";
import { useState } from "react";
import { teachers, type Subject } from "@/data/teacherPool";

/*
 * TeacherPool(소속 선생님 소개) 섹션 — 실제 44명 카드 그리드 + 과목 필터.
 *
 * 모든 동선은 무료 상담 신청(#consult)으로 모인다(개별 교사 상세/라우트 없음).
 * 필터(useState)로 과목별 카드만 노출, 처음 12명 + "더 보기"로 펼침(필터 변경 시 12명 리셋).
 * 색: 브랜드 주황(accent) + 차콜/그레이 + 흰색. 보라색 미사용(CLAUDE.md 규칙 우선).
 * 데이터는 teacherPool.ts 에서만 import(하드코딩 금지).
 */

/** 처음 노출 인원(쉽게 조정). 필터 변경 시 이 값으로 리셋된다. */
const INITIAL_VISIBLE = 12;

/** 필터 칩 목록(회화 없음). */
const FILTERS: ("전체" | Subject)[] = [
  "전체",
  "국어",
  "영어",
  "수학",
  "사회",
  "과학",
  "코딩",
];

export default function TeacherPool({
  withHeader = true,
}: {
  /** 섹션 자체 헤더(eyebrow·제목·설명) 노출 여부. /teachers 처럼 페이지에 h1 을 따로 둘 땐 false. */
  withHeader?: boolean;
}) {
  const [active, setActive] = useState<"전체" | Subject>("전체");
  const [expanded, setExpanded] = useState(false);

  const filtered =
    active === "전체" ? teachers : teachers.filter((t) => t.subject === active);
  const visible = expanded ? filtered : filtered.slice(0, INITIAL_VISIBLE);
  const hiddenCount = filtered.length - INITIAL_VISIBLE;

  // 필터 변경 시 항상 처음 12명으로 리셋
  const selectFilter = (f: "전체" | Subject) => {
    setActive(f);
    setExpanded(false);
  };

  return (
    <section
      id="teacher-pool"
      aria-labelledby={withHeader ? "teacher-pool-heading" : undefined}
      aria-label={withHeader ? undefined : "소속 선생님 목록"}
      className="border-t border-line bg-white px-4 py-16 sm:px-6 sm:py-20"
    >
      {/* 헤더 — 페이지(/teachers)에서 h1 을 따로 둘 땐 withHeader={false} 로 숨긴다. */}
      {withHeader && (
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent">
            검증된 선생님
          </p>
          <h2
            id="teacher-pool-heading"
            className="mt-2 text-2xl font-bold leading-snug text-ink sm:text-3xl md:text-4xl"
          >
            우리 아이를 맡길 선생님들
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
            국어·영어·수학·사회·과학부터 코딩까지 — 직접 가르쳐 본 선생님이 실력과
            성향을 보고 함께하는 선생님들입니다.
          </p>
        </div>
      )}

      {/* 과목 필터 칩 — 넘치면 가로 스크롤(스크롤바 숨김) */}
      <div className={`mx-auto max-w-5xl ${withHeader ? "mt-8" : ""}`}>
        <ul className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {FILTERS.map((f) => {
            const selected = active === f;
            return (
              <li key={f} className="shrink-0">
                <button
                  type="button"
                  onClick={() => selectFilter(f)}
                  aria-pressed={selected}
                  className={`min-h-10 rounded-full px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                    selected
                      ? "bg-accent text-white"
                      : "border border-accent/30 text-ink hover:border-accent hover:text-accent"
                  }`}
                >
                  {f}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* 교사 카드 그리드 — 모바일 2열 / 태블릿 3열 / 데스크톱 4열 */}
      <ul className="mx-auto mt-8 grid max-w-6xl grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
        {visible.map((t) => (
          <li key={t.id}>
            {/* 카드 전체가 상담 폼(#consult) 링크 — 부드러운 스크롤(globals scroll-behavior) */}
            <a
              href="#consult"
              aria-label={`${t.name} — 무료 상담 신청`}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {/* 사진 — 정사각형, object-cover, 둥근 상단 */}
              <div className="relative aspect-square w-full overflow-hidden bg-surface-alt">
                <Image
                  src={t.image}
                  alt={`${t.name} 프로필 사진`}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                  className="object-cover"
                  // 개발 서버 이미지 최적화 이슈 회피. 배포 시 최적화를 원하면 제거.
                  unoptimized
                />
              </div>

              <div className="flex flex-1 flex-col p-3 sm:p-4">
                <p className="text-sm font-bold text-ink sm:text-base">
                  {t.name}
                </p>
                <span className="mt-1 inline-flex w-fit rounded-full bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent">
                  {t.subject}
                </span>
                <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted sm:text-sm">
                  {t.intro}
                </p>
                <span className="mt-auto pt-3 inline-flex items-center gap-1 text-xs font-semibold text-accent">
                  상담 신청
                  <span aria-hidden>→</span>
                </span>
              </div>
            </a>
          </li>
        ))}
      </ul>

      {/* 더 보기 — 나머지 펼침 */}
      {hiddenCount > 0 && !expanded && (
        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-line px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            더 보기 ({hiddenCount}명)
          </button>
        </div>
      )}

      {/* 섹션 하단 CTA */}
      <div className="mx-auto mt-12 max-w-2xl rounded-2xl bg-surface px-6 py-8 text-center sm:py-10">
        <p className="text-base font-medium text-ink sm:text-lg">
          어떤 선생님이 맞을지 모르겠다면, 상담부터 시작하세요.
        </p>
        <div className="mt-5">
          <a
            href="#consult"
            className="inline-flex min-h-14 items-center justify-center rounded-full bg-accent px-7 py-3 text-base font-semibold text-white shadow-md transition-colors hover:bg-accent-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:text-lg"
          >
            무료 상담 신청
          </a>
        </div>
      </div>
    </section>
  );
}
