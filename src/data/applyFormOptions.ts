/**
 * 신청폼(/apply) 선택지 단일 소스 — 화면과 서버 검증이 같은 값을 본다.
 *
 * supabase-setup.sql 의 컬럼 주석·CHECK 제약을 그대로 옮긴 것이다.
 *   inquiries.grade       — 초1~고3 / 예비중1 / 예비고1 / N수
 *   inquiries.lesson_type — CHECK (lesson_type IN ('visit','remote','any'))
 * 값(코드)을 바꾸면 DB 제약과 어긋나므로, 라벨만 수정하고 코드는 건드리지 않는다.
 */

/** 학년 허용값 — 화면 표시 순서 그대로. */
export const GRADES = [
  "초1", "초2", "초3", "초4", "초5", "초6",
  "예비중1",
  "중1", "중2", "중3",
  "예비고1",
  "고1", "고2", "고3",
  "N수",
] as const;
export type Grade = (typeof GRADES)[number];

/** 희망 수업 형태 — 코드는 DB CHECK 제약과 일치해야 한다. */
export const LESSON_TYPES = [
  { value: "visit", label: "방문 수업", hint: "선생님이 자택으로 방문합니다" },
  { value: "remote", label: "비대면 수업", hint: "화상으로 진행합니다" },
  { value: "any", label: "상관없음", hint: "상담하며 정하고 싶습니다" },
] as const;
export type LessonType = (typeof LESSON_TYPES)[number]["value"];

/**
 * 학교를 특정할 수 없을 때 고르는 선택지.
 * school_code 는 비워 두고(NULL), 어떤 사유였는지는 memo 끝에 `[학교:...]` 로 남긴다.
 */
export const SCHOOL_FALLBACKS = [
  "목록에 없음",
  "학교 미정",
  "검정고시·N수",
] as const;
export type SchoolFallback = (typeof SCHOOL_FALLBACKS)[number];

export const isGrade = (v: unknown): v is Grade =>
  typeof v === "string" && (GRADES as readonly string[]).includes(v);

export const isLessonType = (v: unknown): v is LessonType =>
  typeof v === "string" &&
  LESSON_TYPES.some((t) => t.value === v);

export const isSchoolFallback = (v: unknown): v is SchoolFallback =>
  typeof v === "string" && (SCHOOL_FALLBACKS as readonly string[]).includes(v);

/** 이름·연락처 제한(서버 검증과 화면 maxLength 가 같은 값을 쓴다). */
export const NAME_MAX = 50;
export const MEMO_MAX = 1000;

/** 한국 휴대폰 번호 → 숫자만 남긴 정규화 값. 형식이 아니면 null. */
export function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (!/^01[016789]\d{7,8}$/.test(digits)) return null;
  // 010-1234-5678 / 011-123-4567 형태로 통일해 저장한다.
  return digits.length === 11
    ? `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
    : `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
}
