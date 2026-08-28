/**
 * 어학의참견(/power) 시험 축 — 시험별 인기 교재 데이터 + "교재 활용" 섹션 카피 빌더(신규, additive).
 *
 * exams.ts 는 수정하지 않는다(축 데이터 무변경). 이 파일만 slug 로 교재 목록을 매핑하고,
 * ByRegionExamDetail 이 렌더할 섹션 카피(h2·리드·교재별 h3 소단락·말미 상담 1문장)를 만든다.
 *
 * 목적: "{교재명} 독학", "{시험명} 기출문제집", "{시험명} 입문 교재" 같은 수험생 검색 조합을
 *   본문에서 각 1회씩 자연스럽게 커버해 롱테일 매칭을 만든다(밀도 반복 금지 — 조합당 1회).
 *
 * 워딩 규칙(지침서·CLAUDE.md):
 *  - 교재명은 사용자 확정 목록 그대로(출판사·저자 임의 추가 금지). title·og·description 에는 넣지 않는다(상표).
 *  - 사실 서술만("이렇게 활용합니다"). 점수 상승·합격 보장·교재 평가/비교/추천/최상급·느낌표 금지.
 *  - "공식 파트너/추천 교재" 등 제휴·추천 암시 금지 — "많이 쓰는 교재" 수준의 사실 서술만.
 *  - 색은 accent 토큰(퍼플)만 — 컴포넌트에서 처리(이 파일은 순수 데이터/문자열).
 */

/** 한글 받침 유무(영문·숫자 말미는 받침 없음으로 간주 — 대개 모음 발음). */
function hasJong(s: string): boolean {
  const c = s.charCodeAt(s.length - 1);
  if (c >= 0xac00 && c <= 0xd7a3) return (c - 0xac00) % 28 !== 0;
  return false;
}
/** 목적격 조사 을/를. */
const eul = (s: string) => `${s}${hasJong(s) ? "을" : "를"}`;
/** 주제 조사 은/는. */
const eun = (s: string) => `${s}${hasJong(s) ? "은" : "는"}`;

interface ExamBookInfo {
  /** 인기 교재명(사용자 확정 목록 그대로, 1~2권). generic 시험은 빈 배열. */
  books: string[];
  /** 시험 단위 조합의 자료 명사: 기출 계열이면 "기출문제집", 말하기 등 기출집이 없으면 "실전 교재". */
  corpus: "기출문제집" | "실전 교재";
  /** HSKK·TSC 등 통칭 지정 시험 — 특정 교재명 없이 시중 대비서 문단으로 대체. */
  generic?: boolean;
}

/** 시험 slug → 교재 정보. exams.ts 의 13 slug 와 1:1(회화 축은 대상 아님). */
const EXAM_BOOKS: Record<string, ExamBookInfo> = {
  // 영어
  toeic: { books: ["ETS 토익 정기시험 기출문제집", "해커스 토익 RC·LC"], corpus: "기출문제집" },
  "toeic-speaking": { books: ["해커스 토익스피킹", "시원스쿨 토익스피킹"], corpus: "실전 교재" },
  opic: { books: ["벨라쌤의오픽교재", "해커스 오픽"], corpus: "실전 교재" },
  toefl: { books: ["ETS 토플 공식 가이드", "해커스 토플"], corpus: "실전 교재" },
  ielts: { books: ["케임브리지 IELTS 기출문제집"], corpus: "기출문제집" },
  teps: { books: ["텝스 공식 기출문제집", "해커스 텝스"], corpus: "기출문제집" },
  gtelp: { books: ["지텔프 공식 기출문제집", "해커스 지텔프"], corpus: "기출문제집" },
  // 일본어
  jlpt: { books: ["JLPT 한권으로 끝내기", "시나공 JLPT"], corpus: "기출문제집" },
  jpt: { books: ["YBM JPT 기출문제집"], corpus: "기출문제집" },
  sjpt: { books: ["시원스쿨 SJPT"], corpus: "실전 교재" },
  // 중국어
  hsk: { books: ["해커스 HSK", "맛있는 중국어 HSK"], corpus: "기출문제집" },
  hskk: { books: [], corpus: "실전 교재", generic: true },
  tsc: { books: [], corpus: "실전 교재", generic: true },
};

export interface ExamBookBlock {
  /** h3 — "{교재명} 활용". */
  heading: string;
  /** 소단락 본문(사실 서술, 검색 조합 각 1회). */
  body: string;
}

export interface ExamBookSection {
  /** h2. */
  heading: string;
  /** 리드 문단. */
  lead: string;
  /** 교재별 h3 소단락(generic 시험은 빈 배열). */
  blocks: ExamBookBlock[];
  /** generic 시험 통칭 문단(교재 h3 대신). */
  genericBody?: string;
  /** 말미 상담 연결 1문장(섹션 내 CTA 버튼 없음 — 단일 CTA 원칙 유지). */
  closing: string;
}

const SECTION_HEADING = "쓰던 교재 그대로, 교재부터 함께 정합니다";
const CLOSING =
  "교재는 출발점이고, 정작 중요한 것은 지금 수준에 맞는 활용 순서입니다. 어떤 교재로 어떻게 시작할지 막막하다면 상담에서 함께 정리해 드립니다.";

/**
 * 시험 slug + 표기명 → "교재 활용" 섹션 카피.
 * 대상 slug 가 아니면 null(회화 축 등 — 섹션 미렌더).
 */
export function buildExamBookSection(slug: string, examName: string): ExamBookSection | null {
  const info = EXAM_BOOKS[slug];
  if (!info) return null;

  const lead = `${examName} 수업은 정해진 교재를 강요하지 않습니다. 지금 쓰고 있는 교재가 있으면 그대로 이어서 진행하고, 교재가 없다면 수준과 목표에 맞는 교재를 상담에서 함께 정합니다.`;

  if (info.generic) {
    // 통칭 문단 + "기출 유형 자료 활용" 조합만(특정 교재명 없이).
    const genericBody = `${eun(examName)} 시중 대비서와 기출 유형 자료를 활용해 준비합니다. ${examName} 독학으로 시작한 경우에도 ${examName} 기출 유형 자료로 문항 형식을 먼저 익히고, ${examName} 대비서로 부족한 부분을 채우며 수준에 맞게 진행합니다.`;
    return { heading: SECTION_HEADING, lead, blocks: [], genericBody, closing: CLOSING };
  }

  const combo1 = `${examName} ${info.corpus}`; // 예: "토익 기출문제집" / "오픽 실전 교재"
  const combo2 = `${examName} 입문 교재`;
  const books = info.books;
  const blocks: ExamBookBlock[] = [];

  if (books.length === 1) {
    const b = books[0];
    blocks.push({
      heading: `${b} 활용`,
      body: `${eun(b)} ${examName} 준비에 많이 쓰는 교재입니다. ${b} 독학으로 준비해 온 분은 지금까지 본 범위를 점검해 이어서 진행합니다. ${eul(combo1)} 함께 보거나 ${eul(combo2)} 찾는 경우에도, 남은 기간과 목표에 맞춰 학습 순서와 분량을 조정합니다.`,
    });
  } else {
    const [b0, b1] = books;
    blocks.push({
      heading: `${b0} 활용`,
      body: `${eun(b0)} ${examName} 준비에 많이 쓰는 교재입니다. ${b0} 독학으로 여기까지 온 분이라면 지금까지 본 범위를 점검해 이어서 진행하고, ${eul(combo1)} 함께 보는 경우에는 영역별로 학습 순서를 잡아 갑니다.`,
    });
    blocks.push({
      heading: `${b1} 활용`,
      body: `${eun(b1)} ${examName} 준비에 함께 쓰는 교재입니다. ${b1} 독학으로 기본을 잡은 뒤에는 실전 감각을 더하고, ${eul(combo2)} 찾는 분에게는 수준에 맞는 시작 지점을 함께 정합니다.`,
    });
  }

  return { heading: SECTION_HEADING, lead, blocks, closing: CLOSING };
}

/** 교재 섹션 대상 시험 slug 여부(테스트·검증용). */
export function hasExamBooks(slug: string): boolean {
  return slug in EXAM_BOOKS;
}
