"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { teachers, type Teacher } from "@/data/teachers";
import { teacherCarousel, type TeacherTone } from "@/data/teacherCarousel";

/*
 * Teachers(OUR TEACHER) — 가로 슬라이드 center-focus 캐러셀.
 *
 * 카드: data/teachers.ts(44명)에서 마운트 시 랜덤 SHOW_COUNT명 추출(새로고침마다 구성 변경).
 *   ⚠️ 셔플은 useEffect(클라이언트)에서만 — 서버/클라이언트 첫 렌더는 동일 스켈레톤이라 하이드레이션 불일치 없음.
 * 카드 필드: 인용구=intro / 사진=image(object-cover) / 이름=name / 학력·소속=credential / 태그=#과목.
 * 조작/디자인은 기존 유지: Prev/Next + dot + 스와이프/드래그 + 좌우 화살표 키, center-focus.
 * 섹션 카피는 teacherCarousel.ts, 카드 데이터는 teachers.ts 에서만 가져온다(하드코딩 금지).
 */

/** 노출 인원(랜덤 추출 개수). */
const SHOW_COUNT = 10;

/** 카드 톤 순환 키(브랜드 톤 변주, 레인보우 아님). */
const TONE_CYCLE: TeacherTone[] = ["charcoal", "cream", "peach"];

/** 카드 톤별 클래스. caption 은 사진 위 가독성용 하단 그라데이션 색. */
const TONES: Record<
  TeacherTone,
  {
    card: string;
    quote: string;
    headline: string;
    tag: string;
    credential: string;
    name: string;
    caption: string;
  }
> = {
  charcoal: {
    card: "bg-primary text-white ring-1 ring-white/10",
    quote: "text-accent",
    headline: "text-white",
    tag: "bg-white/10 text-white/85",
    credential: "text-white/55",
    name: "text-white",
    caption: "from-primary-dark via-primary-dark/85",
  },
  cream: {
    card: "bg-[#F4EAE0] text-ink ring-1 ring-black/5",
    quote: "text-accent",
    headline: "text-ink",
    tag: "bg-accent/10 text-accent",
    credential: "text-muted",
    name: "text-ink",
    caption: "from-[#F4EAE0] via-[#F4EAE0]/85",
  },
  peach: {
    card: "bg-[#FFE6DC] text-ink ring-1 ring-accent/15",
    quote: "text-accent",
    headline: "text-ink",
    tag: "bg-white/70 text-accent",
    credential: "text-[#9A5742]",
    name: "text-ink",
    caption: "from-[#FFE6DC] via-[#FFE6DC]/85",
  },
};

export default function Teachers() {
  const { label, heading, cta, autoplayMs } = teacherCarousel;
  // 카드 수는 항상 SHOW_COUNT(스켈레톤 ↔ 실데이터 전환 시에도 슬라이드/점 개수 고정 → 레이아웃 흔들림·하이드레이션 이슈 없음).
  const count = SHOW_COUNT;

  const [picked, setPicked] = useState<Teacher[]>([]);
  const [active, setActive] = useState(0);
  const [reduce, setReduce] = useState(false);
  const [ready, setReady] = useState(false);
  const [metrics, setMetrics] = useState({ vw: 0, cardW: 320, gap: 24 });
  const [drag, setDrag] = useState(0);

  const viewportRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ startX: 0, active: false, moved: false });

  const clamp = useCallback(
    (i: number) => Math.max(0, Math.min(count - 1, i)),
    [count],
  );
  const go = useCallback((i: number) => setActive(() => clamp(i)), [clamp]);
  const next = useCallback(() => go(active + 1), [active, go]);
  const prev = useCallback(() => go(active - 1), [active, go]);

  // 랜덤 10명 추출 — 클라이언트 마운트 후에만(하이드레이션 안전). 새로고침=재마운트마다 새 구성.
  useEffect(() => {
    const shuffled = [...teachers];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setPicked(shuffled.slice(0, SHOW_COUNT));
  }, []);

  // 뷰포트 측정(반응형 카드 폭) — ResizeObserver 로 추적.
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const measure = () => {
      const vw = el.clientWidth;
      let cardW: number;
      if (vw < 480) cardW = Math.min(vw * 0.84, 330); // 모바일: 1장 + 양옆 살짝 peek
      else if (vw < 900) cardW = 340; // 태블릿
      else cardW = 360; // 데스크톱: 활성 1장 + 양옆 peek
      setMetrics({ vw, cardW, gap: vw < 480 ? 16 : 24 });
      setReady(true);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // 모션 최소화 설정 감지.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduce(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // 자동재생(기본 꺼짐). 드래그 중에는 멈춤.
  useEffect(() => {
    if (!autoplayMs || autoplayMs <= 0 || reduce) return;
    const id = window.setInterval(() => {
      setActive((p) => (p + 1) % count);
    }, autoplayMs);
    return () => window.clearInterval(id);
  }, [autoplayMs, reduce, count]);

  // 포인터 드래그/스와이프.
  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    dragRef.current = { startX: e.clientX, active: true, moved: false };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) return;
    const dx = e.clientX - dragRef.current.startX;
    if (Math.abs(dx) > 5) dragRef.current.moved = true;
    setDrag(dx);
  };
  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) return;
    const dx = e.clientX - dragRef.current.startX;
    dragRef.current.active = false;
    setDrag(0);
    const threshold = Math.max(40, metrics.cardW * 0.18);
    if (dx <= -threshold) next();
    else if (dx >= threshold) prev();
  };

  // 트랙 이동량: 활성 카드를 뷰포트 중앙에 맞춤(+드래그 보정).
  const step = metrics.cardW + metrics.gap;
  const translate = metrics.vw / 2 - (active * step + metrics.cardW / 2) + drag;

  const trackStyle: CSSProperties = {
    transform: `translate3d(${translate}px, 0, 0)`,
    gap: `${metrics.gap}px`,
    transition:
      reduce || dragRef.current.active
        ? "none"
        : "transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)",
    opacity: ready ? 1 : 0,
  };

  return (
    <section
      id="teachers"
      aria-labelledby="teachers-heading"
      aria-roledescription="carousel"
      className="overflow-hidden border-t border-line bg-surface px-4 py-16 sm:px-6 sm:py-20"
    >
      {/* 헤더 — 라벨 + 제목 + (데스크톱) Prev/Next */}
      <div className="mx-auto mb-9 flex max-w-6xl items-end justify-between gap-4 sm:mb-12">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-accent">
            {label}
          </p>
          <h2
            id="teachers-heading"
            className="mt-2 text-2xl font-bold leading-snug text-ink sm:text-3xl md:text-4xl"
          >
            {heading.title.map((seg, i) => (
              <span key={i}>{seg.text}</span>
            ))}
            <br />
            <strong className="font-bold text-accent">{heading.emphasis}</strong>
          </h2>
        </div>

        {/* 화살표 버튼 — 모바일은 스와이프/점으로 대체(숨김) */}
        <div className="hidden shrink-0 gap-2 sm:flex">
          <NavButton dir="prev" onClick={prev} disabled={active === 0} />
          <NavButton dir="next" onClick={next} disabled={active === count - 1} />
        </div>
      </div>

      {/* 캐러셀 뷰포트 — 내부 슬라이드만 이동(페이지 가로 스크롤 없음) */}
      <div
        ref={viewportRef}
        className="relative mx-auto max-w-6xl cursor-grab overflow-hidden active:cursor-grabbing"
        style={{ touchAction: "pan-y" }}
        role="group"
        aria-label="선생님 카드 캐러셀"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            prev();
          } else if (e.key === "ArrowRight") {
            e.preventDefault();
            next();
          }
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <ul className="flex items-center" style={trackStyle}>
          {Array.from({ length: SHOW_COUNT }, (_, i) => {
            const teacher = picked[i]; // 마운트 전엔 undefined → 스켈레톤
            const isActive = i === active;
            const tone = TONES[TONE_CYCLE[i % TONE_CYCLE.length]];
            const slideStyle: CSSProperties = {
              width: `${metrics.cardW}px`,
              transform: `scale(${isActive ? 1 : 0.88})`,
              opacity: isActive ? 1 : 0.55,
              filter: isActive ? "none" : "blur(1px)",
              transition: reduce
                ? "none"
                : "transform 0.45s ease, opacity 0.45s ease, filter 0.45s ease",
            };
            return (
              <li
                key={i}
                className="shrink-0 select-none"
                style={slideStyle}
                aria-roledescription="slide"
                aria-label={`${i + 1} / ${SHOW_COUNT}`}
                aria-hidden={!isActive}
                onClick={() => {
                  if (!dragRef.current.moved && !isActive) go(i);
                }}
              >
                {teacher ? (
                  <article
                    className={`group relative flex h-[440px] flex-col overflow-hidden rounded-3xl p-6 shadow-lg sm:h-[480px] sm:p-7 ${tone.card} ${
                      isActive ? "" : "cursor-pointer"
                    }`}
                  >
                    {/* 텍스트(인용부호·한마디·과목 태그) — 사진 위로 올림(z-10). 여백을 줄여 사진 영역 확보. */}
                    <div className="relative z-10">
                      <span
                        aria-hidden
                        className={`font-serif text-3xl leading-none ${tone.quote}`}
                      >
                        &ldquo;
                      </span>

                      {/* 선생님 한마디(intro) — 1줄 고정(말줄임). 2줄이 더 좋으면 line-clamp-2 로. */}
                      <p
                        className={`mt-0.5 line-clamp-1 text-lg font-bold leading-snug sm:text-xl ${tone.headline}`}
                      >
                        {teacher.intro}
                      </p>

                      {/* 과목 태그(#과목) 하나만 */}
                      <ul className="mt-2 flex flex-wrap gap-1.5">
                        <li
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tone.tag}`}
                        >
                          #{teacher.subject}
                        </li>
                      </ul>
                    </div>

                    {/* 사진 — object-cover + object-top(얼굴 상단이 잘리지 않게). 영역을 키움. */}
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[72%]">
                      <Image
                        src={teacher.image}
                        alt={`${teacher.name} 사진`}
                        fill
                        sizes="360px"
                        className="object-cover object-top transition-transform duration-300 ease-out group-hover:-translate-y-2"
                        // 개발 서버 이미지 최적화 이슈 회피. 배포 시 최적화를 원하면 제거.
                        unoptimized
                      />
                    </div>

                    {/* 하단 학력·소속/이름 — 사진 위 그라데이션으로 가독성 확보 */}
                    <div
                      className={`pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t to-transparent px-6 pb-5 pt-12 ${tone.caption}`}
                    >
                      <p className={`text-xs ${tone.credential}`}>
                        {teacher.credential}
                      </p>
                      <p className={`mt-0.5 text-base font-bold ${tone.name}`}>
                        {teacher.name}
                      </p>
                    </div>
                  </article>
                ) : (
                  // 마운트 전 스켈레톤(서버/클라이언트 동일 렌더 → 하이드레이션 안전)
                  <div className="h-[440px] animate-pulse rounded-3xl bg-surface-alt ring-1 ring-line sm:h-[480px]" />
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* 점(dot) 인디케이터 */}
      <div className="mt-8 flex justify-center gap-2">
        {Array.from({ length: SHOW_COUNT }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => go(i)}
            aria-label={`${i + 1}번째 선생님 보기`}
            aria-current={i === active}
            className={`h-2.5 rounded-full transition-all ${
              i === active
                ? "w-6 bg-accent"
                : "w-2.5 bg-primary-light/40 hover:bg-primary-light/70"
            }`}
          />
        ))}
      </div>

      {/* 하단 공통 CTA — #consult (개별 선택 버튼 없음). 긴 문구라 줄바꿈 허용. */}
      <div className="mt-12 text-center">
        <Link
          href={cta.href}
          className="inline-flex min-h-14 max-w-full items-center justify-center rounded-full bg-accent px-7 py-3 text-center text-base font-semibold text-white shadow-md transition-colors hover:bg-accent-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:text-lg"
        >
          {cta.label}
        </Link>
      </div>
    </section>
  );
}

/** Prev/Next 화살표 버튼(원형, 외부 의존성 없이 인라인 SVG). */
function NavButton({
  dir,
  onClick,
  disabled,
}: {
  dir: "prev" | "next";
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === "prev" ? "이전 선생님" : "다음 선생님"}
      className="flex h-12 w-12 items-center justify-center rounded-full border border-line bg-white text-ink shadow-sm transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-line disabled:hover:text-ink"
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
        className={dir === "next" ? "rotate-180" : ""}
      >
        <polyline points="15 18 9 12 15 6" />
      </svg>
    </button>
  );
}
