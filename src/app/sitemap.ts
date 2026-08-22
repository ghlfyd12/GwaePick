import type { MetadataRoute } from "next";
import { regions } from "@/data/regions";
import { site } from "@/data/site";
import { subjects } from "@/data/pseo";
import { gyeonggi } from "@/data/gyeonggi";
import { getSido } from "@/data/sidoRegions";
import { subjects as detailSubjects } from "@/data/subjects";
import { PILOT } from "@/data/dongPageCopy";
import { powerRegionSlugs } from "@/data/powerRegions";
import { LANGUAGE_SLUGS } from "@/data/languageDetail";
import { allPowerPerformancePairs } from "@/data/powerSchoolDepts";
import { allBySchoolPairs } from "@/data/bySchoolSubject";
import { seoulExpansionDongPairs } from "@/data/seoulDong";
import {
  metroExpansionDongPairs,
  provinceExpansionDongPairs,
} from "@/data/cityDong";
import {
  SITEMAP_URLS_PER_FILE,
  SCHOOL_PAIR_COUNT,
  SCHOOL_SITEMAP_CHUNKS,
  schoolPairAt,
} from "@/lib/schoolSitemap";
import {
  POWER_REGION_PAIRS,
  POWER_REGION_PAIR_COUNT,
  POWER_REGION_SITEMAP_CHUNKS,
  POWER_EXAM_PAIRS,
  POWER_EXAM_PAIR_COUNT,
  POWER_EXAM_SITEMAP_CHUNKS,
  PROVINCE_DONG_URL_COUNT,
  TOTAL_SITEMAP_COUNT,
} from "@/lib/powerRegionSitemap";
import {
  SCHOOL_MODIFIED,
  CORE_MODIFIED,
  REGION_MODIFIED,
  REGION_LANDMARK_MODIFIED,
  GYEONGGI_PSEO_MODIFIED,
  DONG_PSEO_MODIFIED,
  SUBJECT_MODIFIED,
  POWER_MODIFIED,
} from "@/data/contentMeta";
import { REGION_LANDMARKS } from "@/data/regionLandmarks";

/*
 * 동적 sitemap — 분할 구조(/sitemap/[id].xml). robots.txt 가 각 파일 URL 을 모두 가리킨다.
 *
 *  - id 0  : 코어(메인 + 지역 랜딩 + pSEO + 과목 단독 + 동×과목 파일럿 + 파워 지역).
 *  - id 1~N: 학교×과목 상세(/tutoring/by-school/{학교}/{과목}) — 약 12,097개 학교 × 8과목.
 *            URL 5만 개 한도(사이트맵당)에 걸리므로 청크로 분할한다.
 *
 * 한글 슬러그는 encodeURIComponent 로 안전 출력. 도메인은 site.url 단일 소스.
 * 학교 페이지는 ISR(온디맨드) 이지만, 사이트맵에 모두 실어 색인 후보로 노출한다(정직한 실제 페이지).
 */

const base = site.url.replace(/\/$/, "");
const enc = (s: string) => encodeURIComponent(s);

/**
 * 사이트맵 파일 구성: id 0(코어) + 학교 청크 1..N.
 * Next.js 가 /sitemap/[id].xml 로 개별 파일을 생성한다(robots.txt 에서 전부 참조).
 */
export async function generateSitemaps() {
  return Array.from({ length: TOTAL_SITEMAP_COUNT }, (_, i) => ({ id: i }));
}

/**
 * id 0 — 학교 외 기존 페이지 전부.
 * lastModified 는 유형별 정직한 콘텐츠 변경일 상수(contentMeta.ts). 빌드 시각(new Date) 미사용.
 */
function coreSitemap(): MetadataRoute.Sitemap {
  const home: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: CORE_MODIFIED, changeFrequency: "weekly", priority: 1 },
  ];

  // 신청폼·개인정보처리방침(2-B 공개 전환) — 코어 사이트맵에 포함.
  const consultPages: MetadataRoute.Sitemap = [
    { url: `${base}/apply`, lastModified: CORE_MODIFIED, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/privacy`, lastModified: CORE_MODIFIED, changeFrequency: "yearly", priority: 0.3 },
  ];

  const regionPages: MetadataRoute.Sitemap = regions.map((r) => ({
    url: `${base}/${enc(r.id)}`,
    // 신도시 키워드 보강된 랜딩만 실변경일, 나머지는 기존 REGION_MODIFIED(가짜 갱신 방지).
    lastModified: REGION_LANDMARKS[r.id] ? REGION_LANDMARK_MODIFIED : REGION_MODIFIED,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // pSEO: 경기 시도×과목 (5) + 시군구×과목 (시군구 수 × 5)
  const sido = gyeonggi.sidoLabel; // "경기"
  const pseoPages: MetadataRoute.Sitemap = [];
  for (const subj of subjects) {
    pseoPages.push({
      url: `${base}/tutoring/by-region/${enc(sido)}/${enc(subj.slug)}`,
      lastModified: GYEONGGI_PSEO_MODIFIED,
      changeFrequency: "weekly",
      priority: 0.7,
    });
    for (const sg of gyeonggi.sigungu) {
      pseoPages.push({
        url: `${base}/tutoring/by-region/${enc(sido)}/${enc(sg.slug)}/${enc(subj.slug)}`,
        lastModified: GYEONGGI_PSEO_MODIFIED,
        changeFrequency: "weekly",
        priority: 0.6,
      });
    }
  }

  // 과목 단독 상세 — /tutoring/by-subject/[과목] 8개(영문 slug)
  const subjectDetailPages: MetadataRoute.Sitemap = detailSubjects.map((subj) => ({
    url: `${base}/tutoring/by-subject/${subj.slug}`,
    lastModified: SUBJECT_MODIFIED,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  // 동×과목 상세 — 파일럿(서울 4구·고양 3구)만 등록(전국 일괄 금지)
  const pilotDetail: MetadataRoute.Sitemap = [];
  for (const p of PILOT) {
    const sd = getSido(p.sido);
    if (!sd) continue;
    for (const sgSlug of p.sigungu) {
      const sg = sd.sigungu.find((s) => s.slug === sgSlug);
      if (!sg) continue;
      for (const dong of sg.dong)
        for (const subj of detailSubjects)
          pilotDetail.push({
            url: `${base}/tutoring/by-region/${p.sido}/${sg.slug}/${dong.slug}/${subj.slug}`,
            lastModified: DONG_PSEO_MODIFIED,
            changeFrequency: "weekly",
            priority: 0.5,
          });
    }
  }

  // 서울 동×과목 1차 확장 — 비파일럿 21구 기초 동(+명소 복구) × 8과목.
  // 렌더는 기존 resolveNew(온디맨드 ISR)가 담당, 여기선 사이트맵 등재만. lastmod=동 템플릿 변경일.
  const seoulDongPages: MetadataRoute.Sitemap = [];
  for (const { sigungu, dong } of seoulExpansionDongPairs) {
    for (const subj of detailSubjects) {
      seoulDongPages.push({
        url: `${base}/tutoring/by-region/seoul/${sigungu}/${dong}/${subj.slug}`,
        lastModified: DONG_PSEO_MODIFIED,
        changeFrequency: "weekly",
        priority: 0.5,
      });
    }
  }

  // 6대 광역시 동×과목 2차 확장 — 기초 동(+부산 명소 복구) × 8과목.
  // 렌더는 기존 resolveNew(온디맨드 ISR)가 담당, 여기선 사이트맵 등재만. lastmod=동 템플릿 변경일.
  const metroDongPages: MetadataRoute.Sitemap = [];
  for (const { sido, sigungu, dong } of metroExpansionDongPairs) {
    for (const subj of detailSubjects) {
      metroDongPages.push({
        url: `${base}/tutoring/by-region/${sido}/${sigungu}/${dong}/${subj.slug}`,
        lastModified: DONG_PSEO_MODIFIED,
        changeFrequency: "weekly",
        priority: 0.5,
      });
    }
  }

  // 파워 홈페이지 지역별 영어회화 — /power/[지역명]
  const powerRegionPages: MetadataRoute.Sitemap = powerRegionSlugs.map((slug) => ({
    url: `${base}/power/${enc(slug)}`,
    lastModified: POWER_MODIFIED,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  // 어학의참견 언어 상세 — /power/english·japanese·chinese
  const powerLanguagePages: MetadataRoute.Sitemap = LANGUAGE_SLUGS.map((slug) => ({
    url: `${base}/power/${slug}`,
    lastModified: POWER_MODIFIED,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  // 어학의참견 학교별 안내 인덱스 — /power/schools (내부 링크 허브 1개)
  const powerSchoolsIndex: MetadataRoute.Sitemap = [
    { url: `${base}/power/schools`, lastModified: POWER_MODIFIED, changeFrequency: "weekly", priority: 0.6 },
  ];

  // 어학의참견 지역별 안내 인덱스 — /power/regions (내부 링크 허브 1개)
  const powerRegionsIndex: MetadataRoute.Sitemap = [
    { url: `${base}/power/regions`, lastModified: POWER_MODIFIED, changeFrequency: "weekly", priority: 0.6 },
  ];

  // 어학의참견 유형 B — 학교×언어 수행평가 /power/performance/[school]/[lang] (95개, 40k 한도 내라 코어에 포함)
  const powerPerformancePages: MetadataRoute.Sitemap = allPowerPerformancePairs().map(
    ({ school, lang }) => ({
      url: `${base}/power/performance/${school}/${lang}`,
      lastModified: POWER_MODIFIED,
      changeFrequency: "weekly",
      priority: 0.6,
    }),
  );

  // 어학의참견 유형 A — 학교×어학과목 /power/by-school/[school]/[subject] (149개, 40k 한도 내라 코어에 포함)
  const powerBySchoolPages: MetadataRoute.Sitemap = allBySchoolPairs().map(
    ({ school, subject }) => ({
      url: `${base}/power/by-school/${school}/${subject}`,
      lastModified: POWER_MODIFIED,
      changeFrequency: "weekly",
      priority: 0.6,
    }),
  );

  // 어학의참견 지역 축(by-region)은 대량이라 별도 shard(powerRegionSitemap) 로 분리한다(여기 미포함).

  return [
    ...home,
    ...consultPages,
    ...regionPages,
    ...subjectDetailPages,
    ...pseoPages,
    ...pilotDetail,
    ...seoulDongPages,
    ...metroDongPages,
    ...powerRegionPages,
    ...powerLanguagePages,
    ...powerSchoolsIndex,
    ...powerRegionsIndex,
    ...powerPerformancePages,
    ...powerBySchoolPages,
  ];
}

/** 파워 지역 청크 — /power/by-region/{지역}/{과목} 한 청크(슬라이스). lastmod=POWER_MODIFIED. */
function powerRegionSitemap(chunk: number): MetadataRoute.Sitemap {
  const start = chunk * SITEMAP_URLS_PER_FILE;
  const end = Math.min(start + SITEMAP_URLS_PER_FILE, POWER_REGION_PAIR_COUNT);
  const out: MetadataRoute.Sitemap = [];
  for (let p = start; p < end; p++) {
    const { region, subject } = POWER_REGION_PAIRS[p];
    out.push({
      url: `${base}/power/by-region/${enc(region)}/${subject}`,
      lastModified: POWER_MODIFIED,
      changeFrequency: "weekly",
      priority: 0.5,
    });
  }
  return out;
}

/** 어학시험 청크 — /power/by-region/{지역}/{시험} 한 청크(슬라이스). 회화 청크와 동일 인코딩. lastmod=POWER_MODIFIED. */
function powerExamSitemap(chunk: number): MetadataRoute.Sitemap {
  const start = chunk * SITEMAP_URLS_PER_FILE;
  const end = Math.min(start + SITEMAP_URLS_PER_FILE, POWER_EXAM_PAIR_COUNT);
  const out: MetadataRoute.Sitemap = [];
  for (let p = start; p < end; p++) {
    const { region, subject } = POWER_EXAM_PAIRS[p];
    out.push({
      url: `${base}/power/by-region/${enc(region)}/${subject}`,
      lastModified: POWER_MODIFIED,
      changeFrequency: "weekly",
      priority: 0.5,
    });
  }
  return out;
}

/**
 * 도 지역 dong 청크(3차) — /tutoring/by-region/{도}/{시군구}/{동}/{과목} 한 청크(슬라이스).
 * 코어 40k 근접 회피 위해 전용 청크로 분리(맨 뒤 id, 기존 shard 불변). lastmod=DONG_PSEO_MODIFIED.
 * 렌더는 기존 resolveNew(온디맨드 ISR)가 담당, 여기선 사이트맵 등재만.
 */
function provinceDongSitemap(chunk: number): MetadataRoute.Sitemap {
  const start = chunk * SITEMAP_URLS_PER_FILE;
  const end = Math.min(start + SITEMAP_URLS_PER_FILE, PROVINCE_DONG_URL_COUNT);
  const subjectCount = detailSubjects.length;
  const out: MetadataRoute.Sitemap = [];
  for (let p = start; p < end; p++) {
    const pair = provinceExpansionDongPairs[Math.floor(p / subjectCount)];
    const subject = detailSubjects[p % subjectCount];
    out.push({
      url: `${base}/tutoring/by-region/${pair.sido}/${pair.sigungu}/${pair.dong}/${subject.slug}`,
      lastModified: DONG_PSEO_MODIFIED,
      changeFrequency: "weekly",
      priority: 0.5,
    });
  }
  return out;
}

/** id 1..N — 학교×과목 상세 한 청크. 평탄화된 (학교,과목) 쌍을 슬라이스로만 생성(메모리 안전). lastmod=SCHOOL_MODIFIED. */
function schoolSitemap(chunk: number): MetadataRoute.Sitemap {
  const start = chunk * SITEMAP_URLS_PER_FILE;
  const end = Math.min(start + SITEMAP_URLS_PER_FILE, SCHOOL_PAIR_COUNT);
  const out: MetadataRoute.Sitemap = [];
  for (let p = start; p < end; p++) {
    const { school, subject } = schoolPairAt(p);
    out.push({
      url: `${base}/tutoring/by-school/${enc(school.slug)}/${subject.slug}`,
      lastModified: SCHOOL_MODIFIED,
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }
  return out;
}

export default async function sitemap({
  id,
}: {
  // Next.js 16: 사이트맵 id 는 Promise 로 전달되므로 await 해서 쓴다.
  id: Promise<number> | number;
}): Promise<MetadataRoute.Sitemap> {
  // lastModified 는 빌드 시각(new Date)이 아니라 유형별 정직한 상수를 각 함수가 직접 사용한다.
  const n = Number(await id);
  // id 0 = 코어 / 1..S = 학교 / 파워 지역 / 어학시험 / 그 뒤 = 도 지역 dong 청크(append, 맨 뒤).
  if (n <= 0) return coreSitemap();
  if (n <= SCHOOL_SITEMAP_CHUNKS) return schoolSitemap(n - 1);
  const afterSchool = n - 1 - SCHOOL_SITEMAP_CHUNKS; // 0-based: 회화 + 시험 + 도 dong
  if (afterSchool < POWER_REGION_SITEMAP_CHUNKS)
    return powerRegionSitemap(afterSchool);
  const afterPowerRegion = afterSchool - POWER_REGION_SITEMAP_CHUNKS;
  if (afterPowerRegion < POWER_EXAM_SITEMAP_CHUNKS)
    return powerExamSitemap(afterPowerRegion);
  return provinceDongSitemap(afterPowerRegion - POWER_EXAM_SITEMAP_CHUNKS);
}
