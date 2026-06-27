/*
 * RelatedKeywords — 지역 상세(구/동) 하단의 장식용 연관 키워드 블록.
 *
 * 순수 시각 요소. 모든 칩은 클릭 불가한 <span> 텍스트다.
 * (a 태그·next/link·onClick 금지 — 어떤 페이지로도 연결되지 않는다.)
 * 문자열 생성 로직만 담고, 인접 동 데이터 조회는 페이지 쪽에서 해 props 로 넘긴다.
 */

// 과목+학년 조합 8종 — 고정 문자열(순서 그대로). 지역명과 공백 없이 붙인다.
const SUBJECT_GRADE = [
  "고1국어과외",
  "고1영어과외",
  "중3수학과외",
  "고1사회과외",
  "고1과학과외",
  "중2역사과외",
  "초등논술과외",
  "고1코딩과외",
];

// 학년+과목 조합 15종 — 고정 문자열(순서 그대로). {지역}만 치환.
// 대부분 "{지역} {접미사}"(공백 포함)이나, 한국사과외만 공백 없이 붙인다(glued).
const GRADE_SUBJECT: { label: string; glued?: boolean }[] = [
  { label: "초등수학과외" },
  { label: "중등영어과외" },
  { label: "고등수학과외" },
  { label: "초등영어과외" },
  { label: "중등수학과외" },
  { label: "고등영어과외" },
  { label: "초등과학과외" },
  { label: "중등과학과외" },
  { label: "고등과학과외" },
  { label: "중등사회과외" },
  { label: "고등사회과외" },
  { label: "중등역사과외" },
  { label: "한국사과외", glued: true }, // 이전 "고등역사과외" 대체 — 지역명과 붙여 표기
  { label: "초등코딩과외" },
  { label: "고등학생코딩과외" },
];

// 인접 동 접미사 풀 — 동 순서대로 i % 6 으로 순환 적용. 동 이름과 공백 없이 붙인다.
const SUFFIX_POOL = [
  "초등학생과외",
  "중학생과외",
  "고등학생과외",
  "영어과외",
  "수학과외",
  "고등국어과외",
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
  // 1) 과목+학년 조합 8종 — {지역}+접미사(공백 없이).
  const subjectGradeKeywords = SUBJECT_GRADE.map((k) => `${regionName}${k}`);
  // 2) 학년+과목 조합 15종 — 한국사과외만 공백 없이, 나머지는 "{지역} {접미사}".
  const gradeKeywords = GRADE_SUBJECT.map(({ label, glued }) =>
    glued ? `${regionName}${label}` : `${regionName} ${label}`,
  );
  // 3) 인접 동 + 접미사 조합(최대 6) — {동}+SUFFIX_POOL[i % 6](공백 없이).
  const neighborKeywords = neighborDongs
    .slice(0, MAX_NEIGHBORS)
    .map((d, i) => `${d}${SUFFIX_POOL[i % SUFFIX_POOL.length]}`);

  const keywords = [...subjectGradeKeywords, ...gradeKeywords, ...neighborKeywords];

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
