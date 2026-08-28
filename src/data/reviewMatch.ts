/**
 * 후기(reviewItems) ↔ 학교·과목·지역 상세 페이지 매칭(신규, additive).
 *
 * reviewItems.ts 는 수정하지 않는다. 상세 페이지가 이 모듈로 매칭 후기를 뽑아
 * ReviewSection 으로 본문 전문을 렌더한다(검색 매칭 목적 — 텍스트가 SSR/SSG HTML 에 실려야 함).
 * 합격 캐러셀(reviewCards)·DetailTrustBlock 과는 별개(병행).
 *
 * 매칭 규칙(게이트 1 확정):
 *  - 학교: review.region === school.name(약칭 직접 — schools.ts name 이 약칭).
 *  - 학교×과목: 위 + subject 일치.
 *  - 과목: review.subject === subject.label(한글).
 *  - 지역: 큐레이션 해석 맵(REGION_TO_AREA) — review.region 을 시군구(cityQuery)+province 로 해석해
 *    landing 과 대조. 생활권(mainDistricts) landing 은 cityQuery(소속 시군구)로 상속. 학교 후기는
 *    소재 시군구 landing 에도 노출("해당 지역 소재 학교 후기").
 */
import { reviewItems, type ReviewItem } from "@/data/reviewItems";

/**
 * 리뷰 region → 소재 시군구(regions.ts cityQuery 표기) + province(짧은 표기).
 * 19개(지역 15 + 학교 4). 동은 소속 시군구로, 모호값(서구=대전, 대전시=대전 대표 서구)은 명시 해석.
 */
const REGION_TO_AREA: Record<string, { cityQuery: string; province: string }> = {
  // 서울 노원구(동 포함)
  노원구: { cityQuery: "노원구", province: "서울" },
  하계동: { cityQuery: "노원구", province: "서울" },
  중계동: { cityQuery: "노원구", province: "서울" },
  공릉동: { cityQuery: "노원구", province: "서울" },
  상계동: { cityQuery: "노원구", province: "서울" },
  // 대전 서구·유성구(동·시 포함, 모호값 명시 해석)
  서구: { cityQuery: "서구", province: "대전" },
  도안동: { cityQuery: "서구", province: "대전" },
  둔산동: { cityQuery: "서구", province: "대전" },
  대전시: { cityQuery: "서구", province: "대전" }, // 광역시 → 대전 대표(서구)로 집약
  유성구: { cityQuery: "유성구", province: "대전" },
  // 제주 제주시·서귀포시(동 포함) — regions.ts 미포함, 생활권 landing 으로만 노출
  제주시: { cityQuery: "제주시", province: "제주" },
  아라동: { cityQuery: "제주시", province: "제주" },
  연동: { cityQuery: "제주시", province: "제주" },
  노형동: { cityQuery: "제주시", province: "제주" },
  서귀포시: { cityQuery: "서귀포시", province: "제주" },
  // 학교(소재 시군구) — 해당 지역 landing 에도 후기 노출
  유성고: { cityQuery: "유성구", province: "대전" },
  발곡고: { cityQuery: "의정부시", province: "경기" },
  풍생고: { cityQuery: "성남시 분당구", province: "경기" },
  고양외고: { cityQuery: "고양시 일산동구", province: "경기" },
};

/** 날짜 있는 후기 우선(최신순), 없는 후기는 배열 순서 유지. */
const byRecency = (a: ReviewItem, b: ReviewItem) => (b.date ?? "").localeCompare(a.date ?? "");
const pick = (arr: ReviewItem[], limit: number) => arr.slice().sort(byRecency).slice(0, limit);

/** 학교 상세: region 이 해당 학교(약칭)와 일치. */
export function reviewsForSchool(schoolName: string, limit = 3): ReviewItem[] {
  return pick(reviewItems.filter((r) => r.region === schoolName), limit);
}

/** 학교×과목 상세: region=학교 + subject 일치. */
export function reviewsForSchoolSubject(
  schoolName: string,
  subjectLabel: string,
  limit = 3,
): ReviewItem[] {
  return pick(
    reviewItems.filter((r) => r.region === schoolName && r.subject === subjectLabel),
    limit,
  );
}

/** 과목 상세: subject 일치(한글 label). */
export function reviewsForSubject(subjectLabel: string, limit = 3): ReviewItem[] {
  return pick(reviewItems.filter((r) => r.subject === subjectLabel), limit);
}

/**
 * 지역 상세: landing 의 시군구(cityQuery)+province 로 매칭.
 * review.region 을 REGION_TO_AREA 로 해석해 대조(동·모호값·학교 소재 포함).
 * 생활권 landing 은 cityQuery=소속 시군구라 자동 상속.
 */
export function reviewsForRegion(cityQuery: string, province: string, limit = 3): ReviewItem[] {
  return pick(
    reviewItems.filter((r) => {
      const a = REGION_TO_AREA[r.region];
      return a !== undefined && a.cityQuery === cityQuery && a.province === province;
    }),
    limit,
  );
}
