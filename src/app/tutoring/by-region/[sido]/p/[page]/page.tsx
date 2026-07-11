import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import DongCardGrid from "@/components/DongCardGrid";
import Pagination from "@/components/Pagination";
import { REGIONS, getSido, allDongOf } from "@/data/sidoRegions";
import { paginate, pageCount } from "@/lib/paginate";
import { site } from "@/data/site";

/*
 * 동 목록 페이지네이션 — /tutoring/by-region/[sido]/p/[page] (page ≥ 2).
 *  - 1페이지는 기존 URL(/tutoring/by-region/[sido]) 이며 …/p/1 은 만들지 않는다.
 *  - 정적 `p` 세그먼트라 동일 레벨의 동적 [seg2](경기 pSEO·서울 구)보다 우선 매칭된다.
 *  - 전체 페이지 SSG. 범위 밖/비정규 번호는 404. 사이트맵에는 넣지 않는다.
 */
export const dynamicParams = false;

const PAGE_SIZE = 48;

export function generateStaticParams() {
  const out: { sido: string; page: string }[] = [];
  for (const s of REGIONS) {
    const count = s.sigungu.reduce((a, sg) => a + sg.dong.length, 0);
    const total = pageCount(count, PAGE_SIZE);
    for (let n = 2; n <= total; n += 1) out.push({ sido: s.slug, page: String(n) });
  }
  return out;
}

function resolve(sidoParam: string, pageParam: string) {
  const sido = getSido(sidoParam);
  if (!sido) return null;
  if (!/^[0-9]+$/.test(pageParam)) return null;
  const page = Number(pageParam);
  if (String(page) !== pageParam || page < 2) return null;
  const all = allDongOf(sido.slug);
  const totalPages = pageCount(all.length, PAGE_SIZE);
  if (page > totalPages) return null;
  return { sido, all, totalPages, page };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ sido: string; page: string }>;
}): Promise<Metadata> {
  const { sido, page } = await params;
  const r = resolve(sido, page);
  if (!r) return {};
  const canonical = `/tutoring/by-region/${r.sido.slug}/p/${r.page}`;
  const title = `${r.sido.label} 동네별 1:1 과외 — ${r.page}페이지`;
  const description = `${r.sido.label}의 동네별 1:1 맞춤 과외 목록 ${r.page}페이지. 우리 동네에 맞는 선생님을 상담으로 연결해 드립니다.`;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: "website" },
  };
}

export default async function RegionSidoPagedPage({
  params,
}: {
  params: Promise<{ sido: string; page: string }>;
}) {
  const { sido, page } = await params;
  const r = resolve(sido, page);
  if (!r) notFound();
  const paged = paginate(r.all, r.page, PAGE_SIZE);
  const basePath = `/tutoring/by-region/${r.sido.slug}`;

  return (
    <section className="px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-5xl">
        <nav aria-label="현재 위치" className="text-sm text-muted">
          <Link href="/tutoring/by-region" className="hover:text-accent">지역별</Link>
          <span aria-hidden className="px-1.5 text-line">›</span>
          <Link href={basePath} className="hover:text-accent">{r.sido.label}</Link>
        </nav>

        <h1 className="mt-4 break-keep text-2xl font-bold text-ink sm:text-3xl">
          {r.sido.label} 동네별 1:1 과외
        </h1>
        <p className="mt-2 break-keep text-sm text-muted sm:text-base">
          가나다순 전체 동 목록 · {r.page}/{r.totalPages}페이지 · 총 {paged.total.toLocaleString("ko-KR")}개 동
        </p>
        <p className="mt-1 text-sm">
          <Link href={basePath} className="font-semibold text-accent hover:underline">
            지도·시·군·구로 찾기 →
          </Link>
        </p>

        <div className="mt-7">
          <DongCardGrid sidoSlug={r.sido.slug} dongs={paged.items} />
        </div>

        <Pagination
          page={r.page}
          totalPages={r.totalPages}
          basePath={basePath}
          ariaLabel={`${r.sido.label} 동 목록 페이지`}
        />

        <div className="mx-auto mt-12 max-w-2xl rounded-2xl bg-surface px-6 py-8 text-center sm:py-10">
          <p className="break-keep text-base font-medium text-ink sm:text-lg">
            우리 동네가 안 보이시나요? 바로 상담받으세요.
          </p>
          <div className="mt-5">
            <a
              href={site.cta.href}
              className="inline-flex min-h-14 items-center justify-center rounded-full bg-accent px-7 py-3 text-base font-semibold text-white shadow-md transition-colors hover:bg-accent-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:text-lg"
            >
              {site.cta.label}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
