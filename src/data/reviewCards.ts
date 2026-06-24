/**
 * 합격·성장 후기 카드 데이터 단일 소스(하드코딩 금지).
 * 사진은 public/images/reviews/ 에 사용자가 추가. 파일이 없어도 카드는 깨지지 않는다(영역 비움).
 * 타 브랜드명은 우리 서비스 맥락/일반 표현으로 치환해 사용.
 * badgeColor 는 우리 팔레트(코랄/차콜)만 — 보라·원색 남발 금지.
 */
export interface ReviewCard {
  /** 학교명 */
  school: string;
  /** 카드 제목(굵게) */
  title: string;
  /** 후기 한 줄 */
  quote: string;
  /** 회원 표기(마스킹 그대로) */
  member: string;
  /** 인물 사진 경로 — 없으면 영역 비움 */
  photo: string;
  /** 합격 뱃지 배경색(우리 팔레트). 미지정 시 기본 코랄. */
  badgeColor?: string;
  /** 영상 후기 URL — 있을 때만 재생 버튼 노출(기본 없음). */
  videoUrl?: string;
}

// 우리 팔레트 로테이션(코랄/짙은 코랄/차콜) — 보라 미사용.
const CORAL = "#ff6b4a";
const CORAL_DARK = "#f4502b";
const CHARCOAL = "#2b2b2e";

export const reviewCards: ReviewCard[] = [
  { school: "서울대학교", title: "서울대학교 합격", quote: "학생부 종합 전형도 맞춤 상담과 함께 준비했어요.", member: "이*연 회원", photo: "/images/reviews/seoul.png", badgeColor: CORAL },
  { school: "포항공과대학교", title: "포항공과대학교 합격", quote: "공부 방법부터 진로 탐색까지 함께 설계했습니다.", member: "인*상 회원", photo: "/images/reviews/postech.png", badgeColor: CHARCOAL },
  { school: "한양대학교", title: "한양대학교 합격", quote: "국어 6등급에서 1등급 찍고 목표 대학 합격.", member: "장*현 회원", photo: "/images/reviews/hanyang.png", badgeColor: CORAL_DARK },
  { school: "이화여대", title: "이화여대 합격", quote: "수업 한 학기 만에 1등급으로 성적 수직 상승.", member: "이*운 회원", photo: "/images/reviews/ewha.png", badgeColor: CORAL },
  { school: "경희대학교", title: "경희대학교 합격", quote: "학원·과외 선택이 어려웠던 지역에서 화상 수업으로 1등급 달성.", member: "김*윤 회원", photo: "/images/reviews/khu1.png", badgeColor: CHARCOAL },
  { school: "고려대학교", title: "고려대학교 합격", quote: "맞춤 수업 덕분에 수학을 포기하지 않고 성적을 올릴 수 있었어요.", member: "구*아 회원", photo: "/images/reviews/korea.png", badgeColor: CORAL_DARK },
  { school: "동국대학교 의대", title: "동국대학교 의대 합격", quote: "필요한 부분만 집중적으로 배우며 공부의 밀도를 높였습니다.", member: "임*규 회원", photo: "/images/reviews/dongguk.png", badgeColor: CORAL },
  { school: "경희대학교", title: "경희대학교 합격", quote: "내게 맞는 공부 방법으로 수학 5등급에서 1등급으로.", member: "전*빈 회원", photo: "/images/reviews/khu2.png", badgeColor: CHARCOAL },
  { school: "연세대학교", title: "연세대학교 합격", quote: "선생님 권유로 한 번 더 도전해서 목표 대학 합격.", member: "배*준 회원", photo: "/images/reviews/yonsei.png", badgeColor: CORAL_DARK },
  { school: "건국대학교", title: "건국대학교 합격", quote: "학교에선 어렵다고 했던 대학, 당당히 합격.", member: "엄*원 회원", photo: "/images/reviews/konkuk.png", badgeColor: CORAL },
];
