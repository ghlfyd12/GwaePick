/**
 * 어학의참견(/power) 지역×어학시험 축 — 페이지 콘텐츠·메타·내부링크 단일 소스(신규).
 *
 * /power/by-region/[region]/[exam] 라우트가 쓴다(기존 회화 [subject] 세그먼트가 시험 slug 도 잡으므로
 * 라우트에서 isExamSlug 로 분기). 지역축은 전국 253 시군구(sidoRegions REGIONS) 전량이며,
 * 각 시군구는 기존 회화 라우트에 이미 존재하는 한글 slug 로 매핑한다(963 경유 또는 확장 시군구 허브 경유).
 * 이렇게 하면 시험 페이지 ↔ 같은 지역 회화 페이지 상호 링크가 깨지지 않는다. 신도시/생활권은 제외.
 *
 * 워딩 규칙(CLAUDE.md·지침서): "선생님 / 상담 선생님 / 지도"로 통일. 금지 표현·과장 문장부호·
 *   성과 보장 문구 미사용, 시험 지도 경험 중심 서술. 색은 accent 토큰(퍼플)만 — 컴포넌트에서 처리.
 */
import type { Metadata } from "next";
import { site } from "@/data/site";
import { REGIONS } from "@/data/sidoRegions";
import { resolvePowerRegionName } from "@/data/powerRegions";
import {
  getExpansionRegion,
  isExpansionRegionSlug,
} from "@/data/powerRegionsExpansion";
import { isKnownPowerRegion } from "@/data/byRegionSubject";
import {
  examBySlug,
  isExamSlug,
  examsOfLanguage,
  SPEAKING_EXAM_SLUGS,
  REPRESENTATIVE_EXAM_SLUG,
  LANGUAGE_CONVERSATION_SLUG,
  LANGUAGE_LABEL,
  type PowerExam,
} from "@/data/power/exams";

/* ── 지역 slug 정규화(라우트 파라미터가 인코딩·NFD 로 와도 매칭) ── */
const nfc = (s: string) => s.normalize("NFC");
const slugKey = (s: string): string => {
  try {
    return decodeURIComponent(s).normalize("NFC");
  } catch {
    return nfc(s);
  }
};

/** 시도 정식명 → 짧은 표기(확장 시군구 허브 slug 접두 규칙과 동일). */
const SIDO_SHORT: Record<string, string> = {
  경기도: "경기",
  강원도: "강원",
  강원특별자치도: "강원",
  경상남도: "경남",
  경상북도: "경북",
  광주광역시: "광주",
  대구광역시: "대구",
  대전광역시: "대전",
  부산광역시: "부산",
  서울특별시: "서울",
  세종특별자치시: "세종",
  울산광역시: "울산",
  인천광역시: "인천",
  전라남도: "전남",
  전라북도: "전북",
  전북특별자치도: "전북",
  제주특별자치도: "제주",
  충청남도: "충남",
  충청북도: "충북",
};

export type ExamRegion = {
  /** 라우트 [region] 파라미터로 쓰는 한글 slug(기존 회화 라우트가 해석 가능). */
  slug: string;
  /** 화면 표기 지역명. */
  name: string;
  /** 소속 시도 정식명. */
  sidoLabel: string;
  /** sidoRegions 원본 시군구명(파일럿 선별용). */
  sigunguName: string;
};

/**
 * 전국 253 시군구 → 라우트 가능한 한글 slug 매핑(모듈 로드 시 1회 계산).
 * 후보 우선순위: [시군구명, "{시도short} {시군구명}", "{시도} {시군구명}"] 중
 * 963(isKnownPowerRegion) 또는 확장(isExpansionRegionSlug)이 해석하는 첫 값.
 */
export const examRegions: ExamRegion[] = (() => {
  const out: ExamRegion[] = [];
  for (const sido of REGIONS) {
    const short = SIDO_SHORT[sido.label] ?? sido.label;
    for (const sg of sido.sigungu) {
      const candidates = [sg.name, `${short} ${sg.name}`, `${sido.label} ${sg.name}`];
      let slug: string | null = null;
      for (const c of candidates) {
        if (isKnownPowerRegion(c) || isExpansionRegionSlug(c)) {
          slug = c;
          break;
        }
      }
      if (!slug) continue; // 라우트 미해석 시군구는 제외(회화 페이지가 없으므로 링크 대상 부적합)
      const name = isKnownPowerRegion(slug)
        ? resolvePowerRegionName(slug)
        : getExpansionRegion(slug)?.name ?? slug;
      out.push({ slug, name, sidoLabel: sido.label, sigunguName: sg.name });
    }
  }
  return out;
})();

const examRegionSlugSet = new Set(examRegions.map((r) => nfc(r.slug)));
const examRegionBySlug = new Map(examRegions.map((r) => [nfc(r.slug), r]));

/** 지역 파라미터가 어학시험 지역축(253 시군구)에 속하는지. */
export function isExamRegionSlug(regionParam: string): boolean {
  return examRegionSlugSet.has(slugKey(regionParam));
}

/** (지역, 시험) 조합이 페이지 생성 대상인지. */
export function isByExamAllowed(regionParam: string, examSlug: string): boolean {
  return isExamSlug(examSlug) && isExamRegionSlug(regionParam);
}

/** 지역 파라미터 → 표기명(축에 있으면 표준 표기명, 없으면 해석 시도). */
function resolveExamRegionName(regionParam: string): string {
  const hit = examRegionBySlug.get(slugKey(regionParam));
  if (hit) return hit.name;
  if (isKnownPowerRegion(regionParam)) return resolvePowerRegionName(regionParam);
  return getExpansionRegion(regionParam)?.name ?? slugKey(regionParam);
}

export type ExamLink = { href: string; label: string };

export type ByExamPageData = {
  regionSlug: string;
  regionName: string;
  examSlug: string;
  exam: PowerExam;
  head: string; // "{지역명} {시험명}"
  metaTitle: string;
  metaDescription: string;
  /** Hero 소개 3문장. */
  intro: string;
  /** 준비 포인트 섹션 제목·부제. */
  prepHeading: string;
  prepSubtitle: string;
  /** 연결 안내 본문. */
  matchBody: string;
  /** 관련 페이지: 같은 지역 회화 1 + 같은 언어 다른 시험 전부 + 다른 언어 대표 시험 각 1. */
  relatedLinks: ExamLink[];
};

const CLASS_INFO_SUBTITLE =
  "전화·화상으로 어디서든 가능합니다. 지금 수준과 목표에 맞춰 필요한 것부터 1:1로 채웁니다.";

/** (지역, 시험) → 페이지 데이터. 대상이 아니면 null(라우트에서 notFound). */
export function buildByExamData(
  regionParam: string,
  examSlug: string,
): ByExamPageData | null {
  const exam = examBySlug.get(examSlug);
  if (!exam) return null;
  if (!isExamRegionSlug(regionParam)) return null;

  const region = examRegionBySlug.get(slugKey(regionParam));
  const regionSlug = region ? region.slug : slugKey(regionParam);
  const regionName = region ? region.name : resolveExamRegionName(regionParam);
  const enc = encodeURIComponent(regionSlug);
  const speaking = SPEAKING_EXAM_SLUGS.has(examSlug);

  const head = `${regionName} ${exam.name}`;
  const metaTitle = speaking
    ? `${regionName} ${exam.name} 과외 | 어학의참견 - 1:1 말하기 시험 준비`
    : `${regionName} ${exam.name} 과외 | 어학의참견 - 1:1 맞춤 시험 준비`;
  const metaDescription =
    `${regionName}에서 ${exam.name}을 준비하는 분을 위한 1:1 과외. 직접 가르쳐 온 상담 ` +
    `선생님이 수준과 목표를 듣고 호흡이 맞는 선생님을 연결해 드립니다. 첫 상담은 무료입니다.`;

  const intro =
    `${regionName}에서 ${exam.name}을 준비하는 분들의 목표와 일정은 저마다 다릅니다. ` +
    `직접 가르쳐 온 상담 선생님이 현재 수준과 목표 점수, 준비 기간을 먼저 듣습니다. ` +
    `시험 경험이 있는 선생님 중에서 호흡이 맞는 분을 1:1로 연결해 드립니다.`;

  const prepHeading = `${exam.name}, ${regionName}에서 이렇게 준비합니다`;

  const matchBody =
    `직접 가르쳐 온 상담 선생님이 ${regionName}의 생활 반경과 목표를 먼저 듣습니다. ` +
    `시험 준비 경험과 지도 방식이 맞는 선생님을 1:1로 연결하고, 잘 맞지 않으면 다시 ` +
    `연결해 드립니다. 첫 상담은 무료입니다.`;

  // ── 관련 링크: 같은 지역 회화 1 + 같은 언어 다른 시험 전부 + 다른 언어 대표 시험 각 1 ──
  const relatedLinks: ExamLink[] = [];
  relatedLinks.push({
    href: `/power/by-region/${enc}/${LANGUAGE_CONVERSATION_SLUG[exam.language]}`,
    label: `${regionName} ${LANGUAGE_LABEL[exam.language]}회화`,
  });
  for (const e of examsOfLanguage(exam.language)) {
    if (e.slug === examSlug) continue;
    relatedLinks.push({
      href: `/power/by-region/${enc}/${e.slug}`,
      label: `${regionName} ${e.name}`,
    });
  }
  for (const lang of ["english", "japanese", "chinese"] as const) {
    if (lang === exam.language) continue;
    const repSlug = REPRESENTATIVE_EXAM_SLUG[lang];
    const rep = examBySlug.get(repSlug);
    if (!rep) continue;
    relatedLinks.push({
      href: `/power/by-region/${enc}/${rep.slug}`,
      label: `${regionName} ${rep.name}`,
    });
  }

  return {
    regionSlug,
    regionName,
    examSlug,
    exam,
    head,
    metaTitle,
    metaDescription,
    intro,
    prepHeading,
    prepSubtitle: CLASS_INFO_SUBTITLE,
    matchBody,
    relatedLinks,
  };
}

/** /power 전용 시험 페이지 메타데이터 빌더. */
export function buildByExamMetadata(
  regionParam: string,
  examSlug: string,
): Metadata {
  const data = buildByExamData(regionParam, examSlug);
  if (!data) return {};
  const canonical = `/power/by-region/${encodeURIComponent(data.regionSlug)}/${examSlug}`;
  return {
    title: { absolute: data.metaTitle },
    description: data.metaDescription,
    alternates: { canonical },
    robots: { index: true, follow: true },
    openGraph: {
      title: data.metaTitle,
      description: data.metaDescription,
      url: canonical,
      type: "website",
      locale: "ko_KR",
      siteName: site.power.name,
      images: [site.power.ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: data.metaTitle,
      description: data.metaDescription,
      images: [site.power.ogImage],
    },
  };
}

/* ── 정적 생성 & sitemap ─────────────────────────────────────────────── */

/** 파일럿 SSG 대상 시군구(원본 시군구명 기준) — 나머지는 dynamicParams 로 요청 시 렌더. */
const EXAM_PILOT_SIGUNGU: ReadonlySet<string> = new Set([
  "관악구", // 서울(수도권)
  "강남구", // 서울(수도권)
  "고양시 덕양구", // 경기(수도권)
  "수원시 영통구", // 경기(수도권)
  "해운대구", // 부산(비수도권)
  "수성구", // 대구(비수도권)
]);

/** 파일럿 시군구 목록(라우트 slug). 회화 역방향 링크 SSG 검증에도 재사용. */
export function examPilotRegionSlugs(): string[] {
  return examRegions
    .filter((r) => EXAM_PILOT_SIGUNGU.has(r.sigunguName))
    .map((r) => r.slug);
}

/** 파일럿 (지역×시험) 조합 — 파일럿 시군구 × 13종. */
export function examPilotPairs(): { region: string; subject: string }[] {
  const out: { region: string; subject: string }[] = [];
  for (const slug of examPilotRegionSlugs()) {
    for (const e of examBySlug.values()) out.push({ region: slug, subject: e.slug });
  }
  return out;
}

/** sitemap 용 전체 (지역×시험) 조합 — 253 시군구 × 13종. */
export function allByExamPairs(): { region: string; subject: string }[] {
  const out: { region: string; subject: string }[] = [];
  for (const r of examRegions) {
    for (const e of examBySlug.values()) out.push({ region: r.slug, subject: e.slug });
  }
  return out;
}

/* ── 회화 페이지 역방향 링크(이 지역의 언어별 시험 준비) ───────────────── */

export type ExamReverseGroup = {
  language: PowerExam["language"];
  languageLabel: string;
  links: ExamLink[];
};

/**
 * 회화 상세(ByRegionDetail)에서 쓰는 역방향 링크.
 * 회화 지역 파라미터가 시험 지역축(시군구)에 속할 때만, 해당 회화 언어의 시험 페이지 전부를 링크한다.
 * 그 외(동 단위 등 시험 페이지가 없는 지역)는 빈 배열 → 없는 페이지로의 링크를 만들지 않는다.
 */
export function examReverseGroupForConversation(
  regionParam: string,
  subjectSlug: string,
): ExamReverseGroup | null {
  if (!isExamRegionSlug(regionParam)) return null;
  const language: PowerExam["language"] | null = subjectSlug.startsWith("english")
    ? "english"
    : subjectSlug.startsWith("japanese")
      ? "japanese"
      : subjectSlug.startsWith("chinese")
        ? "chinese"
        : null;
  if (!language) return null;

  const region = examRegionBySlug.get(slugKey(regionParam));
  const regionSlug = region ? region.slug : slugKey(regionParam);
  const regionName = region ? region.name : resolveExamRegionName(regionParam);
  const enc = encodeURIComponent(regionSlug);

  const exams = examsOfLanguage(language);
  if (exams.length === 0) return null;
  return {
    language,
    languageLabel: LANGUAGE_LABEL[language],
    links: exams.map((e) => ({
      href: `/power/by-region/${enc}/${e.slug}`,
      label: `${regionName} ${e.name}`,
    })),
  };
}
