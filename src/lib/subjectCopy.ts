/**
 * 과목 카피의 학교급 오버라이드 병합 — 학교별 상세페이지 렌더 경로 전용.
 *
 * subjects.ts 의 Subject.levelOverrides 를 필드 단위로 병합해, 지정된 필드만 교체한 Subject 를 반환한다.
 *  - 학교별 상세(by-school/[학교]/[과목])에서만 사용한다.
 *  - 지역×과목(DongSubjectDetail)·by-subject 페이지는 이 헬퍼를 호출하지 않으므로 기존 출력이 그대로 유지된다.
 *  - 오버라이드가 없으면 원본 subject 를 그대로 반환(참조 동일).
 */
import type { Subject } from "@/data/subjects";

export type SubjectLevel = "elem" | "middle" | "high";

export function resolveSubjectCopy(subject: Subject, level: SubjectLevel): Subject {
  const ov = subject.levelOverrides?.[level];
  if (!ov) return subject;
  // 지정된 필드만 교체(필드 단위 병합) — 나머지 필드는 원본 유지.
  return {
    ...subject,
    ...(ov.why !== undefined ? { why: ov.why } : {}),
    ...(ov.curriculum !== undefined ? { curriculum: ov.curriculum } : {}),
    ...(ov.forWhom !== undefined ? { forWhom: ov.forWhom } : {}),
    ...(ov.teaching !== undefined ? { teaching: ov.teaching } : {}),
  };
}
