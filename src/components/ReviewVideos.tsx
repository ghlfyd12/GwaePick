import { reviewVideos } from "@/data/reviewVideos";

/*
 * ReviewVideos(영상으로 만나는 후기) — 후기·성장 스토리 섹션 안에 들어가는 영상 블록.
 *
 * 레이아웃: 모바일 1열 → 태블릿·데스크톱 2열. 각 영상은 반응형 16:9(aspect-video).
 * 개인정보 보호 위해 youtube-nocookie 임베드 + ?rel=0, 자동재생 없음. iframe lazy + title(접근성).
 * 영상 데이터는 reviewVideos.ts 에서만 가져온다(하드코딩 금지).
 */
export default function ReviewVideos() {
  return (
    <div className="mx-auto mt-10 max-w-5xl sm:mt-12">
      {/* 블록 헤더 */}
      <div className="text-center">
        <h3 className="text-lg font-bold text-ink sm:text-xl">
          영상으로 만나는 후기
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted sm:text-base">
          직접 수업을 경험한 학생과 학부모의 이야기입니다.
        </p>
      </div>

      {/* 영상 그리드 — 모바일 1열 / 태블릿·데스크톱 2열 */}
      <ul className="mt-6 grid grid-cols-1 gap-5 sm:mt-8 md:grid-cols-2 md:gap-6">
        {reviewVideos.map((v) => (
          <li key={v.id}>
            {/* 반응형 16:9 컨테이너 — 화면 너비에 맞춰 깨지지 않게 */}
            <div className="relative aspect-video w-full overflow-hidden rounded-2xl shadow-md ring-1 ring-line">
              <iframe
                className="absolute inset-0 h-full w-full"
                src={`https://www.youtube-nocookie.com/embed/${v.youtubeId}?rel=0`}
                title={v.caption}
                loading="lazy"
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
            {/* 캡션 — 회색 톤 한 줄 */}
            <p className="mt-2 text-center text-sm text-muted">{v.caption}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
