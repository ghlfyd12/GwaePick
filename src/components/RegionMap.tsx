"use client";

import { useMemo } from "react";
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
 * props:
 *  - geo: GeoJSON FeatureCollection (properties = { slug, label, name_full })
 *  - hrefPrefix: 각 지역 링크 prefix. href = `${hrefPrefix}/${slug}`.
 *  - ariaLabel: 지도 그룹 라벨. / pad: SVG 안쪽 여백(라벨 클리핑 방지). / labelNudge: slug→[dx,dy] 위치 보정.
 *
 * 처리:
 *  - 본토에서 멀리 떨어진 아주 작은 부속 도형(독도 등)은 분리해 "비인터랙티브 정적 레이어"로 그림
 *    (호버 색변화·커서·링크 없음, 색 고정). 메인 17개 시/도는 정상 인터랙션.
 *  - viewBox 를 실제 투영 bounds 에 타이트하게 맞춰 빈 여백 제거(지도 확대). overflow-visible 로 라벨 클리핑 방지.
 *  - 큰 지역을 먼저, 작은 지역을 나중에 렌더 → 작은 지역 라벨이 인접 큰 지역 위에 또렷하게.
 *  - 호버/포커스 시 라벨 흰색 + 항상 흰색 외곽선(paint-order:stroke)으로 어떤 배경에서도 읽힘.
 */

type RegionProps = { slug: string; label: string; name_full?: string };
export type RegionFeatureCollection = FeatureCollection<Geometry, RegionProps>;

const W = 800;
const H = 800;
/** 본토 면적 대비 이 비율 미만 + 본토 중심에서 멀리 떨어진 도형 = 분리 섬(정적). */
const ISLAND_MAX_REL = 0.02;
const ISLAND_MIN_DIST = 180;

export default function RegionMap({
  geo,
  hrefPrefix,
  ariaLabel,
  pad = 30,
  labelNudge,
}: {
  geo: RegionFeatureCollection;
  hrefPrefix: string;
  ariaLabel?: string;
  pad?: number;
  labelNudge?: Record<string, [number, number]>;
}) {
  const { shapes, islandPath, viewBox } = useMemo(() => {
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
  }, [geo, pad, labelNudge]);

  return (
    <svg
      viewBox={viewBox}
      className="h-auto w-full overflow-visible"
      role="group"
      aria-label={ariaLabel}
    >
      {/* 인터랙티브 시/도(큰 지역 → 작은 지역 순) */}
      {shapes.map((s) => (
        <Link
          key={s.slug}
          href={`${hrefPrefix}/${s.slug}`}
          aria-label={s.label}
          className="group/region outline-none"
        >
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
        </Link>
      ))}

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
