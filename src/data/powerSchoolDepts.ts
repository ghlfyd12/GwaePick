/**
 * 어학의참견(/power) 유형 B — 특목 어학계열 학교 × 언어 수행평가 페이지 데이터 소스.
 *
 * 단위: 학교 × 언어(english/chinese/japanese). 학과명(예: "일본어과", "영일본어과")은
 * 페이지 본문 표기용 라벨(deptLabel)로만 쓰고, URL·페이지 생성 단위는 언어다.
 * URL: /power/performance/[school]/[lang] (2안).
 *
 * 생성 게이트: langs[lang].offered && langs[lang].verified 인 조합만 페이지를 생성한다.
 *   offered=false(미개설, 예: 이화외고·전남외고 일본어)는 어떤 경로로도 페이지를 만들지 않는다.
 *   powerSchoolExclusions 에 든 학교는 언어와 무관하게 전부 제외한다.
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

/** 페이지 생성 언어 순서(내부 링크·정적 생성 순회에 쓰는 정렬 기준). */
export const POWER_LANGS: readonly PowerLang[] = ["english", "chinese", "japanese"];

/** 언어 slug → 화면 표기 언어명(유형 A·B 공용 단일 소스 — 순환 import 방지 위해 base 모듈에 둔다). */
export const POWER_LANG_LABEL: Record<PowerLang, string> = {
  english: "영어",
  chinese: "중국어",
  japanese: "일본어",
};

/** 학교 유형 — 외고 / 국제고 / 국제중. 국제고·중은 영어 단일 운영. */
export type PowerSchoolKind = "foreign" | "intl-high" | "intl-middle";

/** 학교 × 언어 셀 — 교육과정 존재 여부 + 본문 표기 라벨 + 생성 게이트. */
export interface PowerSchoolLangInfo {
  /** 해당 언어 교육과정(전공어과·정규 편성 등) 존재 여부. */
  offered: boolean;
  /** 본문 표기용 실제 학과명(예: "일본어과", "영일본어과"). 없으면 언어명으로 대체. */
  deptLabel?: string;
  /** false 면 페이지 미생성(검증 게이트). offered 여도 검증 전이면 false 로 둔다. */
  verified: boolean;
}

/** 유형 B 대상 학교 1교 — 언어 3종의 개설·검증 상태. */
export interface PowerSchoolEntry {
  /** schools.ts 의 고유 slug(식별 키). */
  schoolSlug: string;
  kind: PowerSchoolKind;
  /** 언어별 개설·검증 정보. 셋 다 명시(미개설은 offered:false). */
  langs: Record<PowerLang, PowerSchoolLangInfo>;
}

/**
 * 유형 B에서 제외하는 학교 slug(특목 어학계열 아님·전환 등). 언어 무관 전량 제외.
 *  - gangwonoego         : 강원외국어고등학교 — 일반고 전환.
 *  - gukjego             : 광주 북구 "국제고등학교"(slug gukjego) — 특목 국제고 아님(사립 일반고).
 *  - jinjuoego           : 진주외국어고등학교 — 이름만 외고인 일반고.
 *  - jeonnammiraegukjego : 전남미래국제고 — 직업교육 대안학교(어학 특목 아님).
 * 참고: "부일외국어고등학교"(자사고 전환)는 schools.ts 에 항목 자체가 없어 제외 slug 가 없다.
 *   (부산의 특목 외고는 "부산외고" busanoego 로 별개 학교다.)
 */
export const powerSchoolExclusions: readonly string[] = [
  "gangwonoego",
  "gukjego",
  "jinjuoego",
  "jeonnammiraegukjego",
];

/* ── 셀 생성 헬퍼 — 표를 그대로 옮기되 보일러플레이트만 줄인다(값은 표 그대로). ── */
/** 개설·검증 완료 셀. deptLabel 은 실제 학과명(없으면 생략). */
const on = (deptLabel?: string): PowerSchoolLangInfo => ({
  offered: true,
  verified: true,
  ...(deptLabel ? { deptLabel } : {}),
});
/** 외고 "X" — 개설 안 함(검증됨). 페이지 미생성. */
const offForeign: PowerSchoolLangInfo = { offered: false, verified: true };
/** 국제고·중 비영어 — 미개설(미검증). 페이지 미생성. */
const offIntl: PowerSchoolLangInfo = { offered: false, verified: false };

/** 외고 1교 — english 라벨 + 중국어/일본어 셀. */
const foreign = (
  schoolSlug: string,
  englishDept: string,
  chinese: PowerSchoolLangInfo,
  japanese: PowerSchoolLangInfo,
): PowerSchoolEntry => ({
  schoolSlug,
  kind: "foreign",
  langs: { english: on(englishDept), chinese, japanese },
});

/** 국제고·국제중 1교 — english 만 개설, 학과 라벨 없음. */
const intl = (
  schoolSlug: string,
  kind: "intl-high" | "intl-middle",
): PowerSchoolEntry => ({
  schoolSlug,
  kind,
  langs: { english: on(), chinese: offIntl, japanese: offIntl },
});

/**
 * 유형 B 학교 데이터(검증 완료). 외고 28 + 국제고 8 + 국제중 5 = 41교.
 * 생성 대상 조합(offered && verified, 제외 제외) = 95페이지.
 */
export const powerSchoolDepts: PowerSchoolEntry[] = [
  /* ── 외고 28교 ── */
  foreign("daewonoego", "영어 중심 교육과정", on("중국어과"), on("일본어과")),
  foreign("daeiroego", "영어 중심 교육과정", on("중국어과"), on("일본어과")),
  foreign("myeongdeogoego", "영어과", on("중국어과"), on("일본어과")),
  foreign("seouroego", "영어과", on("중국어과"), on("일본어과")),
  foreign("ihwaoego", "영어과", on("중국어과"), offForeign), // 일본어과 폐과 → 미개설
  foreign("hanyeongoego", "영어과", on("중국어과"), on("일본어과")),
  foreign("gyeonggioego", "영어과", on("중국어과"), on("일본어과")),
  foreign("goyangoego", "영어과", on("중국어과"), on("일본어과")),
  foreign("gwacheonoego", "영어과", on("중국어과"), on("일본어과")),
  foreign("gimpooego", "영어과", on("중국어과"), on("일본어과")),
  foreign("dongducheonoego", "영어과", on("중국어과"), on("일본어과")),
  foreign("seongnamoego", "영어과", on("중국어과"), on("일본어과")),
  foreign("suwonoego", "영어과", on("중국어과"), on("일본어과")),
  foreign("anyangoego", "영어과", on("중국어과"), on("일본어과")),
  foreign("michuhoroego", "영어 중심 교육과정", on("영어-중국어과"), on("영어-일본어과")),
  foreign("incheonoego", "영어 중심 교육과정", on("영중과"), on("영일과")),
  foreign("busanoego", "영어 중심 교육과정", on("영중국어과"), on("영일본어과")),
  foreign("daeguoego", "영어과", on("중국어과"), on("일본어과")),
  foreign("daejeonoego", "영어과", on("중국어과"), on("일본어과")),
  foreign("ulsanoego", "영어과", on("중국어과"), on("일본어과")),
  foreign("chungbugoego", "영어과", on("중국어과"), on("일본어과")),
  foreign("chungnamoego", "영어과", on("중국어과"), on("일본어과")),
  foreign("jeonbugoego", "영어 중심 교육과정", on("영·중국어과"), on("영·일본어과")),
  foreign("jeonnamoego", "영어과", on("중국어과"), offForeign), // 일본어 미개설
  foreign("gyeongbugoego", "영어과", on("중국어과"), on("일본어과")),
  foreign("gyeongnamoego", "영어 중심 교육과정", on("영중국어과"), on("영일본어과")),
  foreign("gimhaeoego", "영어 중심 교육과정", on("영어중국어과"), on("영어일본어과")),
  foreign("jejuoego", "영어과", on("중국어과"), on("일본어과")),

  /* ── 국제고 8교 (english 단일) ── */
  intl("cheongsimgukjego", "intl-high"),
  intl("goyanggukjego", "intl-high"),
  intl("dongtangukjego", "intl-high"),
  intl("seoulgukjego", "intl-high"),
  intl("incheongukjego", "intl-high"),
  intl("sejonggukjego", "intl-high"),
  intl("daegugukjego", "intl-high"),
  intl("busangukjego", "intl-high"),

  /* ── 국제중 5교 (english 단일) ── */
  intl("cheongsimgukjejung", "intl-middle"),
  intl("yeonghungukjejung", "intl-middle"),
  intl("daewongukjejung", "intl-middle"),
  intl("busangukjejung", "intl-middle"),
  intl("seoningukjejung", "intl-middle"),
];

/* ── 조회 헬퍼 ──────────────────────────────────────────────────────── */
const bySlug: Map<string, PowerSchoolEntry> = new Map(
  powerSchoolDepts.map((e) => [e.schoolSlug, e]),
);
const exclusionSet = new Set(powerSchoolExclusions);

/** 제외 목록에 없는 학교의 엔트리를 찾는다. 없거나 제외면 null. */
export function getPowerSchoolEntry(schoolSlug: string): PowerSchoolEntry | null {
  if (exclusionSet.has(schoolSlug)) return null;
  return bySlug.get(schoolSlug) ?? null;
}

/** (학교, 언어) 조합이 페이지 생성 대상인지 — 제외 아님 + offered && verified. */
export function isPowerPerformanceAllowed(
  schoolSlug: string,
  lang: PowerLang,
): boolean {
  const entry = getPowerSchoolEntry(schoolSlug);
  if (!entry) return false;
  const info = entry.langs[lang];
  return info.offered && info.verified;
}

/** 한 학교에서 페이지가 생성되는(offered && verified) 언어 목록 — 내부 링크·상호 연결용. */
export function offeredLangs(schoolSlug: string): PowerLang[] {
  const entry = getPowerSchoolEntry(schoolSlug);
  if (!entry) return [];
  return POWER_LANGS.filter((l) => entry.langs[l].offered && entry.langs[l].verified);
}

/** 정적 생성용 전체 (학교, 언어) 조합 — generateStaticParams 단일 소스. */
export function allPowerPerformancePairs(): { school: string; lang: PowerLang }[] {
  const out: { school: string; lang: PowerLang }[] = [];
  for (const entry of powerSchoolDepts) {
    if (exclusionSet.has(entry.schoolSlug)) continue;
    for (const lang of POWER_LANGS) {
      const info = entry.langs[lang];
      if (info.offered && info.verified) out.push({ school: entry.schoolSlug, lang });
    }
  }
  return out;
}
