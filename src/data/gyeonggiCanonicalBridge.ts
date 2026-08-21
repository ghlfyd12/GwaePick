/**
 * 경기 동×과목 이중 URL canonical 브리지(파생, 신규).
 *
 * 경기 동×과목은 한글 엔진(/경기/{sg}/{동}/{과목}, PseoLanding)과 영문 엔진
 * (/gyeonggi/{sg}/{dong}/{subject}, DongSubjectDetail) 두 URL로 렌더된다(진성 중복).
 * 1단계 권고(b): 영문을 canonical로 통합 → 한글 경기 동×과목 페이지의 canonical 을
 * 대응 영문 URL 로 지정한다(전국 영문 동 축과 일관, 사이트맵 자산 무변경).
 *
 * 두 데이터셋(gyeonggi.ts 한글 / sidoRegions.ts 영문)은 시군구명·동명이 동일하므로
 * 이름 기반으로 977동 브리지를 구성한다. 매핑 실패 동은 null 반환 → 호출부가 자기참조
 * 유지(잘못된 canonical 방지). 이 파일은 canonical 산출 전용 — 공유 데이터 미수정.
 */
import { gyeonggi } from "@/data/gyeonggi";
import { getSido } from "@/data/sidoRegions";

/** 한글 pSEO 과목 slug → 영문 detailSubject slug(동일 8과목). */
const SUBJECT_KO_TO_EN: Record<string, string> = {
  국어: "korean",
  영어: "english",
  수학: "math",
  사회: "social",
  과학: "science",
  역사: "history",
  논술: "essay",
  코딩: "coding",
};

/** 한글 (시군구 slug | 동 slug) → 영문 (시군구 slug | 동 slug). 이름 기준 매칭. */
const DONG_BRIDGE: Map<string, string> = (() => {
  const map = new Map<string, string>();
  const en = getSido("gyeonggi");
  if (!en) return map;
  const enSgByName = new Map(en.sigungu.map((s) => [s.name, s]));
  for (const koSg of gyeonggi.sigungu) {
    const enSg = enSgByName.get(koSg.name);
    if (!enSg) continue;
    const enDongByName = new Map(enSg.dong.map((d) => [d.name, d]));
    for (const koDong of koSg.dongs) {
      const enDong = enDongByName.get(koDong.name);
      if (!enDong) continue;
      map.set(`${koSg.slug}|${koDong.slug}`, `${enSg.slug}|${enDong.slug}`);
    }
  }
  return map;
})();

/**
 * 한글 경기 동×과목 → 대응 영문 canonical 경로.
 * 매핑 실패(동 또는 과목) 시 null → 호출부는 자기참조 canonical 유지.
 */
export function gyeonggiEnglishCanonicalPath(
  koSigunguSlug: string,
  koDongSlug: string,
  koSubjectSlug: string,
): string | null {
  const en = DONG_BRIDGE.get(`${koSigunguSlug}|${koDongSlug}`);
  const enSubject = SUBJECT_KO_TO_EN[koSubjectSlug];
  if (!en || !enSubject) return null;
  const [enSg, enDong] = en.split("|");
  return `/tutoring/by-region/gyeonggi/${enSg}/${enDong}/${enSubject}`;
}

/** 브리지 무결성 검증용 — 매핑 실패한 (시군구, 동) 목록. */
export const gyeonggiBridgeUnmapped: string[] = (() => {
  const missing: string[] = [];
  for (const koSg of gyeonggi.sigungu) {
    for (const koDong of koSg.dongs) {
      if (!DONG_BRIDGE.has(`${koSg.slug}|${koDong.slug}`)) {
        missing.push(`${koSg.name} ${koDong.name}`);
      }
    }
  }
  return missing;
})();

/** 브리지에 편입된 (시군구, 동) 총수. */
export const gyeonggiBridgeMappedCount = DONG_BRIDGE.size;
