"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import Image from "next/image";
import { whyus } from "@/data/whyus";
import type { WhyUsBlock } from "@/data/whyus";

/*
 * WhyUs(지식의참견이 다른 이유) — 커리큘럼 다음 / 후기 앞.
 *
 * (A) 숫자 강조 띠: 신뢰 지표 4개(데스크톱 4열 / 모바일 2x2). 숫자는 주황 강조.
 * (B) 이미지+텍스트 교차 블록 5개: 데스크톱은 좌우 교차, 모바일은 세로 스택(이미지 위/텍스트 아래).
 *
 * 색: 주황(accent) 포인트 + 차콜/그레이 + 흰색 (보라 없음).
 * 스크롤 진입 시 은은한 페이드인(IntersectionObserver). prefers-reduced-motion 존중.
 * 카피/숫자/이미지경로는 모두 whyus.ts 에서만 가져온다(하드코딩 금지).
 */

const REVEAL_MS = 600; // 페이드인 시간(ms) — 여기 한 값으로 조절
const COUNT_UP_MS = 1200; // 숫자 카운트업 시간(ms) — 여기 한 값으로 조절

/** 화면 진입 시 0 → to 까지 1회 카운트업. reduced-motion 이면 최종값 즉시 표시. */
function CountUp({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [val, setVal] = useState(0);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
  }, []);

  useEffect(() => {
    if (reduced) {
      setVal(to);
      return;
    }
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    let started = false;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !started) {
          started = true;
          io.disconnect();
          const start = performance.now();
          const tick = (now: number) => {
            const p = Math.min(1, (now - start) / COUNT_UP_MS);
            const eased = 1 - Math.pow(1 - p, 3); // ease-out
            setVal(Math.round(eased * to));
            if (p < 1) raf = requestAnimationFrame(tick);
          };
          raf = requestAnimationFrame(tick);
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [to, reduced]);

  return <span ref={ref}>{val}</span>;
}

/** 숫자 띠 아이콘(외부 의존성 없이 인라인 라인 SVG). stroke=currentColor → 주황 상속. */
function StatIcon({ name }: { name: "award" | "book" | "monitor" | "users" }) {
  const common = {
    width: 30,
    height: 30,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  if (name === "award") {
    return (
      <svg {...common}>
        <circle cx="12" cy="8" r="6" />
        <path d="M8.5 13.5 7 22l5-3 5 3-1.5-8.5" />
      </svg>
    );
  }
  if (name === "book") {
    return (
      <svg {...common}>
        <path d="M3 4.5A1.5 1.5 0 0 1 4.5 3H11v16H4.5A1.5 1.5 0 0 0 3 20.5z" />
        <path d="M21 4.5A1.5 1.5 0 0 0 19.5 3H13v16h6.5a1.5 1.5 0 0 1 1.5 1.5z" />
      </svg>
    );
  }
  if (name === "monitor") {
    return (
      <svg {...common}>
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8M12 17v4" />
      </svg>
    );
  }
  // users
  return (
    <svg {...common}>
      <path d="M16 19v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1" />
      <circle cx="9" cy="7" r="3" />
      <path d="M22 19v-1a4 4 0 0 0-3-3.87M16 4.13A4 4 0 0 1 16 11.87" />
    </svg>
  );
}

/** 스크롤로 보이면 1회 페이드+살짝 상승. reduced-motion 이면 효과 없이 바로 표시. */
function Reveal({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const show = visible || reduced;
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: show ? 1 : 0,
        transform: show ? "none" : "translateY(16px)",
        transition: reduced
          ? "none"
          : `opacity ${REVEAL_MS}ms ease-out, transform ${REVEAL_MS}ms ease-out`,
      }}
    >
      {children}
    </div>
  );
}

export default function WhyUs() {
  const { heading, stats, blocks } = whyus;

  return (
    <section
      id="whyus"
      aria-labelledby="whyus-heading"
      className="border-t border-line bg-white px-4 py-16 sm:px-6 sm:py-20"
    >
      {/* 제목 */}
      <div className="mx-auto mb-10 max-w-5xl text-center sm:mb-12">
        <h2
          id="whyus-heading"
          className="text-2xl font-bold leading-snug text-ink sm:text-3xl md:text-4xl"
        >
          {heading.title}
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-muted">
          {heading.subtitle}
        </p>
      </div>

      {/* (A) 숫자 강조 띠 — 데스크톱 4열 / 모바일 2x2. gap-px + bg-line 으로 얇은 구분선. */}
      <Reveal className="mx-auto mb-16 grid max-w-5xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:mb-20 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white px-4 py-7 text-center">
            <span className="mb-2 inline-flex text-accent">
              <StatIcon name={s.icon} />
            </span>
            <p className="text-3xl font-extrabold leading-none text-accent sm:text-4xl">
              <CountUp to={s.value} />
              {s.unit && (
                <span className="ml-0.5 text-lg font-bold sm:text-xl">
                  {s.unit}
                </span>
              )}
            </p>
            <p className="mt-2 text-base font-bold text-ink sm:text-lg">{s.label}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted">{s.note}</p>
          </div>
        ))}
      </Reveal>

      {/* (B) 강점 블록 5개 */}
      <div className="mx-auto flex max-w-5xl flex-col gap-16 sm:gap-24">
        {blocks.map((b) => (
          <Block key={b.id} block={b} />
        ))}
      </div>
    </section>
  );
}

function Block({ block }: { block: WhyUsBlock }) {
  const imageRight = block.imageSide === "right";
  return (
    <Reveal className="grid items-center gap-6 md:grid-cols-2 md:gap-12">
      {/* 이미지 — 모바일 위(order 기본), 데스크톱 좌/우 교차 */}
      <div className={imageRight ? "md:order-2" : ""}>
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-gradient-to-br from-surface-alt to-line shadow-sm">
          <Image
            src={block.image}
            alt={block.imageAlt}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            // 영역을 채우되 인물이 어색하게 잘리지 않게 중앙 기준(필요 시 블록별로 조정).
            className="object-cover object-center"
            // 개발 서버 이미지 최적화 이슈 회피용. 배포/최적화를 원하면 이 prop 제거.
            unoptimized
          />
        </div>
      </div>

      {/* 텍스트 */}
      <div className={imageRight ? "md:order-1" : ""}>
        <span className="inline-flex items-center rounded-full bg-accent/10 px-3 py-1 text-xs font-bold text-accent">
          {block.badge}
        </span>
        <h3 className="mt-3 text-xl font-bold leading-snug text-ink sm:text-2xl">
          {block.title}
        </h3>
        <p className="mt-3 text-base leading-relaxed text-muted">{block.body}</p>
      </div>
    </Reveal>
  );
}
