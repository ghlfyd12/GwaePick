import Image from "next/image";
import { teacherIntro } from "@/data/teacherIntro";

/*
 * TeacherIntro('선생님 소개' 인트로) 블록 — Teachers(교사진 카드) 섹션 바로 위.
 *
 * 데스크톱: 좌(사진)·우(텍스트) 2단(세로 중앙 정렬). 모바일 390px: 세로 스택(사진 위 → 텍스트 아래).
 * 사진은 둥근 프레임 + next/image 로 비율 유지(없으면 회색 플레이스홀더 배경).
 * 색: 제목·강조 마커는 주황(accent), 본문은 진한 회색(text-ink) — 파랑/보라 없음.
 * 데이터는 teacherIntro.ts 에서만 가져온다(하드코딩 금지).
 */
export default function TeacherIntro() {
  const { title, body, highlights, photo } = teacherIntro;

  return (
    <section
      id="teacher-intro"
      aria-labelledby="teacher-intro-heading"
      className="border-t border-line bg-white px-4 py-16 sm:px-6 sm:py-20"
    >
      <div className="mx-auto grid max-w-5xl items-center gap-10 md:grid-cols-2 md:gap-14">
        {/* 왼쪽: 헤드샷 사진 — 둥근 프레임, 비율 유지. 회색 배경이 플레이스홀더 역할. */}
        <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-2xl bg-surface-alt shadow-md ring-1 ring-line md:mx-0">
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            sizes="(min-width: 768px) 40vw, 100vw"
            className="object-cover"
            // 개발 서버 이미지 최적화 이슈 회피. 배포 시 최적화를 원하면 제거.
            unoptimized
          />
        </div>

        {/* 오른쪽: 소개 텍스트 */}
        <div>
          <h2
            id="teacher-intro-heading"
            className="text-2xl font-bold leading-snug text-accent sm:text-3xl"
          >
            {title}
          </h2>

          <p className="mt-5 text-base leading-relaxed text-ink sm:text-lg">
            {body}
          </p>

          {/* 강조 항목(주황 포인트 마커) */}
          <ul className="mt-7 flex flex-col gap-3">
            {highlights.map((h, i) => (
              <li key={i} className="flex items-start gap-3">
                <span
                  aria-hidden
                  className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-accent"
                />
                <span className="text-base font-semibold text-ink sm:text-lg">
                  {h.text}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
