/**
 * 어학의참견(/power) 유형 A(지역) — 지역×어학과목 상세페이지 콘텐츠·메타 단일 소스.
 *
 * /power/by-region/[region]/[subject] 라우트가 쓴다. 타겟은 해당 지역에서 어학 수업을 찾는
 * 성인·직장인·왕초보·학생 수요. 과목 slug 는 학교 축과 동일(bySchoolSubject 의 POWER_SUBJECTS 재사용),
 * title 키워드만 지역 축 문구로 갈아끼운다.
 *
 * 유효 지역: powerRegionSlugs(≈960) 에 정확히 포함된 지역만 페이지를 만든다(그 외 조합은 404 — 스팸 URL 방지).
 * 메인 pSEO(lib/seo.ts)는 재사용하지 않는다 — /power 전용 톤·"어학의참견" 접미사·퍼플 스코프.
 *
 * 워딩 규칙: "선생님 / 상담 선생님 / 원어민 선생님 / 원어민·교포 선생님" 로 통일.
 *   금지어(컨설턴트·컨설팅·코치·코칭·멘토·강사)·느낌표·성과 보장 문구·"수행평가" 미사용.
 *   "원어민 강사"(X) → "원어민 선생님"(O). 색은 accent 토큰(퍼플)만, 코랄 하드코딩 금지.
 */
import type { Metadata } from "next";
import { site } from "@/data/site";
import { REGIONS } from "@/data/sidoRegions";
import { gyeonggi } from "@/data/gyeonggi";
import { powerRegionSlugs, resolvePowerRegionName } from "@/data/powerRegions";
import { POWER_SUBJECTS, objJosa, type PowerSubject } from "@/data/bySchoolSubject";
import {
  getExpansionRegion,
  isExpansionRegionSlug,
  allExpansionRegionSlugs,
} from "@/data/powerRegionsExpansion";
import {
  getPowerDistrict,
  isPowerDistrictSlug,
  allDistrictSlugs,
  type PowerDistrict,
} from "@/data/powerDistricts";

const subjectBySlug = new Map(POWER_SUBJECTS.map((s) => [s.slug, s]));

/**
 * 지역 축 title/description 메타(사용자 확정 형식 — "어학의참견" 제거).
 * title: "{지역} {head} | 1:1 개인과외 {kw}"
 * desc:  "{지역} {descRef}, {descBody}. 첫 상담은 무료입니다."
 * head/descRef 로 회화(영어회화 과외)·과외(일본어 과외)를 구분. 느낌표·서비스어("매칭") 없음.
 */
export const REGION_SUBJECT_META: Record<
  string,
  { titleKw: string; descRef: string; descBody: string }
> = {
  "english-conversation": { titleKw: "영어회화 과외 1:1 왕초보 기초 비즈니스 여행영어 면접 성인 개인과외 수업", descRef: "영어회화", descBody: "왕초보 기초부터 비즈니스·여행·면접까지 목표에 맞춰 성인·직장인을 일대일로 지도합니다" },
  "japanese-conversation": { titleKw: "일본어회화 과외 1:1 왕초보 히라가나 프리토킹 JLPT 여행 개인과외 수업", descRef: "일본어회화", descBody: "왕초보 히라가나부터 JLPT·프리토킹까지 성인·직장인을 일대일로 지도합니다" },
  "chinese-conversation": { titleKw: "중국어회화 과외 1:1 왕초보 성조 HSK 비즈니스 개인과외 수업", descRef: "중국어회화", descBody: "왕초보 성조부터 HSK·비즈니스까지 성인·직장인을 일대일로 지도합니다" },
  "japanese-tutoring": { titleKw: "일본어과외 일본어회화 1:1 왕초보 히라가나 문법 JLPT JPT 개인과외 수업", descRef: "일본어 과외", descBody: "왕초보 문자부터 JLPT·회화까지 성인·대학생을 일대일로 지도합니다" },
  "chinese-tutoring": { titleKw: "중국어과외 중국어회화 1:1 왕초보 병음 성조 HSK 개인과외 수업", descRef: "중국어 과외", descBody: "왕초보 병음부터 HSK·회화까지 성인·대학생을 일대일로 지도합니다" },
};

/**
 * 동명 → 시군구(sg.name, 예 "고양시 일산동구") 맵. 소스 내 중복 동명은 null(모호 제외).
 * 전국(sidoRegions)과 경기(gyeonggi-regions) 두 맵을 둔다 — "백석동"처럼 전국 중복이나 경기 내
 * 유일한 동은 경기 맵으로 해석되게 한다.
 */
const buildDongMap = (
  entries: { dong: { name: string }[]; sg: string }[],
): Map<string, string | null> => {
  const m = new Map<string, string | null>();
  for (const { dong, sg } of entries) for (const d of dong) m.set(d.name, m.has(d.name) ? null : sg);
  return m;
};
const DONG_SIGUNGU_ALL = buildDongMap(
  REGIONS.flatMap((sido) => sido.sigungu.map((sg) => ({ dong: sg.dong, sg: sg.name }))),
);
const DONG_SIGUNGU_GG = buildDongMap(
  gyeonggi.sigungu.map((sg) => ({ dong: sg.dongs, sg: sg.name })),
);

/**
 * title "{시군구} {동}" 용 시군구 해석 — 비경기 동은 expansion(slug로 정확 판별),
 * 경기 동은 경기 맵(경기 내 유일), 그 외 전국 유일 폴백. 못 찾으면 null(동명만).
 */
function dongSigunguName(regionParam: string, regionName: string): string | null {
  const exp = getExpansionRegion(regionParam);
  const sg = exp?.level === "dong" && exp.sigunguName ? exp.sigunguName : null;
  const resolved = sg ?? DONG_SIGUNGU_GG.get(regionName) ?? DONG_SIGUNGU_ALL.get(regionName) ?? null;
  // 전국 중복 동명은 expansion 이 regionName 에 이미 시군구를 포함시켜 유일화한다
  // (예: "인천 서구 백석동"). 그 경우 접두를 생략해 중복("서구 인천 서구 백석동")을 막는다.
  if (resolved && regionName.includes(resolved)) return null;
  return resolved;
}

// 빌드시 title/desc 길이 검증(위반 시 빌드 실패). 앞 25자 "{지역} {과목}", title ≤ 80, desc ≤ 160.
// 최장 지역명(시군구+동 보수적 상한)으로 검사.
{
  const MAXR = "고양시 일산동구 백석동"; // 최장 동 표기(시군구+동) 보수 상한
  for (const [slug, m] of Object.entries(REGION_SUBJECT_META)) {
    const subj = m.titleKw.split(" ")[0]; // 과목(영어회화·일본어과외 등)
    const front = `${MAXR} ${subj}`;
    const title = `${MAXR} ${m.titleKw}`;
    const desc = `${MAXR} ${m.descRef}, ${m.descBody}. 첫 상담은 무료입니다.`;
    if ([...front].length > 25) throw new Error(`[byRegionSubject] "${slug}" "{지역} {과목}" >25자(${[...front].length}): ${front}`);
    if ([...title].length > 80) throw new Error(`[byRegionSubject] "${slug}" title >80자(${[...title].length}): ${title}`);
    if ([...desc].length > 160) throw new Error(`[byRegionSubject] "${slug}" desc >160자(${[...desc].length}): ${desc}`);
  }
}

/* ── 과목별 특화 카드 3종(지역 축 — 왕초보·성인·기초 프레이밍). "수행평가" 미사용. ── */
export type SubjectCard = { title: string; desc: string };

const REGION_CARDS: Record<string, SubjectCard[]> = {
  "english-conversation": [
    { title: "발음·강세 교정", desc: "원어민 선생님과 발음과 강세를 바로잡아 자연스러운 소리부터 만듭니다." },
    { title: "왕초보·성인 프리토킹", desc: "알파벳이 막막해도 한 문장씩 직접 말해 보며 입이 트일 때까지 이어 갑니다." },
    { title: "여행·비즈니스 실전", desc: "여행 상황과 회의·이메일 표현 등 바로 쓰는 실전 회화를 목표에 맞춰 준비합니다." },
  ],
  "chinese-conversation": [
    { title: "성조·발음", desc: "성조와 병음 발음을 원어민 선생님과 바로잡아 정확한 소리를 익힙니다." },
    { title: "왕초보 기초 회화", desc: "처음 시작하는 분도 기초 표현부터 천천히, 수준에 맞춰 대화를 늘려 갑니다." },
    { title: "여행·실전 회화", desc: "여행과 일상에서 바로 쓰는 표현으로 실전 중국어 말하기에 익숙해집니다." },
  ],
  "chinese-tutoring": [
    { title: "병음·성조 기초", desc: "병음과 성조부터 차근히 잡아 노베이스에서도 기초를 다집니다." },
    { title: "어법·독해", desc: "어법과 어휘, 독해를 단계별로 채워 갑니다." },
    { title: "HSK 자격 대비", desc: "HSK 급수 목표에 맞춰 유형과 어휘를 함께 준비합니다." },
  ],
  "japanese-conversation": [
    { title: "발음·억양", desc: "발음과 억양을 원어민 선생님과 맞춰 자연스럽게 말합니다." },
    { title: "왕초보 기초 회화", desc: "히라가나가 막막해도 기초 표현부터, 수준에 맞춰 대화를 늘려 갑니다." },
    { title: "여행·실전 회화", desc: "여행과 일상 상황의 표현으로 실전 일본어 말하기에 익숙해집니다." },
  ],
  "japanese-tutoring": [
    { title: "히라가나·가타카나", desc: "글자 기초부터 시작해 표기를 정확히 익힙니다." },
    { title: "문법·한자", desc: "문형과 한자를 단계별로 채워 갑니다." },
    { title: "JLPT 자격 대비", desc: "JLPT 급수 목표에 맞춰 문법과 어휘를 함께 준비합니다." },
  ],
};

/** description·특화 문장에 넣을 과목별 핵심어 2개. */
const REGION_TERMS: Record<string, string> = {
  "english-conversation": "기초와 토익·토플 스피킹",
  "japanese-conversation": "왕초보 기초와 프리토킹",
  "japanese-tutoring": "기초 히라가나와 문법·JLPT",
  "chinese-conversation": "왕초보 성조와 HSKK 프리토킹",
  "chinese-tutoring": "기초 병음과 HSK 비즈니스",
};

/* ── 유효 지역 판정 — powerRegionSlugs 정확 일치만 허용. ── */
const slugKey = (s: string): string => {
  try {
    return decodeURIComponent(s).normalize("NFC");
  } catch {
    return s.normalize("NFC");
  }
};
const regionSet = new Set(powerRegionSlugs.map((r) => r.normalize("NFC")));

/** URL 지역 파라미터가 알려진 powerRegionSlug 인지(정확 일치). */
export function isKnownPowerRegion(regionParam: string): boolean {
  return regionSet.has(slugKey(regionParam));
}

/** (지역, 과목) 조합이 페이지 생성 대상인지 — 기존 963 · 확장 지역 · 신도시 지명 + 유효 과목. */
export function isByRegionAllowed(regionParam: string, subjectSlug: string): boolean {
  return (
    (isKnownPowerRegion(regionParam) ||
      isExpansionRegionSlug(regionParam) ||
      isPowerDistrictSlug(regionParam)) &&
    subjectBySlug.has(subjectSlug)
  );
}

function hashSlug(s: string): number {
  let h = 0;
  for (const ch of s) h = (h * 31 + (ch.codePointAt(0) ?? 0)) >>> 0;
  return h;
}

export type ByRegionPageData = {
  regionSlug: string;
  regionName: string;
  subjectSlug: string;
  label: string;
  type: PowerSubject["type"];
  head: string;
  metaTitle: string;
  metaDescription: string;
  intro: string;
  cards: SubjectCard[];
  faq: { q: string; a: string }[];
  /** 같은 지역의 다른 어학과목 링크. */
  otherSubjects: { href: string; label: string }[];
  /** 기존 /power/[region] 상위 페이지 링크. */
  regionHubLink: { href: string; label: string };
};

/* 도입 회전 3종 — 학습자 프레이밍을 달리해 지역 간 문안 차별화. */
function buildIntro(p: { regionName: string; label: string; terms: string }): string {
  const { regionName: G, label: L, terms: T } = p;
  const variants = [
    `${G}에서 ${L}를 시작하려는 분들이 많습니다. 왕초보도, 다시 시작하는 성인도 지금 수준이 다 다릅니다. 직접 가르쳐 온 상담 선생님이 ${T}부터 목표까지 듣고 호흡이 맞는 원어민·교포 선생님을 1:1로 연결해 드립니다.`,
    `${G} 직장인과 학생 모두 ${L} 수업을 찾습니다. 바쁜 일정 속에서도 전화·화상으로 맞출 수 있도록, 상담 선생님이 ${T}를 포함해 지금 상황에 맞는 원어민·교포 선생님을 1:1로 연결해 드립니다.`,
    `${G}에서 ${L}가 학원 단체 수업으로는 늘 부족했다면 1:1이 답입니다. 상담 선생님이 왕초보인지 실력을 다지는 단계인지 먼저 듣고, ${T}까지 함께 잡아 줄 선생님을 연결해 드립니다.`,
  ];
  return variants[hashSlug(`${G}/${L}`) % variants.length];
}

/* 신도시·생활권 지명 도입 3종 — 소속 시군구를 1회 언급(예: "하남시 미사에서…"). */
function buildDistrictIntro(p: {
  regionName: string;
  sigungu: string;
  label: string;
  terms: string;
}): string {
  const { regionName: G, sigungu: S, label: L, terms: T } = p;
  const variants = [
    `${S} ${G}에서 ${L}를 시작하려는 분들이 많습니다. 왕초보도, 다시 시작하는 성인도 지금 수준이 다 다릅니다. 직접 가르쳐 온 상담 선생님이 ${T}부터 목표까지 듣고 호흡이 맞는 원어민·교포 선생님을 1:1로 연결해 드립니다.`,
    `${S} ${G} 직장인과 학생 모두 ${L} 수업을 찾습니다. 바쁜 일정 속에서도 전화·화상으로 맞출 수 있도록, 상담 선생님이 ${T}를 포함해 지금 상황에 맞는 원어민·교포 선생님을 1:1로 연결해 드립니다.`,
    `${S} ${G}에서 ${L}가 학원 단체 수업으로는 늘 부족했다면 1:1이 답입니다. 상담 선생님이 왕초보인지 실력을 다지는 단계인지 먼저 듣고, ${T}까지 함께 잡아 줄 선생님을 연결해 드립니다.`,
  ];
  return variants[hashSlug(`${G}/${L}`) % variants.length];
}

function buildFaq(p: { regionName: string; label: string }): { q: string; a: string }[] {
  const { regionName: G, label: L } = p;
  return [
    {
      q: `${G} ${L}는 전화와 화상 중 어떻게 진행되나요.`,
      a: `${G}에서 전화 수업과 화상 수업으로 진행합니다. 지금 여건과 목표를 듣고 상담 선생님이 맞는 방식과 선생님을 함께 연결해 드립니다.`,
    },
    {
      q: `원어민 선생님과 교포 선생님 중 누구와 하나요.`,
      a: `발음과 회화는 원어민 선생님, 문법과 설명은 한국어로 짚어 주는 교포 선생님 중에서 목표에 맞는 분을 연결해 드립니다.`,
    },
    {
      q: `왕초보인데 시작할 수 있나요.`,
      a: `지금 수준부터 시작합니다. 문자·발음 기초가 필요하면 거기서부터, 실전이 급하면 상황별 회화부터 잡아 갑니다. 먼저 무료 상담으로 알려 주세요.`,
    },
  ];
}

/** (지역, 과목) → 페이지 데이터. 대상이 아니면 null(라우트에서 notFound). */
export function buildByRegionData(
  regionParam: string,
  subjectSlug: string,
): ByRegionPageData | null {
  const subject = subjectBySlug.get(subjectSlug);
  if (!subject) return null;

  // 기존 963 은 표시명=slug(무변경 경로). 확장 지역은 expansion, 신도시 지명은 district 의 표시명/slug 사용.
  let regionName: string;
  let regionSlug: string;
  // 신도시·생활권 지명이면 도입부·description 에 소속 시군구를 1회 녹이고, 상향 링크를 시군구 허브로 건다.
  const district: PowerDistrict | null = getPowerDistrict(regionParam);
  if (isKnownPowerRegion(regionParam)) {
    regionName = resolvePowerRegionName(regionParam);
    regionSlug = regionName;
  } else if (district) {
    regionName = district.name;
    regionSlug = district.slug;
  } else {
    const exp = getExpansionRegion(regionParam);
    if (!exp) return null;
    regionName = exp.name;
    regionSlug = exp.slug;
  }
  const enc = encodeURIComponent(regionSlug);
  const terms = REGION_TERMS[subjectSlug];
  const head = `${regionName} ${subject.label}`;
  // title 전용 지역 표기 — 동 페이지는 "{시군구} {동}"(sidoRegions 동명→시군구, 모호명 제외),
  // 시군구·생활권은 기존 지역명. desc·head·og 는 regionName 그대로.
  const dongSigungu = district ? null : dongSigunguName(regionParam, regionName);
  const titleRegion = dongSigungu ? `${dongSigungu} ${regionName}` : regionName;
  // title = "{지역} {titleKw}"(키워드 확장). description 은 기존 형식 유지(regionName·변경 없음).
  const sm = REGION_SUBJECT_META[subjectSlug];
  const metaTitle = `${titleRegion} ${sm.titleKw}`;
  const metaDescription = `${regionName} ${sm.descRef}, ${sm.descBody}. 첫 상담은 무료입니다.`;

  const otherSubjects = POWER_SUBJECTS.filter((s) => s.slug !== subjectSlug).map((s) => ({
    href: `/power/by-region/${enc}/${s.slug}`,
    label: `${regionName} ${s.label}`,
  }));

  // 상향 링크: 지명은 소속 시군구 허브로(허브 미해석 시 지명 자체 허브로 폴백), 그 외는 지역 허브.
  const regionHubLink =
    district && district.sigunguHubSlug
      ? {
          href: `/power/${encodeURIComponent(district.sigunguHubSlug)}`,
          label: `${district.sigunguText} 영어 회화 안내`,
        }
      : { href: `/power/${enc}`, label: `${regionName} 영어 회화 안내` };

  return {
    regionSlug,
    regionName,
    subjectSlug,
    label: subject.label,
    type: subject.type,
    head,
    metaTitle,
    metaDescription,
    intro: district
      ? buildDistrictIntro({
          regionName,
          sigungu: district.sigunguText,
          label: subject.label,
          terms,
        })
      : buildIntro({ regionName, label: subject.label, terms }),
    cards: REGION_CARDS[subjectSlug],
    faq: buildFaq({ regionName, label: subject.label }),
    otherSubjects,
    regionHubLink,
  };
}

/** 기존 /power/[region] 템플릿의 신규 5과목 진입 링크(같은 지역). 963·확장 모두 지원. */
export function regionSubjectEntryLinks(
  regionParam: string,
): { href: string; label: string }[] {
  let regionName: string;
  if (isKnownPowerRegion(regionParam)) {
    regionName = resolvePowerRegionName(regionParam);
  } else {
    const exp = getExpansionRegion(regionParam);
    if (!exp) return [];
    regionName = exp.name;
  }
  const enc = encodeURIComponent(regionName);
  return POWER_SUBJECTS.map((s) => ({
    href: `/power/by-region/${enc}/${s.slug}`,
    label: `${regionName} ${s.label}`,
  }));
}

/** 정적 생성 파일럿 — 963·확장·지명 앞쪽 일부만 SSG(나머지 ISR). 빌드 시간 최소화. */
export const PILOT_REGION_COUNT = 20;
export const PILOT_DISTRICT_COUNT = 20;
export function pilotByRegionPairs(): { region: string; subject: string }[] {
  const out: { region: string; subject: string }[] = [];
  const pilot = [
    ...powerRegionSlugs.slice(0, PILOT_REGION_COUNT),
    ...allExpansionRegionSlugs().slice(0, PILOT_REGION_COUNT),
    ...allDistrictSlugs().slice(0, PILOT_DISTRICT_COUNT),
  ];
  for (const region of pilot) {
    for (const s of POWER_SUBJECTS) out.push({ region, subject: s.slug });
  }
  return out;
}

/** sitemap 용 전체 (지역×과목) 조합 — 963 + 확장 + 신도시 지명. 지역 축 전량. */
export function allByRegionPairs(): { region: string; subject: string }[] {
  const out: { region: string; subject: string }[] = [];
  for (const region of powerRegionSlugs) {
    for (const s of POWER_SUBJECTS) out.push({ region, subject: s.slug });
  }
  for (const region of allExpansionRegionSlugs()) {
    for (const s of POWER_SUBJECTS) out.push({ region, subject: s.slug });
  }
  for (const region of allDistrictSlugs()) {
    for (const s of POWER_SUBJECTS) out.push({ region, subject: s.slug });
  }
  return out;
}

/** /power 전용 메타데이터 빌더. */
export function buildByRegionMetadata(
  regionParam: string,
  subjectSlug: string,
): Metadata {
  const data = buildByRegionData(regionParam, subjectSlug);
  if (!data) return {};
  const canonical = `/power/by-region/${encodeURIComponent(data.regionSlug)}/${subjectSlug}`;
  // 페이지별 동적 썸네일(보라 텍스트). data.label = 과목 표시명(영어회화·중국어과외 등).
  // v=2: 썸네일 레이아웃 개편(인물 배경·4단 텍스트) 배포로 immutable 캐시 무효화.
  const thumb = `/api/power-thumb/conversation/${encodeURIComponent(data.regionSlug)}/${subjectSlug}?v=2`;
  const thumbAlt = `${data.regionName} ${data.label} 안내`;
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
      images: [{ url: thumb, width: 800, height: 600, alt: thumbAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title: data.metaTitle,
      description: data.metaDescription,
      images: [thumb],
    },
  };
}
