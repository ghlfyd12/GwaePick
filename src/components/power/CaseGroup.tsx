"use client";

import { useState } from "react";
import CaseCard from "./CaseCard";
import type { LanguageCase } from "@/data/languageCases";

/*
 * CaseGroup — 학습사례 그룹 하나(H3 + 카드 그리드 + 더보기).
 *  - 카드는 전부 렌더(SSR HTML 에 100건 모두 존재 → 크롤링 가능). 초기 INITIAL 개 외에는
 *    hidden 클래스로 감추고, "더 보기"로 펼친다(DOM 에서 제거하지 않음).
 */
const INITIAL = 6;

export default function CaseGroup({
  title,
  cases,
}: {
  title: string;
  cases: LanguageCase[];
}) {
  const [expanded, setExpanded] = useState(false);
  const hiddenCount = Math.max(0, cases.length - INITIAL);

  return (
    <section>
      <h3 className="break-keep text-lg font-bold text-ink sm:text-xl">
        {title}
        <span className="ml-1.5 text-sm font-medium text-muted">
          ({cases.length})
        </span>
      </h3>
      <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cases.map((c, i) => (
          <CaseCard
            key={c.id}
            item={c}
            className={!expanded && i >= INITIAL ? "hidden" : ""}
          />
        ))}
      </ul>
      {hiddenCount > 0 && !expanded && (
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="inline-flex min-h-11 items-center justify-center rounded-full border-2 border-accent bg-white px-6 py-2 text-sm font-bold text-accent transition-colors hover:bg-accent/5"
          >
            더 보기 ({hiddenCount}개)
          </button>
        </div>
      )}
    </section>
  );
}
