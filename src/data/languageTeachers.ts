/**
 * 어학의참견(/power) 교사진 데이터 — 메인 teachers.ts 와 별개(어학 전용).
 *
 * 언어(영어/중국어/일본어) × 유형(원어민/한국인)으로 그룹핑해 렌더한다.
 * 데이터가 있는 그룹만 페이지에 노출되며, 언어/유형을 추가하면 자동으로 섹션이 늘어난다.
 * 원어민 소개글은 영어 원문 유지(한글 항목명 + 영어 값). 없는 정보는 지어내지 않고 생략한다.
 *
 * 사진: 김아가 public/teachers/english-native/ 에 업로드(현재 1~14.png, 프로필 순서와 동일).
 *   photo 값은 그 경로를 그대로 참조한다.
 */

export type LanguageTeacher = {
  id: string;
  name: string;
  language: "english" | "chinese" | "japanese";
  type: "native" | "korean";
  photo: string;
  lessonModes: ("전화" | "화상")[];
  motto?: string;
  education?: string;
  strength?: string;
  experience?: string;
};

/** 그룹 헤더 라벨용 — 언어/유형 한글 표기. */
export const LANGUAGE_LABEL: Record<LanguageTeacher["language"], string> = {
  english: "영어",
  chinese: "중국어",
  japanese: "일본어",
};
export const TYPE_LABEL: Record<LanguageTeacher["type"], string> = {
  native: "원어민",
  korean: "한국인",
};

/** 그룹 렌더 순서(데이터 있는 그룹만 노출). 언어/유형 추가 시 여기 순서만 관리. */
export const TEACHER_GROUP_ORDER: {
  language: LanguageTeacher["language"];
  type: LanguageTeacher["type"];
}[] = [
  { language: "english", type: "native" },
  { language: "english", type: "korean" },
  { language: "chinese", type: "native" },
  { language: "chinese", type: "korean" },
  { language: "japanese", type: "native" },
  { language: "japanese", type: "korean" },
];

const EN_NATIVE = "/teachers/english-native";

export const languageTeachers: LanguageTeacher[] = [
  {
    id: "angela-quinn",
    name: "Angela Quinn",
    language: "english",
    type: "native",
    photo: `${EN_NATIVE}/1.png`,
    lessonModes: ["전화", "화상"],
    motto: "Serving others",
    education:
      "Chesapeake College — Liberal Arts & Sciences, Early Childhood Development",
    strength: "Good with young children; Vocabulary / Reading / Writing",
    experience: "Homeschooling; teaches Sign Language, Art, Outdoors",
  },
  {
    id: "bertha-gonzalez",
    name: "Bertha Gonzalez",
    language: "english",
    type: "native",
    photo: `${EN_NATIVE}/2.png`,
    lessonModes: ["전화", "화상"],
    motto: "Believe you can and you're halfway there",
    education: "Pace University, New York — BBA, Accounting & Taxation",
    strength: "Organization, Leadership, Patience, Communication, Listening",
    experience: "Remote tutoring",
  },
  {
    id: "brittany-blanks",
    name: "Brittany Blanks",
    language: "english",
    type: "native",
    photo: `${EN_NATIVE}/3.png`,
    lessonModes: ["전화", "화상"],
    motto: "Never stop learning, because the world never stops teaching",
    education: "Western Governors University — Elementary Education",
    strength: "Good with children, Speaking, Reading",
    experience:
      "2 years teaching in Japan; 1.5 years at Kumon Learning Center (Las Vegas); 1 year at a preschool in Utah",
  },
  {
    id: "cindy-lowe",
    name: "Cindy Lowe",
    language: "english",
    type: "native",
    photo: `${EN_NATIVE}/4.png`,
    lessonModes: ["전화"],
    motto: "Life begins with adventure",
    education: "Chesapeake College — Computer Science",
    strength: "Topic discussion, Debating, Nature",
    experience: "Martial arts instructor; horse training",
  },
  {
    id: "eliza-johnson",
    name: "Eliza Johnson",
    language: "english",
    type: "native",
    photo: `${EN_NATIVE}/5.png`,
    lessonModes: ["전화", "화상"],
    motto:
      '"Anyone who has never made a mistake has never tried anything new." — Albert Einstein',
    education: "Bachelor's, Arizona State University — concentrating in Education",
    strength: "Patience, Flexibility, Creativity",
    experience:
      "4 years as an online ESL teacher; 10 years working in schools and with individual families",
  },
  {
    id: "holly-ibach",
    name: "Holly Ibach",
    language: "english",
    type: "native",
    photo: `${EN_NATIVE}/6.png`,
    lessonModes: ["전화", "화상"],
    motto: "Learning is a journey, not a destination",
    education: "Theater & Communications, AADA (New York City)",
    strength: "Writing, Word accuracy, Pronunciation, Motivator",
    experience:
      "Business (head hunter), writing/editing, theater, public speaking; teaching childhood development; volunteer work",
  },
  {
    id: "holly-torkos",
    name: "Holly Torkos",
    language: "english",
    type: "native",
    photo: `${EN_NATIVE}/7.png`,
    lessonModes: ["전화", "화상"],
    motto: "I will take you on a journey",
    education: "Delaware Tech — Therapy",
    strength: "Strong customer-service background",
    experience: "Food & beverage supervisor; medical clinic department manager",
  },
  {
    id: "ike-brandschain",
    name: "Ike Brandschain",
    language: "english",
    type: "native",
    photo: `${EN_NATIVE}/8.png`,
    lessonModes: ["전화", "화상"],
    motto: "Ancora imparo — still learning, never stop learning",
    education:
      "University of Colorado (Art History / German); University of South Florida (Second Language Acquisition / Applied Linguistics); University of Pennsylvania (Bioethics, graduate work)",
    strength: "Grammar, Variety of topics, Encouraging, Patient, Diligent, Kind",
    experience: "Language research; 30 years of teaching; TOEFL",
  },
  {
    id: "katrina-biter",
    name: "Katrina Biter",
    language: "english",
    type: "native",
    photo: `${EN_NATIVE}/9.png`,
    lessonModes: ["전화"],
    motto: "Have fun and learn",
    education: "George Washington University",
    strength: "Adapting to all types of students through friendly conversation",
    experience: "8 years with EDUCO USA",
  },
  {
    id: "kristina-bronwen",
    name: "Kristina Bronwen",
    language: "english",
    type: "native",
    photo: `${EN_NATIVE}/10.png`,
    lessonModes: ["전화", "화상"],
    motto: "Work will win when wishing won't",
    education: "University of Delaware",
    strength: "Listening, Creativity, Vocabulary, Current events",
    experience: "Coaching / Project management / Tutoring",
  },
  {
    id: "michelle-donnatien",
    name: "Michelle Donnatien",
    language: "english",
    type: "native",
    photo: `${EN_NATIVE}/11.png`,
    lessonModes: ["전화", "화상"],
    motto: "Positively impact the life of every person you meet",
    education:
      "Delaware Technical & Community College (English/Journalism, Business Management); University of Arizona (pursuing TESOL certificate)",
    strength:
      "Teaching — Writing, Reading, Vocabulary, Pronunciation, Speaking, Listening, Comprehension; Personal — Warm, Passionate, Energetic, Driven",
    experience:
      "Tutoring; teaching groups; professional / business / academic mentoring; educational program development; business development; author",
  },
  {
    id: "tiffani-donnatien",
    name: "Tiffani Donnatien",
    language: "english",
    type: "native",
    photo: `${EN_NATIVE}/12.png`,
    lessonModes: ["전화", "화상"],
    motto: '"I understand YOU" — literally',
    education: "Delaware Tech / Wilmington University — Elementary Education",
    strength: "K-12 all grades; English, Math, History, Korean, Spanish",
    experience:
      "ESL instructor; Pre-K to 12th grade teacher; volunteer / community work",
  },
  {
    id: "tiffany-quinlan",
    name: "Tiffany Quinlan",
    language: "english",
    type: "native",
    photo: `${EN_NATIVE}/13.png`,
    lessonModes: ["전화", "화상"],
    motto: "Only those who try will become",
    education:
      "Bachelor's, Eastern Kentucky University — Art and Japanese Studies; TESOL",
    strength: "Patient, Creative, Compassionate",
    experience:
      "2 years as an online ESL teacher; 4 years of education experience, online and in person",
  },
  {
    id: "carol-peregrine",
    name: "Carol Peregrine",
    language: "english",
    type: "native",
    photo: `${EN_NATIVE}/14.png`,
    lessonModes: ["전화", "화상"],
    motto: "Learning together",
    strength: "Patient, Adaptable, Dependable",
    experience: "Taekwondo instructor",
  },
];
