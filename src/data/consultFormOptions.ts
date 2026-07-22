/**
 * 상담 폼(ConsultForm) 옵션·라벨 — 서비스별 단일 소스(하드코딩 산재 금지).
 *
 * 지식의참견(메인): 학년(초등·중등·고등·성인) + 과목(categories.subjects) + 라벨 "희망 과목".
 * 어학의참견(/power): 학년(초등·중등·고등·성인) + 언어(languageDetails) + 라벨 "희망 언어".
 * 옵션·라벨을 컴포넌트에 하드코딩하지 않고 이 파일에서만 서비스별로 주입한다(기존 데이터 재사용).
 */
import { schoolLevels, subjects } from "@/data/categories";
import { languageDetails, LANGUAGE_SLUGS } from "@/data/languageDetail";
import { SERVICE, type ServiceName } from "@/data/service";

export type ConsultFormConfig = {
  /** 학년 옵션(다중 선택). */
  gradeOptions: string[];
  /** 과목/언어 옵션(다중 선택). */
  choiceOptions: string[];
  /** 과목/언어 항목 라벨. */
  choiceLabel: string;
  /** 과목/언어 항목 placeholder. */
  choicePlaceholder: string;
  /** 이름 입력 라벨 — 어학은 성인 회원도 신청하므로 연령 중립 표기. */
  nameLabel: string;
  /** 제출 버튼 라벨. */
  submitLabel: string;
  /** 폼 상단 헤더 카피(단독 상담 페이지에서는 페이지 h1 이 대신하므로 숨긴다). */
  header: {
    eyebrow: string;
    /** 제목 1행(기본색) + 2행(accent 강조). */
    titleTop: string;
    titleAccent: string;
    intro: string;
  };
};

/**
 * 학년 옵션(초등 → 중등 → 고등 → 성인) — 두 서비스 공통.
 * 초·중·고는 schoolLevels(pSEO 학년 데이터) 단일 소스에서 파생하고,
 * 성인은 학교급이 아니므로 이 파일에서만 마지막에 더한다.
 */
const gradeOptions = [...schoolLevels.map((s) => s.title), "성인"];

const mainConfig: ConsultFormConfig = {
  gradeOptions,
  choiceOptions: subjects.map((s) => s.title),
  choiceLabel: "희망 과목",
  choicePlaceholder: "과목을 선택해주세요",
  nameLabel: "학생 이름",
  submitLabel: "체험 수업 신청하기 →",
  header: {
    eyebrow: "문의 및 신청",
    titleTop: "체험 수업",
    titleAccent: "신청하기",
    intro:
      "데이터로 검증된 우리 학교 맞춤 전략, 지금 바로 확인 가능합니다. 상세한 상담을 원하신다면 아래 내용을 작성해 주세요.",
  },
};

const powerConfig: ConsultFormConfig = {
  gradeOptions,
  // 언어명(영어·일본어·중국어)은 languageDetail.ts 단일 소스에서 파생.
  choiceOptions: LANGUAGE_SLUGS.map((slug) => languageDetails[slug].label),
  choiceLabel: "희망 언어",
  choicePlaceholder: "언어를 선택해주세요",
  // 성인 회원도 신청하므로 "학생 이름" 대신 연령 중립 표기.
  nameLabel: "이름",
  submitLabel: "무료 상담 신청하기 →",
  header: {
    eyebrow: "어학 전문 1:1 상담",
    titleTop: "무료 상담",
    titleAccent: "신청하기",
    intro:
      "지금 수준과 목표를 알려주시면, 직접 가르쳐 온 선생님이 어학 수업에 맞는 선생님을 연결해 드립니다.",
  },
};

/** 서비스별 상담 폼 옵션·라벨. */
export function consultFormConfig(service: ServiceName): ConsultFormConfig {
  return service === SERVICE.power ? powerConfig : mainConfig;
}
