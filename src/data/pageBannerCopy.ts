/**
 * 지식의참견 학교×과목·지역×과목·과목별 상세 페이지 공용 안내 배너 문구 단일 소스.
 *
 * 컴포넌트(PageBanner)는 렌더링만 한다. 이미지는 /power 배너와 동일 파일을 경로 참조(복제 없음).
 * 링크는 각 페이지 상담 폼 앵커(#consult)로 연결한다.
 *
 * 워딩 규칙: "선생님 / 상담 선생님"로 통일. 금지 표현·과장 문장부호·성과 보장 문구 미사용.
 *   연령을 특정하는 호칭(어린 학습자 지칭 등)은 배너 문구에 쓰지 않는다. 색은 accent 토큰(코랄) — 컴포넌트에서 처리.
 */

export interface PageBannerContent {
  title: string;
  desc: string;
}

/** /power 배너와 동일한 이미지·경로를 공용 참조. */
export const PAGE_BANNER_IMAGE = "/images/power-school-banner.png";
export const PAGE_BANNER_ALT = "교복을 입고 노트북으로 공부하는 학생";
/** 링크 문구(화살표는 컴포넌트에서 문자로 표시). */
export const PAGE_BANNER_LINK_LABEL = "무료 상담 신청";
export const PAGE_BANNER_HREF = "#consult";

/** 학교×과목 — 학교급(라벨) 분기. levelLabel 예: "고등학교"·"중학교"·"초등학교". */
export function buildSchoolBanner(
  schoolName: string,
  subjectLabel: string,
  levelLabel: string,
): PageBannerContent {
  const title = `${schoolName} 재학생이라면`;
  let desc: string;
  if (levelLabel.includes("고등")) {
    desc = `내신과 수능을 함께 준비하도록 ${subjectLabel} 수업을 학교 일정에 맞춰 안내해 드립니다`;
  } else if (levelLabel.includes("중학")) {
    desc = `내신과 수행평가에 맞춰 ${subjectLabel} 수업을 학교 일정에 따라 안내해 드립니다`;
  } else {
    desc = `기초와 공부 습관부터 ${subjectLabel} 수업을 단계에 맞춰 안내해 드립니다`;
  }
  return { title, desc };
}

/** 지역×과목. */
export function buildRegionBanner(
  regionName: string,
  subjectLabel: string,
): PageBannerContent {
  return {
    title: `${regionName}에서 ${subjectLabel} 과외를 찾고 있다면`,
    desc: "직접 가르쳐 온 상담 선생님이 상황과 목표를 듣고 맞는 선생님을 안내해 드립니다",
  };
}

/** 과목별 상세. */
export function buildSubjectBanner(subjectLabel: string): PageBannerContent {
  return {
    title: `${subjectLabel} 과외를 알아보는 중이라면`,
    desc: "직접 가르쳐 온 상담 선생님이 현재 수준에 맞는 시작점을 안내해 드립니다",
  };
}
