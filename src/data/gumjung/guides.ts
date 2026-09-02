/**
 * 검고의참견 유형 가이드 7장 데이터 — 승인본.
 *
 * ⑤ 고입 준비 / ⑥ 국제학교 학생 / ⑦ 대입 전략은 게이트 1 승인 전문 그대로.
 * ① 빠른 대입 준비 / ② 예체능 병행 / ③ 학업 공백 / ④ 성인·만학도는 급별 상세 유형 섹션 확장.
 *
 * 절대 규칙: 특정 학교·전형·대학 언급 금지, 기간·성과 보장 금지, 자퇴·중퇴 부정 묘사 금지,
 * 심리 상담 표현 금지, 느낌표·컨설턴트/멘토/강사 금지. 입시 활용은 "전형에 따라 다르므로 상담 확인"까지만.
 * "빠른 대입 준비"↔"대입 전략"은 관점 분리 + 상호 내부링크로 중복 콘텐츠를 방지한다.
 */

export type GuideLink = { label: string; href: string };

export type GumjungGuide = {
  slug: string;
  /** 목록 정렬 순서. */
  order: number;
  /** 네비/목록 표기용 짧은 이름. */
  navLabel: string;
  eyebrow: string;
  h1: string;
  metaTitle: string;
  metaDescription: string;
  /** 도입 문단. */
  lead: string;
  /** 본문 섹션(제목 + 문단). */
  sections: { heading: string; body: string }[];
  /** 관련 페이지 링크(급별 상세·다른 가이드). */
  related: GuideLink[];
};

const SITE_NAME = "검고의참견";

export const GUMJUNG_GUIDES: GumjungGuide[] = [
  {
    slug: "fast-daeip",
    order: 1,
    navLabel: "빠른 대입 준비",
    eyebrow: "유형 가이드",
    h1: "필요한 과목에 집중해 대입 준비 시간을 확보합니다",
    metaTitle: "빠른 대입 준비 - 검정고시로 시간 확보 | 검고의참견",
    metaDescription:
      "대입을 앞당기려는 경우, 검정고시로 필요한 과목에 집중해 준비 시간을 확보합니다. 목표 시기와 남은 시간을 함께 보고 준비 순서를 정합니다.",
    lead: "대입을 앞당기려는 경우, 검정고시로 필요한 과목에 집중하면 학교 일정에 매이지 않고 준비 시간을 확보할 수 있습니다. 검정고시 합격 이후의 입시는 전형에 따라 다르므로 상담에서 확인이 필요합니다.",
    sections: [
      {
        heading: "시간을 확보하는 방식",
        body: "지금 목표 시기와 남은 시간을 함께 보고, 필요한 과목부터 준비 순서를 정합니다. 검정고시는 출제 범위가 정해져 있어, 우선순위를 정하면 시간을 아낄 수 있습니다.",
      },
      {
        heading: "관점 구분",
        body: "이 페이지는 시간 확보와 과목 집중 관점입니다. 검정고시 이후 입시 일정 설계가 더 필요하면 대입 전략 가이드를 함께 보세요.",
      },
    ],
    related: [
      { label: "대입 전략 가이드", href: "/gumjung/guide/daeip-strategy" },
      { label: "고졸 검정고시 안내", href: "/gumjung/gojol" },
    ],
  },
  {
    slug: "arts",
    order: 2,
    navLabel: "예체능·실기 병행",
    eyebrow: "유형 가이드",
    h1: "실기와 학습을 함께 가져가는 준비",
    metaTitle: "예체능·실기 병행 검정고시 준비 | 검고의참견",
    metaDescription:
      "실기 연습과 학습을 같이 해야 하는 경우, 실기 일정에 맞춰 학습 분량을 조절합니다. 검정고시는 출제 범위가 정해져 있어 핵심부터 준비할 수 있습니다.",
    lead: "실기 연습과 학습을 같이 해야 하는 경우, 실기 일정에 맞춰 학습 분량을 조절합니다. 검정고시는 출제 범위가 정해져 있어, 연습으로 시간이 부족해도 핵심부터 준비할 수 있습니다.",
    sections: [
      {
        heading: "실기 일정에 맞춘 계획",
        body: "상담에서 실기 일정과 목표 시기를 확인해 무리 없는 학습 계획을 함께 정합니다. 시험이 가까운 시기에는 분량을 조절해 실기와 학습을 함께 가져갑니다.",
      },
    ],
    related: [
      { label: "고졸 검정고시 안내", href: "/gumjung/gojol" },
      { label: "빠른 대입 준비 가이드", href: "/gumjung/guide/fast-daeip" },
    ],
  },
  {
    slug: "gap",
    order: 3,
    navLabel: "학업 공백이 긴 경우",
    eyebrow: "유형 가이드",
    h1: "기초부터 다시 시작해도 괜찮습니다",
    metaTitle: "학업 공백 후 검정고시 다시 시작 | 검고의참견",
    metaDescription:
      "학업을 오래 쉬었어도 검정고시는 출제 유형이 정해져 있어 핵심부터 단계적으로 준비할 수 있습니다. 지금 수준에서 작은 분량부터 시작합니다.",
    lead: "학업을 오래 쉬었어도 검정고시는 출제 유형이 정해져 있어 핵심부터 단계적으로 준비할 수 있습니다. 지금 수준을 확인하고 작은 분량부터 시작합니다.",
    sections: [
      {
        heading: "작은 분량부터",
        body: "할 수 있다는 경험을 먼저 만드는 것이 중요합니다. 지금 아는 부분부터 확인하며, 속도는 상황에 맞춰 조절합니다. 필요한 핵심부터 채워 갑니다.",
      },
    ],
    related: [
      { label: "중졸 검정고시 안내", href: "/gumjung/jungjol" },
      { label: "고졸 검정고시 안내", href: "/gumjung/gojol" },
    ],
  },
  {
    slug: "adult",
    order: 4,
    navLabel: "성인·만학도",
    eyebrow: "유형 가이드",
    h1: "일과 병행하는 일정에 맞춰 준비합니다",
    metaTitle: "성인·만학도 검정고시 준비 | 검고의참견",
    metaDescription:
      "일이나 가정과 병행해야 하는 경우, 수업 시간을 일정에 맞춰 조율합니다. 필요한 과목부터, 오래 쉬었던 과목도 지금 수준에서 시작합니다.",
    lead: "일이나 가정과 병행해야 하는 경우, 수업 시간을 일정에 맞춰 조율합니다. 오래 쉬었던 과목도 지금 수준에서 시작합니다.",
    sections: [
      {
        heading: "일정에 맞춘 수업",
        body: "전화·화상 수업으로 오가는 시간을 줄이고, 필요한 과목부터 준비합니다. 상담에서 가능한 시간대와 목표 시기를 확인해 계획을 함께 정합니다.",
      },
    ],
    related: [
      { label: "고졸 검정고시 안내", href: "/gumjung/gojol" },
      { label: "학업 공백 가이드", href: "/gumjung/guide/gap" },
    ],
  },
  {
    slug: "goip",
    order: 5,
    navLabel: "고입 준비",
    eyebrow: "유형 가이드",
    h1: "중졸 검정고시로 고등학교 진학 준비하기",
    metaTitle: "중졸 검정고시로 고등학교 진학 - 검정고시 고입 | 검고의참견",
    metaDescription:
      "중학교 과정을 학교 밖에서 마치고 고등학교 진학을 준비하는 경우를 위한 안내. 중졸 검정고시 합격은 고등학교 입학 자격이 됩니다.",
    lead: "중학교 과정을 학교 밖에서 마치고 고등학교 진학을 준비하는 경우를 위한 안내입니다. 중졸 검정고시 합격은 고등학교 입학 자격이 됩니다. 진학 방법과 일정은 학교 유형과 지역에 따라 다르므로, 상담에서 현재 상황과 목표 시기를 확인해 준비 방향을 함께 정합니다.",
    sections: [
      {
        heading: "준비 순서",
        body: "부족한 과목부터 채워 중졸 검정고시를 준비하고, 합격 이후 진학 일정을 함께 봅니다. 과목 합격제를 활용하면 회차를 나눠 준비할 수도 있습니다.",
      },
    ],
    related: [
      { label: "중졸 검정고시 안내", href: "/gumjung/jungjol" },
      { label: "대입 전략 가이드", href: "/gumjung/guide/daeip-strategy" },
    ],
  },
  {
    slug: "intl",
    order: 6,
    navLabel: "국제학교 학생",
    eyebrow: "유형 가이드",
    h1: "국제학교에 다니며 국내 학력이 필요한 경우",
    metaTitle: "국제학교 학생의 국내 학력, 검정고시 - 국제학교 검정고시 | 검고의참견",
    metaDescription:
      "비인가 국제학교·외국인학교 재학생이 국내 학력을 인정받는 경로 중 하나가 검정고시입니다. 필요한 자격과 준비는 상황에 따라 다르므로 상담에서 확인합니다.",
    lead: "비인가 국제학교나 외국인학교에 다니면 국내 학교 학력으로 자동 인정되지 않는 경우가 있습니다. 검정고시는 국내 학력을 인정받는 경로 중 하나입니다. 어떤 자격과 준비가 필요한지는 재학 형태와 목표에 따라 다르므로, 상담에서 현재 상황을 확인합니다.",
    sections: [
      {
        heading: "준비 방식",
        body: "한국어 기반 과목은 별도 준비가 필요할 수 있어, 지금 수준에 맞춰 1:1로 진행합니다. 상담에서 현재 재학 형태와 목표를 확인해 준비 방향을 정합니다.",
      },
    ],
    related: [
      { label: "고졸 검정고시 안내", href: "/gumjung/gojol" },
      { label: "지역별 검정고시", href: "/gumjung/regions" },
    ],
  },
  {
    slug: "daeip-strategy",
    order: 7,
    navLabel: "대입 전략",
    eyebrow: "유형 가이드",
    h1: "검정고시 이후 대입까지, 일정을 함께 설계합니다",
    metaTitle: "검정고시 이후 대입 전략 - 대입전략 검정고시(검고) | 검고의참견",
    metaDescription:
      "검정고시(검고) 이후 대입까지 일정을 함께 설계합니다. 검정고시 성적의 대입 활용은 전형에 따라 다르므로 상담에서 확인이 필요합니다.",
    lead: "검정고시(검고) 합격은 끝이 아니라 대입 준비의 시작점이 되기도 합니다. 검정고시 성적의 대입 활용 방식은 전형에 따라 다르므로 상담에서 확인이 필요합니다. 검정고시 일정과 이후 입시 일정을 함께 놓고 준비 순서를 정하면 시간을 효율적으로 쓸 수 있습니다.",
    sections: [
      {
        heading: "관점 구분",
        body: "시간 확보와 과목 집중이 먼저라면 빠른 대입 준비 가이드를, 검정고시 이후 입시 일정 설계가 필요하면 이 페이지를 참고하세요. 두 관점을 나눠 중복 없이 준비합니다.",
      },
    ],
    related: [
      { label: "빠른 대입 준비 가이드", href: "/gumjung/guide/fast-daeip" },
      { label: "고졸 검정고시 안내", href: "/gumjung/gojol" },
    ],
  },
];

const bySlug = new Map<string, GumjungGuide>(
  GUMJUNG_GUIDES.map((g) => [g.slug, g]),
);

export function getGumjungGuide(slug: string): GumjungGuide | null {
  return bySlug.get(slug) ?? null;
}

export function isGumjungGuideSlug(slug: string): boolean {
  return bySlug.has(slug);
}

export const GUMJUNG_GUIDE_SLUGS: string[] = GUMJUNG_GUIDES.map((g) => g.slug);
