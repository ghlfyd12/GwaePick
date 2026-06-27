import { subjects } from "@/data/subjects";

/*
 * RelatedKeywords — 지역 상세(구/동) 하단의 장식용 연관 키워드 블록.
 *
 * 순수 시각 요소. 모든 칩은 클릭 불가한 <span> 텍스트다.
 * (a 태그·next/link·onClick 금지 — 어떤 페이지로도 연결되지 않는다.)
 * 문자열 생성 로직만 담고, 인접 동 데이터 조회는 페이지 쪽에서 해 props 로 넘긴다.
 */

// 학년+과목 조합 15종 — 고정 문자열(요청 순서 그대로). {지역}만 치환.
const GRADE_SUBJECT = [
  "초등수학과외",
  "중등영어과외",
  "고등수학과외",
  "초등영어과외",
  "중등수학과외",
  "고등영어과외",
  "초등과학과외",
  "중등과학과외",
  "고등과학과외",
  "중등사회과외",
  "고등사회과외",
  "중등역사과외",
  "고등역사과외",
  "초등코딩과외",
  "고등학생코딩과외",
];

// 인접 동 키워드 최대 노출 개수.
const MAX_NEIGHBORS = 6;

export default function RelatedKeywords({
  regionName,
  level,
  neighborDongs = [],
}: {
  /** 핵심 지역명 — 구 페이지면 '용산구', 동 페이지면 '이태원동'. */
  regionName: string;
  /** 구/동 구분(추후 분기 대비). */
  level: "gu" | "dong";
  /** 같은 구의 인접 동 이름(현재 동 제외). 비면 인접 동 그룹 생략. */
  neighborDongs?: string[];
}) {
  // 1) 과목 8종 — subjects 데이터 순서로 {지역} {과목}과외.
  const subjectKeywords = subjects.map((s) => `${regionName} ${s.label}과외`);
  // 2) 학년+과목 조합 15종.
  const gradeKeywords = GRADE_SUBJECT.map((k) => `${regionName} ${k}`);
  // 3) 인접 동 키워드(최대 6) — {동} 과외.
  const neighborKeywords = neighborDongs
    .slice(0, MAX_NEIGHBORS)
    .map((d) => `${d} 과외`);

  const keywords = [...subjectKeywords, ...gradeKeywords, ...neighborKeywords];

  return (
    <section
      aria-labelledby="related-keywords-heading"
      className="px-4 pb-14 sm:px-6 sm:pb-16"
    >
      <div className="mx-auto max-w-3xl rounded-2xl border border-line bg-surface p-5 sm:p-6">
        <h2
          id="related-keywords-heading"
          className="flex items-center gap-1.5 text-sm font-semibold text-ink"
        >
          <svg
            aria-hidden
            viewBox="0 0 20 20"
            className="h-4 w-4 text-accent"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.5 3A2.5 2.5 0 0 0 3 5.5v3.086c0 .464.184.909.513 1.237l6.586 6.586a1.75 1.75 0 0 0 2.475 0l3.086-3.086a1.75 1.75 0 0 0 0-2.475L9.073 3.513A1.75 1.75 0 0 0 7.836 3H5.5Zm1 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
              clipRule="evenodd"
            />
          </svg>
          연관 키워드
        </h2>

        <ul className="mt-3 flex flex-wrap gap-2">
          {keywords.map((kw) => (
            <li key={kw}>
              <span className="inline-block break-keep rounded-full border border-line bg-white px-3 py-1 text-xs leading-relaxed text-muted md:text-sm">
                {kw}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
