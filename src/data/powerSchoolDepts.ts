/**
 * 어학의참견(/power) 유형 B — 특목 어학계열 학교 × 언어 수행평가 페이지 데이터 소스.
 *
 * 단위: 학교 × 언어(english/chinese/japanese). 학과명(예: "일본어과", "영어-일본어과")은
 * 페이지 본문 표기용 라벨(deptLabel)로만 쓰고, URL·페이지 생성 단위는 언어다.
 * URL: /power/performance/[school]/[lang] (2안 승인).
 *
 * 생성 게이트: langs[lang].verified === true 인 조합만 페이지를 생성한다.
 *   offered=false(미개설) 또는 verified=false(미검증)는 렌더하지 않는다 — 추정으로 채우지 않는다.
 *
 * 워딩 규칙(/power 공통): "선생님 / 상담 선생님 / 원어민 선생님 / 관리" 로 통일.
 *   금지어(컨설턴트·컨설팅·코치·코칭·멘토·강사)·느낌표 미사용. "원어민 강사"(X) → "원어민 선생님"(O).
 *   포인트 컬러는 accent 토큰 — /power 스코프에서 퍼플(#7D0096)로 오버라이드된다(코랄 금지).
 *
 * 식별 키: schools.ts 의 고유 slug(dedup 완료). schools.ts 는 수정하지 않으며, 제외는
 *   powerSchoolExclusions 배열로만 처리한다.
 */

/** 유형 B 페이지 생성 언어 단위. */
export type PowerLang = "english" | "chinese" | "japanese";

/** 학교 유형 — 외고 / 국제고 / 국제중. 국제고·중은 영어 단일 운영. */
export type PowerSchoolKind = "foreign" | "intl-high" | "intl-middle";

/** 학교 × 언어 셀 — 교육과정 존재 여부 + 본문 표기 라벨 + 생성 게이트. */
export interface PowerSchoolLangInfo {
  /** 해당 언어 교육과정(전공어과·정규 편성 등) 존재 여부. */
  offered: boolean;
  /** 본문 표기용 실제 학과명(예: "일본어과", "영어-일본어과"). 없으면 언어명으로 대체. */
  deptLabel?: string;
  /** false 면 페이지 미생성(검증 게이트). offered 여도 검증 전이면 false 로 둔다. */
  verified: boolean;
}

/** 유형 B 대상 학교 1교 — 언어 3종의 개설·검증 상태. */
export interface PowerSchoolEntry {
  /** schools.ts 의 고유 slug(식별 키). */
  schoolSlug: string;
  kind: PowerSchoolKind;
  /** 언어별 개설·검증 정보. 셋 다 명시(미개설은 offered:false, verified:false). */
  langs: Record<PowerLang, PowerSchoolLangInfo>;
}

/**
 * 유형 B에서 제외하는 학교 slug(특목 어학계열 아님·전환 등).
 *  - gangwonoego  : 강원외국어고등학교 — 일반고 전환.
 *  - gukjego      : 광주 북구 "국제고등학교"(slug gukjego) — 특목 국제고 아님(사립 일반고).
 * 참고: "부일외국어고등학교"(자사고 전환)는 schools.ts 에 항목 자체가 없어 제외 대상 slug 가 없다.
 *   (부산의 특목 외고는 "부산외고" busanoego 로 별개 학교다.)
 */
export const powerSchoolExclusions: string[] = ["gangwonoego", "gukjego"];

/**
 * 유형 B 학교 데이터 — 내용은 사용자 제공 데이터로 채운다(추정 금지).
 *
 * 채울 때 주의:
 *  - 국제고(intl-high)·국제중(intl-middle)은 english 만 offered:true, chinese·japanese 는 offered:false.
 *  - 외고(foreign)는 개설 전공어과에 맞춰 언어별 offered 를 설정하고 deptLabel 에 실제 학과명을 넣는다.
 *  - 이화외고(ihwaoego) × japanese 는 폐과(미개설) → offered:false, verified:false 로 두어 페이지 생성 금지.
 */
export const powerSchoolDepts: PowerSchoolEntry[] = [
  // TODO(사용자 제공): 대상 43교(외고 29 + 국제고 9 + 국제중 5, 제외 2교 반영) 데이터.
];
