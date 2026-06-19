import Image from "next/image";
import { curriculum } from "@/data/curriculum";
import type { ConcernItem } from "@/data/curriculum";

/*
 * Curriculum(중단) 섹션 — 좌우 2단.
 *  - 왼쪽: 원래 디자인 이미지(제목 포함, curriculum-graphic.png)를 왼쪽 정렬로 배치.
 *  - 오른쪽: '이런 고민이라면' 6가지 체크(아이콘 + 텍스트, 키워드만 주황 강조).
 *
 * 데스크톱 약 55:45 2열(세로 중앙 정렬), 모바일은 세로 스택(이미지 위 → 체크 아래).
 * 팔레트: 주황(accent) + 차콜/그레이 + 흰색 (보라 없음).
 * 시각적 제목은 이미지 안에 있으므로 검색엔진/접근성용 sr-only <h2> 를 하나 둔다(페이지 h1 과 별개).
 * 데이터는 curriculum.ts 에서만 가져온다(하드코딩 금지).
 */
export default function Curriculum() {
  const { srTitle, graphic, concerns } = curriculum;

  return (
    <section
      id="curriculum"
      aria-labelledby="curriculum-heading"
      className="relative overflow-hidden border-t border-line bg-white px-4 py-16 sm:px-6 sm:py-20"
    >
      {/* 화면 비표시 SEO/접근성용 제목(시각적 제목은 이미지 안에 포함) */}
      <h2 id="curriculum-heading" className="sr-only">
        {srTitle}
      </h2>

      {/* 좌우 여백 장식 인물 — 흰 배경 PNG 가 흰 섹션에 묻혀 누끼처럼 보인다.
          본문 뒤(z-0)·하단 정렬·클릭 불가, 태블릿 이하(xl 미만)에서는 숨김. */}
      <Image
        src="/images/students-white.png"
        alt=""
        aria-hidden
        width={396}
        height={362}
        unoptimized
        className="pointer-events-none absolute bottom-0 left-0 z-0 hidden h-[300px] w-auto select-none xl:block 2xl:h-[360px]"
      />
      <Image
        src="/images/teacher-white.png"
        alt=""
        aria-hidden
        width={357}
        height={423}
        unoptimized
        className="pointer-events-none absolute bottom-0 right-0 z-0 hidden h-[360px] w-auto select-none xl:block 2xl:h-[460px]"
      />

      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-10 md:grid-cols-[3fr_2fr] md:gap-14">
        {/* 왼쪽: 커리큘럼 이미지(왼쪽 정렬) — 어두운 그래픽이 카드처럼 보이게 라운드+그림자.
            열이 945px 보다 넓어도 이미지는 maxWidth(945)까지만 커져 흐려지지 않는다. */}
        <div
          className="overflow-hidden rounded-2xl shadow-md"
          style={{ maxWidth: `${graphic.maxWidthPx}px` }}
        >
          <Image
            src={graphic.src}
            alt={graphic.alt}
            width={graphic.width}
            height={graphic.height}
            sizes="(min-width: 768px) 60vw, 100vw"
            className="h-auto w-full object-contain"
            // 개발 서버 이미지 최적화 이슈 회피. 배포 시 최적화를 원하면 제거.
            unoptimized
          />
        </div>

        {/* 오른쪽: '이런 고민이라면' 체크 블록(밝은 카드) — 왼쪽 이미지와 무게가 맞게 확대 */}
        <div className="rounded-2xl bg-white p-7 shadow-md sm:p-9">
          <h3 className="text-2xl font-bold leading-snug text-ink sm:text-3xl">
            {concerns.title}
          </h3>
          <p className="mt-2 text-base text-muted sm:text-lg">
            {concerns.subtitle}
          </p>

          <ul className="mt-7 flex flex-col gap-5 sm:gap-6">
            {concerns.items.map((item, i) => (
              <li key={i} className="flex items-center gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent sm:h-14 sm:w-14">
                  <ConcernIcon name={item.icon} />
                </span>
                <p className="text-lg leading-snug text-ink">
                  {item.before}
                  <strong className="font-bold text-accent">
                    {item.keyword}
                  </strong>
                  {item.after}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/** 라인 아이콘(외부 의존성 없이 인라인 SVG). stroke=currentColor → 주황(accent) 상속. */
function ConcernIcon({ name }: { name: ConcernItem["icon"] }) {
  const common = {
    width: 26,
    height: 26,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.9,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  switch (name) {
    case "trending":
      return (
        <svg {...common}>
          <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
          <polyline points="16 7 22 7 22 13" />
        </svg>
      );
    case "award":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="6" />
          <path d="M8.5 13.5 7 22l5-3 5 3-1.5-8.5" />
        </svg>
      );
    case "compass":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="10" />
          <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88" />
        </svg>
      );
    case "target":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" />
        </svg>
      );
    case "heart":
      return (
        <svg {...common}>
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.5 4.04 3 5.5l7 7Z" />
        </svg>
      );
    case "bulb":
    default:
      return (
        <svg {...common}>
          <path d="M9 18h6M10 22h4" />
          <path d="M15.1 14c.2-1 .7-1.7 1.4-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.8 1.2 1.5 1.4 2.5" />
        </svg>
      );
  }
}
