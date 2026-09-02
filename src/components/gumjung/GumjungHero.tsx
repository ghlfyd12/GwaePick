import Image from "next/image";

/*
 * GumjungHero — 검고 축 공통 히어로(허브·급별·지역·가이드).
 * 어학의참견 히어로 밀도 기준으로 심플하게: [아이브로우 / h1 / 서브 1줄 / CTA 1개]. 뱃지·수치 없음.
 *
 * 배경 art direction: 모바일(<768px)=세로 gumjung-hero-m.webp(800×1066),
 *   데스크톱(≥768px)=16:9 gumjung-hero.webp(1920×1080). next/image fill+priority(LCP).
 * 어두운 오버레이 위 밝은 텍스트, 청록 accent 는 CTA 에만. 높이는 breakpoint 별 min-h(모바일은
 * 풀스크린 금지 — 첫 화면에 h1·서브·CTA 노출 + 아래 콘텐츠가 살짝 걸치는 높이).
 */
export default function GumjungHero({
  eyebrow,
  title,
  sub,
  ctaHref = "#consult",
  ctaLabel,
}: {
  eyebrow: string;
  title: string;
  sub: string;
  ctaHref?: string;
  ctaLabel: string;
}) {
  return (
    <section className="relative flex min-h-[27rem] items-center overflow-hidden border-b border-line md:min-h-[32rem] lg:min-h-[38rem]">
      {/* 배경 — 모바일 세로 / 데스크톱 16:9 (art direction) */}
      <Image
        src="/gumjung-hero-m.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover md:hidden"
      />
      <Image
        src="/gumjung-hero.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="hidden object-cover md:block"
      />
      {/* 어두운 오버레이 — 텍스트 대비 확보 */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/55 to-black/50" />

      {/* 콘텐츠 */}
      <div className="relative z-10 mx-auto w-full max-w-3xl px-5 py-16 text-center sm:px-6 md:py-20">
        <p className="text-sm font-semibold uppercase tracking-widest text-white/80">
          {eyebrow}
        </p>
        <h1 className="mt-3 break-keep text-[1.9rem] font-bold leading-snug text-white drop-shadow-sm sm:text-4xl sm:leading-tight lg:text-5xl">
          {title}
        </h1>
        <p className="mx-auto mt-4 max-w-xl break-keep text-base leading-relaxed text-white/85 sm:text-lg">
          {sub}
        </p>
        <div className="mt-7 flex justify-center">
          <a
            href={ctaHref}
            className="inline-flex min-h-14 w-full max-w-xs items-center justify-center rounded-full bg-accent px-8 text-base font-semibold text-white shadow-lg transition-colors hover:bg-accent-dark sm:w-auto sm:text-lg"
          >
            {ctaLabel}
          </a>
        </div>
      </div>
    </section>
  );
}
