/**
 * 어학의참견(/power) 영어·일본어·중국어 상세페이지 콘텐츠 단일 소스(하드코딩 금지).
 *
 * 한 벌의 공용 템플릿(LanguageDetail)이 이 데이터를 언어 키로 받아 렌더한다.
 * 수업 방식·시간·횟수는 3개 언어 공통이라 lessonMethods 공용 상수 1곳에서만 참조한다(복붙 금지).
 *
 * 워딩 규칙: "선생님"으로 통일("강사"·"컨설턴트/코치/멘토" 금지), 느낌표 금지,
 *   포인트 컬러는 코랄(accent 토큰)만, 보라·파랑 강조 금지. 확정값 외 임의 수치 금지.
 */

import type { Metadata } from "next";
import { site } from "@/data/site";

export const LANGUAGE_SLUGS = ["english", "japanese", "chinese"] as const;
export type LanguageSlug = (typeof LANGUAGE_SLUGS)[number];

/** Hero 우측 이미지 — 저작권 안전한 기존 스톡 에셋(플레이스홀더, 3개 언어 공용). */
export const LANGUAGE_HERO_IMAGE = "/images/subject-students.png";

/** 선택 이유 카드 1개. */
export type LanguageReason = { no: string; title: string; desc: string };

/**
 * 수업 방식(3개 언어 공통 확정값). 전화(10·20·30분)·화상(20·30분), 두 방식 모두 주 2·3·5회.
 * 확정값이므로 언어별로 복제하지 않고 여기 한 곳에서만 정의한다.
 */
export const lessonMethods = [
  {
    title: "전화수업",
    desc: "전화만 있으면 어디서든, 듣기에서 말하기로 바로 이어지는 집중 수업",
    durations: ["10분", "20분", "30분"],
    frequencies: ["주 2회", "주 3회", "주 5회"],
  },
  {
    title: "화상수업",
    desc: "얼굴을 보며 자료를 함께 보는, 실제 대화에 가까운 생생한 수업",
    durations: ["20분", "30분"],
    frequencies: ["주 2회", "주 3회", "주 5회"],
  },
] as const;

export type LanguageDetailData = {
  slug: LanguageSlug;
  /** 화면·폼에 쓰는 언어명(영어/일본어/중국어). */
  label: string;
  heroHeadline: string;
  heroSub: string;
  heroChips: string[];
  reasons: LanguageReason[];
  lessonTags: string[];
  closingMessage: string;
  metaTitle: string;
  metaDescription: string;
};

/** 선택 이유 04 — 수업 가능 시간대(3개 언어 공통 확정 문구). */
const REASON_SCHEDULE: LanguageReason = {
  no: "04",
  title: "편한 시간에 맞춘 수업",
  desc: "오전 9시부터 밤 12시까지, 학생 일정에 맞춰 수업 시간을 조율합니다. 사정에 따라 유동적으로 조정할 수 있습니다.",
};

export const languageDetails: Record<LanguageSlug, LanguageDetailData> = {
  english: {
    slug: "english",
    label: "영어",
    heroHeadline: "혼자 외우던 영어, 이제 선생님과 직접 말하며 시작하세요",
    heroSub:
      "현지 원어민과 국내 거주 교포 선생님 중에서, 학생 수준과 목표에 가장 잘 맞는 한 분을 상담으로 직접 찾아 연결해 드립니다.",
    heroChips: ["수준별 1:1", "원어민·교포 선생님", "무료 테스트 수업", "회화·시험·입시"],
    reasons: [
      {
        no: "01",
        title: "원어민·교포 선생님",
        desc: "발음은 원어민에게, 막히는 부분은 한국어로 짚어주는 교포 선생님에게. 두 선생님 풀에서 맞는 분을 연결합니다.",
      },
      {
        no: "02",
        title: "무료 테스트 수업 후 맞춤 매칭",
        desc: "먼저 한 번 수업해 본 뒤, 아이와 호흡이 맞는 선생님·과목·교재·진도를 원하는 대로 맞춥니다.",
      },
      {
        no: "03",
        title: "수준별 1:1 진단",
        desc: "발음·어휘·문법·듣기를 진단해, 약한 곳에 시간을 집중합니다.",
      },
      REASON_SCHEDULE,
    ],
    lessonTags: [
      "기초", "파닉스", "회화", "일상회화", "국제학교", "에세이", "미국교과서",
      "유학", "내신", "수능", "수행평가", "문법", "독해", "어휘",
      "비즈니스 회화", "인터뷰", "프레젠테이션", "인증시험(토익·토플·오픽)", "워킹홀리데이",
    ],
    closingMessage:
      "지금 막힌 한 곳도, 맞는 선생님과 함께 말하다 보면 충분히 달라집니다. 오늘 상담으로 첫걸음을 시작하세요.",
    metaTitle: "영어 1:1 원어민·교포 회화 과외 | 어학의참견",
    metaDescription:
      "현지 원어민과 국내 거주 교포 선생님 중 학생 수준·목표에 맞는 한 분을 상담으로 연결합니다. 회화·시험·입시까지 1:1 맞춤 영어 과외.",
  },
  japanese: {
    slug: "japanese",
    label: "일본어",
    heroHeadline: "히라가나부터 JLPT까지, 일본어를 직접 말하며 시작하세요",
    heroSub:
      "원어민·교포 선생님과 1:1로, 회화부터 시험·유학까지 학생 목표에 맞춰 진행합니다.",
    heroChips: ["수준별 1:1", "원어민·교포 선생님", "무료 테스트 수업", "회화·JLPT·유학"],
    reasons: [
      {
        no: "01",
        title: "원어민·교포 선생님",
        desc: "자연스러운 발음은 원어민에게, 문법·독해는 한국어로 짚어주는 교포 선생님에게.",
      },
      {
        no: "02",
        title: "무료 테스트 수업 후 맞춤 매칭",
        desc: "한 번 수업해 본 뒤, 호흡이 맞는 선생님·교재·진도를 원하는 대로 맞춥니다.",
      },
      {
        no: "03",
        title: "수준별 1:1 진단",
        desc: "발음·문형·어휘·청해를 진단해 약한 곳부터 채웁니다.",
      },
      REASON_SCHEDULE,
    ],
    lessonTags: [
      "히라가나·가타카나", "기초", "일상회화", "JLPT(N5~N1)", "비즈니스 일본어",
      "드라마·애니로 배우기", "문법", "한자", "유학 대비", "제2외국어 내신·수능", "여행",
    ],
    closingMessage:
      "글자부터 시작해도 괜찮습니다. 맞는 선생님과 함께라면 일본어로 말하는 날이 생각보다 빨리 옵니다. 오늘 상담으로 시작하세요.",
    metaTitle: "일본어 1:1 원어민·교포 회화·JLPT 과외 | 어학의참견",
    metaDescription:
      "히라가나부터 JLPT까지, 원어민·교포 선생님과 1:1로 진행하는 일본어 과외. 학생 목표에 맞는 선생님을 상담으로 연결합니다.",
  },
  chinese: {
    slug: "chinese",
    label: "중국어",
    heroHeadline: "병음과 성조부터 HSK까지, 중국어를 제대로 시작하세요",
    heroSub:
      "원어민·교포 선생님과 1:1로, 회화부터 시험·비즈니스까지 학생 목표에 맞춰 진행합니다.",
    heroChips: ["수준별 1:1", "원어민·교포 선생님", "무료 테스트 수업", "회화·HSK·비즈니스"],
    reasons: [
      {
        no: "01",
        title: "원어민·교포 선생님",
        desc: "성조·발음은 원어민에게, 어법·독해는 한국어로 짚어주는 교포 선생님에게.",
      },
      {
        no: "02",
        title: "무료 테스트 수업 후 맞춤 매칭",
        desc: "한 번 수업해 본 뒤, 호흡이 맞는 선생님·교재·진도를 원하는 대로 맞춥니다.",
      },
      {
        no: "03",
        title: "수준별 1:1 진단",
        desc: "성조·발음·어법·듣기를 진단해 약한 곳부터 잡습니다.",
      },
      REASON_SCHEDULE,
    ],
    lessonTags: [
      "병음·성조", "기초·입문", "수준별 회화", "HSK(1~6급)", "HSKK·TSC·OPIc",
      "비즈니스 중국어", "여행 중국어", "내신·수행평가", "입시·유학", "어법·어휘",
    ],
    closingMessage:
      "성조가 어렵게 느껴져도, 맞는 선생님과 반복하면 자연스럽게 익습니다. 오늘 상담으로 첫걸음을 시작하세요.",
    metaTitle: "중국어 1:1 원어민·교포 회화·HSK 과외 | 어학의참견",
    metaDescription:
      "병음·성조부터 HSK까지, 원어민·교포 선생님과 1:1로 진행하는 중국어 과외. 학생 목표에 맞는 선생님을 상담으로 연결합니다.",
  },
};

/**
 * 언어 상세페이지 메타데이터 빌더 — 3개 라우트 파일이 공유(중복 제거).
 * metaTitle 이 이미 "… | 어학의참견" 이라 title.absolute 로 루트 템플릿 덧붙임을 막는다.
 */
export function buildLanguageMetadata(slug: LanguageSlug): Metadata {
  const data = languageDetails[slug];
  const canonical = `/power/${slug}`;
  return {
    title: { absolute: data.metaTitle },
    description: data.metaDescription,
    alternates: { canonical },
    openGraph: {
      title: data.metaTitle,
      description: data.metaDescription,
      url: canonical,
      type: "website",
      locale: "ko_KR",
      siteName: site.name,
      images: [site.ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: data.metaTitle,
      description: data.metaDescription,
      images: [site.ogImage],
    },
  };
}
