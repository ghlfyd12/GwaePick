-- ============================================================
-- 지식의참견 수요 추적 엔진 — Supabase 초기 세팅 SQL (v1.0)
-- 실행 위치: Supabase Dashboard > SQL Editor > New query > 전체 붙여넣기 > Run
-- 실행 순서가 중요하므로 파일 전체를 한 번에 실행할 것
-- ============================================================

-- ---------- 1. 마스터 테이블 ----------

CREATE TABLE IF NOT EXISTS schools (
  school_code   VARCHAR(20) PRIMARY KEY,
  school_name   VARCHAR(100) NOT NULL,
  school_level  VARCHAR(10)  NOT NULL,          -- 초/중/고
  sido_code     VARCHAR(10)  NOT NULL,
  sido_name     VARCHAR(30)  NOT NULL,
  sigungu_code  VARCHAR(10)  NOT NULL,
  sigungu_name  VARCHAR(30)  NOT NULL,
  updated_at    TIMESTAMPTZ  DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_schools_name ON schools (school_name);

CREATE TABLE IF NOT EXISTS subjects (
  subject_id    SERIAL PRIMARY KEY,
  subject_name  VARCHAR(30) NOT NULL UNIQUE,
  subject_group VARCHAR(20) NOT NULL,           -- 수학/영어/국어/과학/사탐/논술/기타
  is_remote_fit BOOLEAN DEFAULT false           -- 비대면 적합(사탐 전과목 true)
);

-- ---------- 2. 신청 데이터 ----------

CREATE TABLE IF NOT EXISTS inquiries (
  inquiry_id    BIGSERIAL PRIMARY KEY,
  created_at    TIMESTAMPTZ DEFAULT now(),
  -- 개인정보 (키워드 엔진 접근 금지 영역)
  student_name  VARCHAR(50)  NOT NULL,
  phone         VARCHAR(20)  NOT NULL,
  memo          TEXT,
  consent_at    TIMESTAMPTZ  NOT NULL,
  -- 분류 데이터 (집계 대상)
  sido_code     VARCHAR(10)  NOT NULL,
  sigungu_code  VARCHAR(10)  NOT NULL,
  school_code   VARCHAR(20)  REFERENCES schools(school_code),
  grade         VARCHAR(10)  NOT NULL,          -- 초1~고3/예비중1/예비고1/N수
  lesson_type   VARCHAR(10)  NOT NULL CHECK (lesson_type IN ('visit','remote','any')),
  status        VARCHAR(20)  DEFAULT 'new'      -- new/consulted/matched/closed
);
CREATE INDEX IF NOT EXISTS idx_inquiries_created ON inquiries (created_at);

CREATE TABLE IF NOT EXISTS inquiry_subjects (
  inquiry_id    BIGINT REFERENCES inquiries(inquiry_id) ON DELETE CASCADE,
  subject_id    INT REFERENCES subjects(subject_id),
  PRIMARY KEY (inquiry_id, subject_id)
);

-- 학년 다중 선택 — 각 학년을 독립 행으로 저장(과목 inquiry_subjects 와 대칭).
-- inquiries.grade 에는 대표(첫) 학년을 남기고, 전체 학년은 이 테이블에 둔다.
CREATE TABLE IF NOT EXISTS inquiry_grades (
  inquiry_id    BIGINT REFERENCES inquiries(inquiry_id) ON DELETE CASCADE,
  grade         VARCHAR(10) NOT NULL,          -- 초1~고3/예비중1/예비고1/성인
  PRIMARY KEY (inquiry_id, grade)
);

-- ---------- 3. 수요 집계 & 키워드 엔진 ----------

CREATE TABLE IF NOT EXISTS demand_agg (
  agg_id        BIGSERIAL PRIMARY KEY,
  calc_date     DATE NOT NULL,
  dim_type      VARCHAR(10) NOT NULL,           -- school / sigungu / subject
  dim_key       VARCHAR(30) NOT NULL,
  subject_id    INT REFERENCES subjects(subject_id),
  lesson_type   VARCHAR(10),
  cnt_30d       INT DEFAULT 0,
  cnt_60d       INT DEFAULT 0,
  cnt_90d       INT DEFAULT 0,
  demand_score  NUMERIC(6,2) NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_demand_agg_calc ON demand_agg (calc_date, dim_type);

CREATE TABLE IF NOT EXISTS keyword_queue (
  keyword_id    BIGSERIAL PRIMARY KEY,
  keyword_text  VARCHAR(100) NOT NULL UNIQUE,
  track         CHAR(1) NOT NULL CHECK (track IN ('A','B','C')),
  source        VARCHAR(20) NOT NULL,           -- auto_demand / manual_seed / seasonal
  demand_score  NUMERIC(6,2),
  tier          SMALLINT NOT NULL,
  status        VARCHAR(20) DEFAULT 'queued',   -- queued/drafted/published/skipped
  season_tag    VARCHAR(30),
  landing_url   VARCHAR(255),
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS published_posts (
  post_id       BIGSERIAL PRIMARY KEY,
  keyword_id    BIGINT REFERENCES keyword_queue(keyword_id),
  published_at  DATE NOT NULL,
  blog_url      VARCHAR(255),
  title         VARCHAR(200),
  notes         TEXT
);

-- ---------- 4. 과목 시드 데이터 (D축 표준) ----------

INSERT INTO subjects (subject_name, subject_group, is_remote_fit) VALUES
  ('수학',       '수학', false),
  ('영어',       '영어', false),
  ('국어',       '국어', false),
  ('물리학',     '과학', false),
  ('화학',       '과학', false),
  ('생명과학',   '과학', false),
  ('지구과학',   '과학', false),
  ('통합과학',   '과학', false),
  ('생활과윤리', '사탐', true),
  ('윤리와사상', '사탐', true),
  ('사회문화',   '사탐', true),
  ('정치와법',   '사탐', true),
  ('경제',       '사탐', true),
  ('한국지리',   '사탐', true),
  ('세계지리',   '사탐', true),
  ('한국사',     '사탐', true),
  ('세계사',     '사탐', true),
  ('동아시아사', '사탐', true),
  ('통합사회',   '사탐', true),
  ('논술',       '논술', true),
  ('전과목',     '기타', false),
  ('공부습관',   '기타', false)
ON CONFLICT (subject_name) DO NOTHING;

-- ---------- 5. RLS (Row Level Security) — 개인정보 보호 필수 ----------
-- 원칙: 브라우저(anon key)에서는 어떤 테이블도 직접 접근 불가.
--       모든 읽기/쓰기는 Next.js 서버(service role key)에서만 수행.
--       service role은 RLS를 우회하므로 별도 정책 불필요.
--       아래처럼 RLS만 켜고 정책을 만들지 않으면 anon 접근이 전부 차단됨.

ALTER TABLE schools          ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects         ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries        ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiry_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiry_grades   ENABLE ROW LEVEL SECURITY;
ALTER TABLE demand_agg       ENABLE ROW LEVEL SECURITY;
ALTER TABLE keyword_queue    ENABLE ROW LEVEL SECURITY;
ALTER TABLE published_posts  ENABLE ROW LEVEL SECURITY;

-- (선택) 학교 자동완성을 클라이언트에서 직접 조회하고 싶은 경우에만
-- 아래 주석을 해제 — schools/subjects는 공개 데이터라 읽기 허용 가능.
-- 단, 신청폼 제출(insert)은 반드시 서버 API 경유를 유지할 것.
-- CREATE POLICY schools_public_read  ON schools  FOR SELECT TO anon USING (true);
-- CREATE POLICY subjects_public_read ON subjects FOR SELECT TO anon USING (true);

-- ============================================================
-- 실행 후 확인 쿼리
-- SELECT count(*) FROM subjects;          -- 22가 나와야 정상
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname='public';
--                                          -- 모든 테이블 rowsecurity = true 확인
-- ============================================================
