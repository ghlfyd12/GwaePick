"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { geoPath, geoIdentity } from "d3-geo";
import type {
  FeatureCollection,
  Geometry,
  MultiPolygon,
  Polygon,
  Position,
} from "geojson";

/*
 * RegionMap — 정적 GeoJSON 을 d3-geo 로 SVG path 로 그리는 범용 지도(외부 지도 API/키 없음).
 *
 * 두 가지 입력 방식:
 *  - geo: GeoJSON FeatureCollection 직접 전달(전국 시/도 지도 등 SSR 데이터).
 *  - sidoSlug: `/geo/sigungu/{sidoSlug}.json` 을 클라이언트에서 fetch(17개 시/도 시군구 경계).
 *    로딩 중엔 스켈레톤, 파일 없음/빈 데이터면 아무것도 렌더하지 않음(부모가 동 브라우저만 노출).
 *  - hrefMode: "path"(기본) → href=`${hrefPrefix}/${slug}` 이동 / "hash" → `#sg-${slug}` 동일 페이지 앵커
 *    (시군구 클릭 시 같은 페이지의 동 브라우저가 해당 시군구로 전환).
 *  - ariaLabel / pad(라벨 클리핑 방지 여백) / labelNudge(slug→[dx,dy] 위치 보정).
 *
 * 처리: 본토에서 먼 아주 작은 부속 도형(독도 등)은 분리해 비인터랙티브 정적 레이어로 그림.
 *  viewBox 를 투영 bounds 에 타이트하게 맞춤. 큰 지역 먼저 → 작은 지역 라벨이 위에. 라벨 흰 외곽선.
 */

type RegionProps = { slug: string; label: string; name_full?: string };
export type RegionFeatureCollection = FeatureCollection<Geometry, RegionProps>;

const W = 800;
const H = 800;
/** 본토 면적 대비 이 비율 미만 + 본토 중심에서 멀리 떨어진 도형 = 분리 섬(정적). */
const ISLAND_MAX_REL = 0.02;
const ISLAND_MIN_DIST = 180;

/* 원거리 섬 트리밍(trimFarIslands) 파라미터 — 인천 서해5도처럼 본토에서 경도상 크게 떨어진
 * 소수 섬이 bbox 를 넓혀 본토를 작게 뭉치게 만드는 경우만 제거한다(투영 fit·viewBox 기준 보정). */
const FAR_GAP_MIN = 0.3; // 경도(deg) 최소 간격: 이보다 큰 빈틈 너머의 소수 섬을 outlier 로 본다.
const FAR_MAX_AREA_FRAC = 0.25; // 그 outlier 묶음의 면적이 전체의 이 비율 미만일 때만 제거.

/** 링(좌표 배열)의 경도 centroid 와 면적(평면 shoelace). 원거리 outlier 판별용(투영 전 lon/lat). */
function ringLonArea(ring: Position[]): { lon: number; area: number } {
  let x = 0;
  let a = 0;
  for (let i = 0, n = ring.length, j = n - 1; i < n; j = i++) {
    const f = ring[j][0] * ring[i][1] - ring[i][0] * ring[j][1];
    x += (ring[j][0] + ring[i][0]) * f;
    a += f;
  }
  a /= 2;
  return { lon: a ? x / (6 * a) : ring[0]?.[0] ?? 0, area: Math.abs(a) };
}

/**
 * 본토에서 경도상 멀리 떨어진 소수 섬(예: 인천 서해5도)을 제거한 새 FeatureCollection.
 * - 모든 폴리곤을 모아 경도 centroid 의 "가장 큰 빈틈"을 반복 탐색.
 * - 빈틈이 FAR_GAP_MIN 이상이고 서쪽(소수) 묶음 면적이 전체의 FAR_MAX_AREA_FRAC 미만이면 그 묶음을 제거.
 * - 폴리곤만 솎아내므로 각 구·군 feature(slug·label·클릭 영역)는 유지된다.
 */
function trimFarWestIslands(
  fc: RegionFeatureCollection,
): RegionFeatureCollection {
  type Poly = { fi: number; ring0: Position[]; lon: number; area: number };
  const polys: Poly[] = [];
  fc.features.forEach((f, fi) => {
    const g = f.geometry;
    if (g.type === "Polygon") {
      const m = ringLonArea(g.coordinates[0]);
      polys.push({ fi, ring0: g.coordinates[0], lon: m.lon, area: m.area });
    } else if (g.type === "MultiPolygon") {
      g.coordinates.forEach((rings) => {
        const m = ringLonArea(rings[0]);
        polys.push({ fi, ring0: rings[0], lon: m.lon, area: m.area });
      });
    }
  });
  if (polys.length < 3) return fc;
  const total = polys.reduce((s, p) => s + p.area, 0);
  let keep = polys.slice();
  for (let iter = 0; iter < 10; iter++) {
    const s = keep.slice().sort((a, b) => a.lon - b.lon);
    let gap = 0;
    let gi = -1;
    for (let i = 1; i < s.length; i++) {
      const g = s[i].lon - s[i - 1].lon;
      if (g > gap) {
        gap = g;
        gi = i;
      }
    }
    if (gap < FAR_GAP_MIN || gi < 1) break;
    const west = s.slice(0, gi);
    const east = s.slice(gi);
    const westFrac = west.reduce((x, p) => x + p.area, 0) / total;
    const eastFrac = east.reduce((x, p) => x + p.area, 0) / total;
    // 본토(면적 다수)는 보존, 경도상 떨어진 소수 묶음만 제거.
    if (westFrac < eastFrac && westFrac < FAR_MAX_AREA_FRAC) keep = east;
    else break;
  }
  const dropped = new Set(polys.filter((p) => !keep.includes(p)).map((p) => p.ring0));
  if (dropped.size === 0) return fc;

  const features = fc.features
    .map((f) => {
      const g = f.geometry;
      if (g.type === "Polygon") {
        return dropped.has(g.coordinates[0]) ? null : f;
      }
      if (g.type === "MultiPolygon") {
        const rings = g.coordinates.filter((r) => !dropped.has(r[0]));
        if (rings.length === 0) return null;
        const geometry: Geometry =
          rings.length === 1
            ? { type: "Polygon", coordinates: rings[0] }
            : { type: "MultiPolygon", coordinates: rings };
        return { ...f, geometry };
      }
      return f;
    })
    .filter((f): f is RegionFeatureCollection["features"][number] => f !== null);

  return { ...fc, features };
}

export default function RegionMap({
  geo,
  sidoSlug,
  hrefPrefix = "",
  hrefMode = "path",
  ariaLabel,
  pad = 30,
  labelNudge,
  trimFarIslands = false,
}: {
  geo?: RegionFeatureCollection;
  sidoSlug?: string;
  hrefPrefix?: string;
  hrefMode?: "path" | "hash";
  ariaLabel?: string;
  pad?: number;
  labelNudge?: Record<string, [number, number]>;
  /** 본토에서 경도상 멀리 떨어진 소수 섬을 제거해 투영/viewBox 를 본토에 맞춤(예: 인천 서해5도). */
  trimFarIslands?: boolean;
}) {
  // sidoSlug 가 있으면 public 의 시군구 GeoJSON 을 fetch. geo prop 이 있으면 그대로 사용.
  const [fetched, setFetched] = useState<RegionFeatureCollection | null>(null);
  const [state, setState] = useState<"idle" | "loading" | "ready" | "empty">(
    geo ? "ready" : sidoSlug ? "loading" : "idle",
  );

  useEffect(() => {
    if (geo || !sidoSlug) return;
    let alive = true;
    fetch(`/geo/sigungu/${sidoSlug}.json`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: RegionFeatureCollection) => {
        if (!alive) return;
        if (d?.features?.length) {
          setFetched(d);
          setState("ready");
        } else setState("empty");
      })
      .catch(() => alive && setState("empty"));
    return () => {
      alive = false;
    };
  }, [geo, sidoSlug]);

  const data = geo ?? fetched;

  const { shapes, islandPath, viewBox } = useMemo(() => {
    if (!data) return { shapes: [], islandPath: "", viewBox: `0 0 ${W} ${H}` };
    // 인천 서해5도처럼 본토에서 멀리 떨어진 소수 섬은 fit/viewBox 전에 제거(본토 라벨 겹침 방지).
    const geo = trimFarIslands ? trimFarWestIslands(data) : data;
    // geoIdentity(평면 좌표)+reflectY: lon/lat 를 화면 좌표로 직접 맞춤(geoMercator 의 구면 winding 이슈 회피).
    const projection = geoIdentity()
      .reflectY(true)
      .fitExtent(
        [
          [pad, pad],
          [W - pad, H - pad],
        ],
        geo as never,
      );
    const path = geoPath(projection);

    // 본토 / 분리 섬 분할
    const splitPolys = (geom: Geometry) => {
      if (geom.type !== "MultiPolygon")
        return { main: geom, islands: [] as Position[][][] };
      const polys = (geom as MultiPolygon).coordinates.map(
        (coordinates): Polygon => ({ type: "Polygon", coordinates }),
      );
      const metas = polys.map((p) => ({
        p,
        a: path.area(p as never),
        c: path.centroid(p as never),
      }));
      const main = metas.reduce((m, x) => (x.a > m.a ? x : m), metas[0]);
      const mainCoords: Position[][][] = [];
      const islands: Position[][][] = [];
      for (const m of metas) {
        const detached =
          m.a < ISLAND_MAX_REL * main.a &&
          Math.hypot(m.c[0] - main.c[0], m.c[1] - main.c[1]) > ISLAND_MIN_DIST;
        (detached ? islands : mainCoords).push(m.p.coordinates);
      }
      return {
        main: { type: "MultiPolygon", coordinates: mainCoords } as MultiPolygon,
        islands,
      };
    };

    const islandRingsAll: Position[][][] = [];
    const shapes = geo.features.map((f) => {
      const { main, islands } = splitPolys(f.geometry);
      islandRingsAll.push(...islands);
      const [cx, cy] = path.centroid(main as never);
      const nudge = labelNudge?.[f.properties.slug] ?? [0, 0];
      return {
        slug: f.properties.slug,
        label: f.properties.label,
        d: path(main as never) ?? "",
        area: path.area(main as never),
        lx: (Number.isFinite(cx) ? cx : 0) + nudge[0],
        ly: (Number.isFinite(cy) ? cy : 0) + nudge[1],
      };
    });
    // 큰 지역 먼저 → 작은 지역(라벨) 나중. 작은 지역 라벨이 위에 올라와 끊기지 않음.
    shapes.sort((a, b) => b.area - a.area);

    const islandPath = islandRingsAll.length
      ? (path({ type: "MultiPolygon", coordinates: islandRingsAll } as never) ??
        "")
      : "";

    // 타이트 viewBox(빈 여백 제거 → 지도 확대)
    const [[bx0, by0], [bx1, by1]] = path.bounds(geo as never);
    const m = 10;
    const viewBox = `${bx0 - m} ${by0 - m} ${bx1 - bx0 + 2 * m} ${by1 - by0 + 2 * m}`;

    return { shapes, islandPath, viewBox };
  }, [data, pad, labelNudge, trimFarIslands]);

  // fetch 모드: 로딩 스켈레톤 / 데이터 없음(파일 부재)이면 지도 자체를 숨김(부모가 동 브라우저만 노출)
  if (sidoSlug && state === "loading")
    return (
      <div
        className="aspect-square w-full animate-pulse rounded-2xl bg-surface-alt"
        role="status"
        aria-label="지도 불러오는 중"
      />
    );
  if (sidoSlug && (state === "empty" || !data)) return null;

  return (
    <svg
      viewBox={viewBox}
      className="h-auto w-full overflow-visible"
      role="group"
      aria-label={ariaLabel}
    >
      {/* 인터랙티브 시/도·시군구(큰 지역 → 작은 지역 순) */}
      {shapes.map((s) => {
        const href = hrefMode === "hash" ? `#sg-${s.slug}` : `${hrefPrefix}/${s.slug}`;
        const inner = (
          <>
            <path
              d={s.d}
              className="cursor-pointer fill-accent/15 stroke-white transition-colors duration-200 group-hover/region:fill-accent group-focus-visible/region:fill-accent"
              style={{ strokeWidth: 1.2 }}
            />
            <text
              x={s.lx}
              y={s.ly}
              textAnchor="middle"
              dominantBaseline="middle"
              className="pointer-events-none select-none fill-ink text-[17px] font-semibold group-hover/region:fill-white group-focus-visible/region:fill-white"
              // 흰색 외곽선으로 라벨이 어떤 배경(주황 포함) 위에서도 또렷하게.
              style={{
                paintOrder: "stroke",
                stroke: "#fff",
                strokeWidth: 2.5,
                strokeLinejoin: "round",
              }}
            >
              {s.label}
            </text>
          </>
        );
        // hash 모드는 동일 페이지 앵커 → 일반 <a>(hashchange 신뢰성). path 모드는 next/link.
        return hrefMode === "hash" ? (
          <a key={s.slug} href={href} aria-label={s.label} className="group/region outline-none">
            {inner}
          </a>
        ) : (
          <Link key={s.slug} href={href} aria-label={s.label} className="group/region outline-none">
            {inner}
          </Link>
        );
      })}

      {/* 비인터랙티브 부속 섬(독도 등) — 색 고정, 호버/커서/링크 없음 */}
      {islandPath && (
        <path
          d={islandPath}
          aria-hidden
          className="pointer-events-none fill-accent/15 stroke-white"
          style={{ strokeWidth: 1 }}
        />
      )}
    </svg>
  );
}
