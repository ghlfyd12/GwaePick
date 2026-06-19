/**
 * 후기 영상 데이터 단일 소스.
 *
 * 컴포넌트(ReviewVideos.tsx)에 youtubeId 를 하드코딩하지 않는다.
 * caption 은 임시값 — 실제 영상 제목/설명으로 이 파일에서만 교체한다.
 */
export interface ReviewVideo {
  id: string;
  youtubeId: string;
  caption: string;
}

export const reviewVideos: ReviewVideo[] = [
  { id: "rv1", youtubeId: "hPBklp2HalA", caption: "수업 후기 영상" },
  { id: "rv2", youtubeId: "GXCWEab4GyY", caption: "학생 성장 스토리" },
];
