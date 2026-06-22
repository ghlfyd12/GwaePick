"use client";

import { useMemo } from "react";
import Link from "next/link";
import { geoPath, geoIdentity } from "d3-geo";
import type { Feature, FeatureCollection, Geometry } from "geojson";

/*
 * RegionMap — 정적 GeoJSON 을 d3-geo 로 SVG path 로 그리는 범용 지도(외부 지도 API/키 없음).
 *
 * props:
 *  - geo: GeoJSON FeatureCollection (properties = { slug, label, name_full })
 *  - hrefPrefix: 각 지역 링크 prefix. href = `${hrefPrefix}/${slug}`.
 *    (※ 서버 컴포넌트 → 클라이언트 컴포넌트로 함수(getHref)를 직렬화해 넘길 수 없어
 *       문자열 prefix 로 받아 내부에서 href 를 만든다.)
 *  - ariaLabel: 지도 그룹 라벨.
 *
 * 각 path 는 next/link(SVG <a>)로 감싸 클릭 시 해당 지역으로 이동.
 * 기본 fill 연한 주황, hover/focus 시 사이트 주황(accent) 강조 + 라벨 흰색. 라벨은 pointer-events-none.
 * viewBox 800×800, w-full h-auto 로 화면 폭에 맞춰 축소(모바일 가로 스크롤 없음).
 */

type RegionProps = { slug: string; label: string; name_full?: string };
export type RegionFeatureCollection = FeatureCollection<Geometry, RegionProps>;

export default function RegionMap({
  geo,
  hrefPrefix,
  ariaLabel,
}: {
  geo: RegionFeatureCollection;
  hrefPrefix: string;
  ariaLabel?: string;
}) {
  const shapes = useMemo(() => {
    // geoIdentity(평면 좌표) + reflectY: lon/lat 를 화면 좌표로 직접 맞춤.
    // (geoMercator 의 구면 다각형 처리는 GeoJSON 링 winding 에 민감해 영역이 뒤집힐 수 있어 사용하지 않음)
    const projection = geoIdentity()
      .reflectY(true)
      .fitSize([800, 800], geo as never);
    const path = geoPath(projection);
    return geo.features.map((f: Feature<Geometry, RegionProps>) => {
      const [cx, cy] = path.centroid(f as never);
      return {
        slug: f.properties.slug,
        label: f.properties.label,
        d: path(f as never) ?? "",
        cx: Number.isFinite(cx) ? cx : 0,
        cy: Number.isFinite(cy) ? cy : 0,
      };
    });
  }, [geo]);

  return (
    <svg
      viewBox="0 0 800 800"
      className="h-auto w-full"
      role="group"
      aria-label={ariaLabel}
    >
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
            x={s.cx}
            y={s.cy}
            textAnchor="middle"
            dominantBaseline="middle"
            className="pointer-events-none select-none fill-ink text-[13px] font-medium group-hover/region:fill-white group-focus-visible/region:fill-white"
          >
            {s.label}
          </text>
        </Link>
      ))}
    </svg>
  );
}
