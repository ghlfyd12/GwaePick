/**
 * 상담 폼(ConsultForm) 옵션·라벨 — 서비스별 단일 소스(하드코딩 산재 금지).
 *
 * 지식의참견(메인): 학년(초등·중등·고등) + 과목(categories.subjects) + 라벨 "희망 과목".
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
};

/** 공통 학년(초등·중등·고등) — 어학은 여기에 "성인"을 더한다. */
const baseGrades = schoolLevels.map((s) => s.title);

const mainConfig: ConsultFormConfig = {
  gradeOptions: baseGrades,
  choiceOptions: subjects.map((s) => s.title),
  choiceLabel: "희망 과목",
  choicePlaceholder: "과목을 선택해주세요",
};

const powerConfig: ConsultFormConfig = {
  gradeOptions: [...baseGrades, "성인"],
  // 언어명(영어·일본어·중국어)은 languageDetail.ts 단일 소스에서 파생.
  choiceOptions: LANGUAGE_SLUGS.map((slug) => languageDetails[slug].label),
  choiceLabel: "희망 언어",
  choicePlaceholder: "언어를 선택해주세요",
};

/** 서비스별 상담 폼 옵션·라벨. */
export function consultFormConfig(service: ServiceName): ConsultFormConfig {
  return service === SERVICE.power ? powerConfig : mainConfig;
}
