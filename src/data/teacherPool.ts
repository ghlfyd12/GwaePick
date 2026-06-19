/**
 * 소속 선생님 풀(실제 44명) 데이터 단일 소스.
 *
 * ⚠️ 파일명 주의: 기존 carousel 데이터(src/data/teachers.ts)와 충돌하지 않도록 teacherPool.ts 로 둔다.
 * 컴포넌트(TeacherPool.tsx)는 이 파일에서 import 만 한다(하드코딩 금지).
 * 이름은 개인정보 보호용 마스킹 표기다. 사진은 public/teachers/teacher-XX.png.
 */

export type Subject = "국어" | "영어" | "수학" | "사회" | "과학" | "코딩";

export interface Teacher {
  id: string;
  name: string; // 마스킹 표기 + 선생님
  subject: Subject;
  intro: string; // 한 줄 소개
  image: string; // /teachers/teacher-XX.png
}

export const teachers: Teacher[] = [
  { id: "t01", name: "유O은 선생님", subject: "국어", intro: "공부 습관부터 잡아주는 국어, 개인과외 10년", image: "/teachers/teacher-01.png" },
  { id: "t02", name: "김O진 선생님", subject: "국어", intro: "국어국문 전공, 전교 380등→50등을 이끈 국어", image: "/teachers/teacher-02.png" },
  { id: "t03", name: "송O비 선생님", subject: "국어", intro: "국어교육 전공·2급 정교사, 입시·과외 10년", image: "/teachers/teacher-03.png" },
  { id: "t04", name: "윤O주 선생님", subject: "국어", intro: "목동 국어 전문, 친근하지만 꼼꼼한 지도 10년+", image: "/teachers/teacher-04.png" },
  { id: "t05", name: "박O호 선생님", subject: "국어", intro: "20년 현장 경력, 눈높이로 풀어주는 국어 코칭", image: "/teachers/teacher-05.png" },
  { id: "t06", name: "김O준 선생님", subject: "국어", intro: "글쓰기 강의 다수, 표현력을 키우는 국어", image: "/teachers/teacher-06.png" },
  { id: "t07", name: "최O윤 선생님", subject: "국어", intro: "국어·논술 12년, 1등급 향상 사례 다수", image: "/teachers/teacher-07.png" },
  { id: "t08", name: "권O혁 선생님", subject: "과학", intro: "통합과학·물·화·생·지, 자료 풍부한 과학", image: "/teachers/teacher-08.png" },
  { id: "t09", name: "이O경 선생님", subject: "국어", intro: "국어국문 전공, 학원·과외 10년", image: "/teachers/teacher-09.png" },
  { id: "t10", name: "나O랑 선생님", subject: "국어", intro: "아이 마음을 먼저 살피는 든든한 국어", image: "/teachers/teacher-10.png" },
  { id: "t11", name: "이O원 선생님", subject: "과학", intro: "과학·코딩까지, 기초 원리부터 심화 단계로", image: "/teachers/teacher-11.png" },
  { id: "t12", name: "안O진 선생님", subject: "영어", intro: "TESOL 영어교사 자격, 자신감을 키우는 영어", image: "/teachers/teacher-12.png" },
  { id: "t13", name: "강O희 선생님", subject: "영어", intro: "활용 능력과 자신감을 함께 키우는 영어", image: "/teachers/teacher-13.png" },
  { id: "t14", name: "최O렬 선생님", subject: "과학", intro: "스스로 생각·질문·토론하는 재미있는 과학", image: "/teachers/teacher-14.png" },
  { id: "t15", name: "노O숙 선생님", subject: "과학", intro: "물리 전공, 단원별 점검이 꼼꼼한 과학", image: "/teachers/teacher-15.png" },
  { id: "t16", name: "오O아 선생님", subject: "영어", intro: "영어학 전공 10년+, 개념을 꼼꼼히 챙기는 수업", image: "/teachers/teacher-16.png" },
  { id: "t17", name: "조O준 선생님", subject: "과학", intro: "물2·화2까지, 과목별 연계를 짚어주는 과학", image: "/teachers/teacher-17.png" },
  { id: "t18", name: "김O미 선생님", subject: "영어", intro: "단계적 코칭으로 핵심을 잡는 영어, 입시 10년+", image: "/teachers/teacher-18.png" },
  { id: "t19", name: "전O민 선생님", subject: "과학", intro: "물리 석사, 질문을 주저하지 않게 하는 과학", image: "/teachers/teacher-19.png" },
  { id: "t20", name: "김O은 선생님", subject: "영어", intro: "약점 맞춤 분석 후 계획을 세우는 영어", image: "/teachers/teacher-20.png" },
  { id: "t21", name: "김O관 선생님", subject: "사회", intro: "사탐 전문, 몰입감 높은 사회·한국사 10년+", image: "/teachers/teacher-21.png" },
  { id: "t22", name: "심O화 선생님", subject: "코딩", intro: "블록코딩부터 웹까지, SSAFY 수료 코딩", image: "/teachers/teacher-22.png" },
  { id: "t23", name: "김O훈 선생님", subject: "사회", intro: "국어·사탐·한국사 12년, 시청각 자료로 생동감 있게", image: "/teachers/teacher-23.png" },
  { id: "t24", name: "강O정 선생님", subject: "영어", intro: "친절하고 긍정적인 분위기의 영어, 중국어도 가능", image: "/teachers/teacher-24.png" },
  { id: "t25", name: "김O운 선생님", subject: "사회", intro: "역사·사회·윤리를 원리로 엮는 통합 사회", image: "/teachers/teacher-25.png" },
  { id: "t26", name: "허O라 선생님", subject: "영어", intro: "언어학 석사, 독해·심화영어 멘토형 코치", image: "/teachers/teacher-26.png" },
  { id: "t27", name: "조O영 선생님", subject: "영어", intro: "어원 중심 단어 학습으로 암기 지속력 강화", image: "/teachers/teacher-27.png" },
  { id: "t28", name: "이O우 선생님", subject: "수학", intro: "서울대 공학 출신, 20년 노하우의 편안한 수학", image: "/teachers/teacher-28.png" },
  { id: "t29", name: "박O 선생님", subject: "수학", intro: "중·고 수학 과외 5년, 자기주도 학습력을 키우는 수학", image: "/teachers/teacher-29.png" },
  { id: "t30", name: "이O준 선생님", subject: "수학", intro: "교직 정교사 자격, 과외·학원 15년+ 수학", image: "/teachers/teacher-30.png" },
  { id: "t31", name: "이O진 선생님", subject: "영어", intro: "TESOL, 5→2등급·3→1등급 향상 사례 다수", image: "/teachers/teacher-31.png" },
  { id: "t32", name: "김O아 선생님", subject: "사회", intro: "표·지도·신문 스크랩으로 살아있는 사회", image: "/teachers/teacher-32.png" },
  { id: "t33", name: "장O현 선생님", subject: "사회", intro: "개념부터 서술형까지, 스스로 생각하게 하는 수업", image: "/teachers/teacher-33.png" },
  { id: "t34", name: "나O지 선생님", subject: "국어", intro: "문학·비문학 집중 관리, 5→1등급 향상 사례", image: "/teachers/teacher-34.png" },
  { id: "t35", name: "허O호 선생님", subject: "수학", intro: "수학 거부감을 흥미로 바꾸는 수학 이야기꾼, 12년", image: "/teachers/teacher-35.png" },
  { id: "t36", name: "양O름 선생님", subject: "과학", intro: "생명공학 전공, 쾌활하고 정확한 과학", image: "/teachers/teacher-36.png" },
  { id: "t37", name: "이O원 선생님", subject: "수학", intro: "수학·영어 이중전공, 순수전공의 탄탄한 수학", image: "/teachers/teacher-37.png" },
  { id: "t38", name: "노O성 선생님", subject: "수학", intro: "기초 개념부터 흥미를 붙여주는 수학", image: "/teachers/teacher-38.png" },
  { id: "t39", name: "권O형 선생님", subject: "과학", intro: "세심하고 차분한 코칭, 편안한 분위기의 과학", image: "/teachers/teacher-39.png" },
  { id: "t40", name: "이O현 선생님", subject: "수학", intro: "에너지 넘치는 즐거운 수업, 개인과외 10년", image: "/teachers/teacher-40.png" },
  { id: "t41", name: "홍O현 선생님", subject: "수학", intro: "수학 수업 경력 10년+", image: "/teachers/teacher-41.png" },
  { id: "t42", name: "유O린 선생님", subject: "수학", intro: "학교 선생님 출신, 수학교육 대학원 졸업", image: "/teachers/teacher-42.png" },
  { id: "t43", name: "박O화 선생님", subject: "수학", intro: "15년 노하우로 수준과 필요를 빠르게 파악하는 수학", image: "/teachers/teacher-43.png" },
  { id: "t44", name: "박O현 선생님", subject: "수학", intro: "수능 수리 1등급, 하위권~상위권 맞춤 수학", image: "/teachers/teacher-44.png" },
];
