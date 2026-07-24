/**
 * /power 지역 축 전량 확장(additive) — sidoRegions(시도 17·시군구 253·동 6,311)를 기존 963
 * 평면 slug 위에 얹는다. sidoRegions·regions.ts·powerRegions 원본은 수정하지 않는다.
 *
 * slug 규칙(전건 결정적, sidoRegions 파일 순서 기준 = 경기도 우선):
 *  - covered : 이름이 기존 963 에 있으면 "첫 등장" 1건만 기존 라우트가 서비스(중복 방지) → 확장 미포함.
 *  - plain   : 이름이 전역 유일 + 963 밖 → 동명/구명/시도명 그대로(표기=동명만).
 *  - suffix  : 그 외 → 표기 "{시군구} {동명}". 같은 시군구명이 여러 시도에 걸치면(중구 등)
 *              "{시도} {시군구} {동명}" 로 격상 → 같은 동명의 다른 지역 title 이 서로 달라진다.
 *  - slug === 표기(display). 한글, 전역 유일. 963(단일 동/구명)과 절대 충돌하지 않는다.
 *
 * 워딩: 느낌표·금지어 없음. 색은 컴포넌트에서 accent(퍼플) 처리.
 */
import { REGIONS } from "@/data/sidoRegions";
import { powerRegionSlugs } from "@/data/powerRegions";

export type PowerRegionLevel = "sido" | "sigungu" | "dong";

export interface PowerExpansionRegion {
  /** URL [region] 파라미터(한글, 전역 유일). = 표기명. */
  slug: string;
  /** 화면 표기명(plain: 동명 / suffix: "{시군구} {동명}"). */
  name: string;
  level: PowerRegionLevel;
  sidoLabel: string;
  sidoSlug: string;
  sigunguName?: string;
  /** 상위 허브 slug(dong→시군구, 시군구→시도). 계층 링크용. */
  parentSlug?: string;
}

const nfc = (s: string) => s.normalize("NFC");

/** 시도 정식명 → 짧은 표기(접미 격상·상위 링크 표시용). */
const SIDO_SHORT: Record<string, string> = {
  경기도: "경기",
  강원도: "강원",
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
  제주특별자치도: "제주",
  충청남도: "충남",
  충청북도: "충북",
};
const shortSido = (label: string) => SIDO_SHORT[label] ?? label;

/* ── 사전 집계 ─────────────────────────────────────────────────────── */
const reserved = new Set(powerRegionSlugs.map(nfc)); // 기존 963(불변)
const nameCountAll = new Map<string, number>(); // 전 계층 이름 등장 수
const sigunguNameCount = new Map<string, number>(); // 시군구명 등장 수(격상 판정)

for (const sido of REGIONS) {
  const bump = (m: Map<string, number>, k: string) => m.set(k, (m.get(k) ?? 0) + 1);
  bump(nameCountAll, nfc(sido.label));
  for (const sg of sido.sigungu) {
    bump(nameCountAll, nfc(sg.name));
    bump(sigunguNameCount, nfc(sg.name));
    for (const d of sg.dong) bump(nameCountAll, nfc(d.name));
  }
}

/* ── slug/표기 결정 ────────────────────────────────────────────────── */
const usedSlugs = new Set<string>(reserved); // 963 과 충돌 금지
const coveredNames = new Set<string>(); // 963 이름당 첫 1건만 covered
const uniqueSlug = (base: string, fallbacks: string[]): string => {
  if (!usedSlugs.has(base)) return base;
  for (const f of fallbacks) if (!usedSlugs.has(f)) return f;
  let i = 2;
  while (usedSlugs.has(`${base} ${i}`)) i++;
  return `${base} ${i}`;
};

const regionsOut: PowerExpansionRegion[] = [];
/** (시도label|시군구name) → 확정 시군구 slug(963 covered 면 그 평면명). dong 상위 링크용. */
const sigunguSlugByKey = new Map<string, string>();

for (const sido of REGIONS) {
  const sidoSlug = sido.slug;
  const short = shortSido(sido.label);

  // 시도 허브(전부 신규·유일 → plain)
  const sidoName = nfc(sido.label);
  if (!reserved.has(sidoName)) {
    const slug = uniqueSlug(sidoName, [`${sidoName} 지역`]);
    usedSlugs.add(slug);
    regionsOut.push({ slug, name: sido.label, level: "sido", sidoLabel: sido.label, sidoSlug });
  }

  for (const sg of sido.sigungu) {
    const G = nfc(sg.name);
    const sgKey = `${sido.label}|${sg.name}`;
    let sgSlugResolved: string;

    if (reserved.has(G) && !coveredNames.has(G)) {
      // 기존 963 이 이 이름을 서비스 → covered. 확장 미포함, 상위 링크는 평면명 사용.
      coveredNames.add(G);
      sgSlugResolved = G;
    } else if (!reserved.has(G) && (nameCountAll.get(G) ?? 0) === 1) {
      // plain 시군구 허브
      const slug = uniqueSlug(G, [`${short} ${sg.name}`]);
      usedSlugs.add(slug);
      regionsOut.push({
        slug,
        name: sg.name,
        level: "sigungu",
        sidoLabel: sido.label,
        sidoSlug,
        parentSlug: reserved.has(sidoName) ? sidoName : sidoName,
      });
      sgSlugResolved = slug;
    } else {
      // suffix 시군구 허브 — 시도 접두
      const disp = `${short} ${sg.name}`;
      const slug = uniqueSlug(disp, [`${sido.label} ${sg.name}`]);
      usedSlugs.add(slug);
      regionsOut.push({
        slug,
        name: disp,
        level: "sigungu",
        sidoLabel: sido.label,
        sidoSlug,
        parentSlug: sidoName,
      });
      sgSlugResolved = slug;
    }
    sigunguSlugByKey.set(sgKey, sgSlugResolved);

    for (const d of sg.dong) {
      const N = nfc(d.name);
      if (reserved.has(N) && !coveredNames.has(N)) {
        coveredNames.add(N); // 963 서비스 → covered, 미포함
        continue;
      }
      if (!reserved.has(N) && (nameCountAll.get(N) ?? 0) === 1) {
        // plain 동
        const slug = uniqueSlug(N, [`${sg.name} ${d.name}`]);
        usedSlugs.add(slug);
        regionsOut.push({
          slug,
          name: d.name,
          level: "dong",
          sidoLabel: sido.label,
          sidoSlug,
          sigunguName: sg.name,
          parentSlug: sgSlugResolved,
        });
      } else {
        // suffix 동 — 시군구명이 전역 중복이면 시도까지 붙여 표기 유일 보장
        const disp =
          (sigunguNameCount.get(G) ?? 0) > 1
            ? `${short} ${sg.name} ${d.name}`
            : `${sg.name} ${d.name}`;
        const slug = uniqueSlug(disp, [`${sido.label} ${sg.name} ${d.name}`]);
        usedSlugs.add(slug);
        regionsOut.push({
          slug,
          name: disp,
          level: "dong",
          sidoLabel: sido.label,
          sidoSlug,
          sigunguName: sg.name,
          parentSlug: sgSlugResolved,
        });
      }
    }
  }
}

/* ── 공개 API ──────────────────────────────────────────────────────── */
export const powerExpansionRegions: PowerExpansionRegion[] = regionsOut;

const bySlug = new Map(regionsOut.map((r) => [nfc(r.slug), r]));
const expansionSlugSet = new Set(regionsOut.map((r) => nfc(r.slug)));

/** URL 파라미터 정규화 — 인코딩(%EA…)·NFD 로 들어와도 매칭되도록 디코드 후 NFC(963 slugKey 와 동일). */
const slugKey = (s: string): string => {
  try {
    return decodeURIComponent(s).normalize("NFC");
  } catch {
    return s.normalize("NFC");
  }
};

/** 확장 지역 여부(기존 963 은 제외 — powerRegions 로 별도 판정). */
export function isExpansionRegionSlug(slug: string): boolean {
  return expansionSlugSet.has(slugKey(slug));
}
export function getExpansionRegion(slug: string): PowerExpansionRegion | null {
  return bySlug.get(slugKey(slug)) ?? null;
}

/** 기존 963 ∪ 확장 — 지역 축 전체 slug 여부. */
export function isAnyPowerRegionSlug(slug: string): boolean {
  const k = slugKey(slug);
  return reserved.has(k) || expansionSlugSet.has(k);
}

/** 확장 과목 페이지 대상 slug 전체(시도+시군구+동). */
export function allExpansionRegionSlugs(): string[] {
  return regionsOut.map((r) => r.slug);
}

/** 확장 허브(시도·시군구) — /power/[region] 허브 생성 대상. */
export function expansionHubRegions(): PowerExpansionRegion[] {
  return regionsOut.filter((r) => r.level !== "dong");
}

/** 시도 허브 → 하위 시군구 허브 목록. */
export function sigunguHubsOfSido(sidoSlugParam: string): PowerExpansionRegion[] {
  const hub = getExpansionRegion(sidoSlugParam);
  if (!hub || hub.level !== "sido") return [];
  return regionsOut.filter((r) => r.level === "sigungu" && r.sidoLabel === hub.sidoLabel);
}

/** 시군구 허브 → 하위 동 지역 목록(과목 링크용). */
export function dongsOfSigunguHub(sigunguSlugParam: string): PowerExpansionRegion[] {
  const hub = getExpansionRegion(sigunguSlugParam);
  if (!hub || hub.level !== "sigungu") return [];
  return regionsOut.filter((r) => r.level === "dong" && r.parentSlug === hub.slug);
}
