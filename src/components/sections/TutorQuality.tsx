import SafeImage from "@/components/SafeImage";
import { TUTOR_QUALITY } from "@/data/detailCopy";

/*
 * TutorQuality — '선생님의 자질과 역량…' 신뢰 섹션 + 상담 이미지.
 * 강조어는 코랄(accent). 데스크톱 좌 텍스트·우 이미지, 모바일 텍스트 아래 이미지 스택.
 * 이미지 파일(public/images/tutor-consult.png)이 없으면 영역 비움(깨짐 방지).
 */
export default function TutorQuality() {
  const { titleBefore, titleHighlight, titleAfter, body, image } = TUTOR_QUALITY;
  return (
    <section className="bg-surface px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto grid max-w-5xl grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-12">
        {/* 텍스트 */}
        <div className="text-center md:text-left">
          <h2 className="break-keep text-2xl font-bold leading-snug text-ink sm:text-3xl">
            {titleBefore}
            <span className="text-accent">{titleHighlight}</span>
            {titleAfter}
          </h2>
          <p className="mx-auto mt-5 max-w-xl break-keep text-base leading-relaxed text-muted sm:text-lg md:mx-0">
            {body}
          </p>
        </div>

        {/* 상담 이미지 — 4:3, 파일 없으면 SafeImage 가 null → 연한 배경만 */}
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-surface-alt">
          <SafeImage
            src={image.src}
            alt={image.alt}
            sizes="(min-width: 768px) 45vw, 100vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}
