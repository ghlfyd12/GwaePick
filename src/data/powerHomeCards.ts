/**
 * /power 홈 리뉴얼 — 시각 앵커 섹션 데이터 단일 소스(언어 카드·진행 3단계·학교 배너·히어로 이미지).
 *
 * 이미지는 실존 에셋만 참조하고 alt 는 실제 내용과 일치. 카피는 확정본(조사·띄어쓰기만 보정).
 * 협력사명·성과 보장·느낌표·대체 호칭(강사 등) 미사용. 색은 accent 토큰(퍼플, /power 스코프)만.
 */

/** 섹션 1 히어로 우측 이미지. */
export const powerHomeHeroImage = {
  src: "/images/power-hero-main.png",
  alt: "헤드셋을 끼고 노트북으로 온라인 수업을 듣는 모습",
} as const;

/** 섹션 2 언어 선택 3카드 — 언어 상세 히어로 이미지 재사용. */
export const powerLanguageCards = [
  {
    id: "english",
    name: "영어",
    image: "/images/power-hero-english.png",
    alt: "노트북을 두고 둘러앉아 함께 공부하는 사람들",
    blurb: "원어민 회화부터 시험·유학 준비까지",
    href: "/power/english",
  },
  {
    id: "chinese",
    name: "중국어",
    image: "/images/power-hero-chinese.png",
    alt: "칠판 앞 선생님과 함께 중국어를 공부하는 학생들",
    blurb: "성조와 병음부터 HSK까지",
    href: "/power/chinese",
  },
  {
    id: "japanese",
    name: "일본어",
    image: "/images/power-hero-japanese.png",
    alt: "선생님과 나란히 앉아 학습지를 보며 공부하는 학생",
    blurb: "히라가나부터 JLPT까지",
    href: "/power/japanese",
  },
] as const;

/** 섹션 3 진행 방식 3단계(이미지 없음). */
export const powerHomeSteps = [
  { no: 1, title: "수준 진단", desc: "상담 선생님이 지금 수준과 목표를 먼저 확인합니다" },
  {
    no: 2,
    title: "선생님 연결",
    desc: "원어민·교포·한국인 선생님 중 호흡이 맞는 분을 1:1로 연결합니다",
  },
  { no: 3, title: "수업과 관리", desc: "수업 녹음과 피드백으로 복습까지 이어집니다" },
] as const;

/** 섹션 4 학교별 안내 배너. */
export const powerSchoolBanner = {
  image: "/images/power-school-banner.png",
  alt: "교복을 입고 노트북으로 공부하는 학생",
  title: "외고·국제중·국제고 재학생이라면",
  desc: "학교별 수행평가와 어학 수업을 안내해 드립니다",
  href: "/power/schools",
} as const;
