import Image from "next/image";
import Link from "next/link";
import { subjects } from "@/data/subjects";
import { dongHref } from "@/data/dongPageCopy";

/*
 * DongHub — 동 허브(경량). 과목 컨텍스트 없이 동을 눌렀을 때, 과목 상세로 가는 선택 화면.
 * 교실 사진을 배경으로 깔고, 콘텐츠를 사진 위 오른쪽 절반에 오버레이한다.
 * (인물은 사진 왼쪽에 있으므로 텍스트는 오른쪽 빈 공간에 배치 → 인물 회피)
 * 모바일에서는 오버레이가 좁아 깨지므로 "사진 위 / 콘텐츠 아래" 세로 분리로 분기한다.
 * h1 1개. 데이터는 subjects.ts / 링크는 dongHref.
 */

// 배경 사진 — 추후 지역별 사진 교체 대비, 한 곳에 모은다(지금은 공용 1장).
const HERO_IMAGE = "/images/classroom-student.png";

export default function DongHub({
  sidoSlug,
  sigungu,
  dong,
}: {
  sidoSlug: string;
  sigungu: { name: string; slug: string };
  dong: { name: string; slug: string };
}) {
  return (
    <section className="px-4 py-14 sm:px-6 sm:py-20">
      <div className="relative mx-auto max-w-5xl overflow-hidden rounded-2xl shadow-md ring-1 ring-line md:min-h-[460px]">
        {/* 배경 사진 — 모바일: 위쪽 4:3 블록 / 데스크톱: 영역 전체 채움 */}
        <div className="relative aspect-[4/3] w-full md:absolute md:inset-0 md:aspect-auto md:h-full">
          <Image
            src={HERO_IMAGE}
            alt="교실에서 공부하는 학생"
            fill
            priority
            sizes="(min-width: 1024px) 1024px, 100vw"
            className="object-cover"
            unoptimized
          />
        </div>

        {/* 데스크톱 가독성 스크림 — 오른쪽은 밝게, 왼쪽 인물 쪽은 투명 */}
        <div
          aria-hidden
          className="hidden md:absolute md:inset-0 md:block bg-gradient-to-l from-white/85 via-white/70 to-transparent"
        />

        {/* 콘텐츠 — 모바일: 사진 아래 가운데 / 데스크톱: 사진 위 오른쪽 절반 */}
        <div className="relative bg-white px-5 py-8 text-center md:absolute md:inset-0 md:flex md:items-center md:justify-end md:bg-transparent md:px-0 md:py-0 md:pr-10 md:text-left">
          <div className="md:max-w-[48%]">
            <p className="text-sm font-semibold uppercase tracking-widest text-accent">
              {sigungu.name} · {dong.name}
            </p>
            <h1 className="mt-2 break-keep text-3xl font-bold leading-snug text-ink sm:text-4xl">
              {dong.name} 1:1 과외 — 과목을 선택하세요
            </h1>
            <p className="mt-4 break-keep text-base leading-relaxed text-muted sm:text-lg">
              {dong.name}에서 1:1 맞춤 개인과외 수업이 가능한 선생님을 과목별로
              안내해 드립니다.
            </p>

            <ul className="mt-8 grid grid-cols-2 gap-3">
              {subjects.map((s) => (
                <li key={s.slug}>
                  <Link
                    href={dongHref(sidoSlug, sigungu.slug, dong.slug, s.slug)}
                    className="flex min-h-16 items-center justify-center rounded-2xl border border-line bg-white text-lg font-bold text-ink transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  >
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
