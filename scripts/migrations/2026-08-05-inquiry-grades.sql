-- ============================================================
-- 마이그레이션: inquiry_grades 테이블 신설 (학년 다중 선택 독립 저장)
-- 실행 위치: Supabase Dashboard > SQL Editor > New query > 전체 붙여넣기 > Run
-- 멱등(IF NOT EXISTS) — 여러 번 실행해도 안전하다.
-- ============================================================

CREATE TABLE IF NOT EXISTS inquiry_grades (
  inquiry_id  BIGINT REFERENCES inquiries(inquiry_id) ON DELETE CASCADE,
  grade       VARCHAR(10) NOT NULL,          -- 초1~고3/예비중1/예비고1/성인
  PRIMARY KEY (inquiry_id, grade)
);

-- RLS: anon 직접 접근 차단(정책 없음). service role(=서버 API)만 우회 접근한다.
ALTER TABLE inquiry_grades ENABLE ROW LEVEL SECURITY;

-- 확인:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'inquiry_grades';
--   → rowsecurity = true 여야 정상
