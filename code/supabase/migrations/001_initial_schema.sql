-- ==========================================
-- NingNing 초기 DB 스키마
-- Supabase (PostgreSQL)
-- ==========================================

-- 사용자 프로필 확장 (Supabase Auth의 auth.users와 연동)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 사주 프로필 (입력 정보 + 계산 결과)
CREATE TABLE IF NOT EXISTS saju_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  session_id TEXT, -- 비회원 세션 식별자
  calendar_type TEXT NOT NULL CHECK (calendar_type IN ('solar', 'lunar')),
  is_leap_month BOOLEAN NOT NULL DEFAULT FALSE,
  birth_year INT NOT NULL CHECK (birth_year BETWEEN 1940 AND 2025),
  birth_month INT NOT NULL CHECK (birth_month BETWEEN 1 AND 12),
  birth_day INT NOT NULL CHECK (birth_day BETWEEN 1 AND 31),
  birth_time TEXT NOT NULL DEFAULT 'unknown', -- 12시진 이름 또는 'unknown'
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
  four_pillars JSONB, -- 계산된 사주 팔자
  five_elements JSONB, -- 오행 분석 결과
  day_master TEXT, -- 일간
  day_master_strength TEXT CHECK (day_master_strength IN ('strong', 'weak', 'balanced')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- 비회원은 session_id, 회원은 user_id 중 하나는 있어야 함
  CHECK (user_id IS NOT NULL OR session_id IS NOT NULL)
);

-- 결과 (오늘의 운세)
CREATE TABLE IF NOT EXISTS results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES saju_profiles(id) ON DELETE CASCADE,
  result_date DATE NOT NULL DEFAULT CURRENT_DATE,
  daily_summary TEXT, -- 한 줄 총평
  daily_keywords TEXT[], -- 오늘의 키워드
  love_reading JSONB, -- 연애 해석
  work_reading JSONB, -- 일/직장 해석
  money_reading JSONB, -- 재물 해석
  do_today TEXT, -- 오늘 하면 좋은 것
  avoid_today TEXT, -- 오늘 피하면 좋은 것
  lucky_hints TEXT[], -- 행운 단서
  background TEXT, -- 해석 배경 설명
  is_saved BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- 같은 프로필/날짜 조합은 한 번만
  UNIQUE(profile_id, result_date)
);

-- AI 추가질문
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  result_id UUID NOT NULL REFERENCES results(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  answer_text TEXT NOT NULL,
  question_order INT NOT NULL DEFAULT 1,
  is_paid BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 결제
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  session_id TEXT,
  product_type TEXT NOT NULL CHECK (product_type IN ('report', 'question_pack')),
  amount INT NOT NULL CHECK (amount > 0), -- 원 단위
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'refunded')),
  pg_payment_key TEXT, -- PG사 결제 키
  pg_order_id TEXT, -- PG사 주문 ID
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 심층 리포트
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  result_id UUID NOT NULL REFERENCES results(id) ON DELETE CASCADE,
  payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
  content JSONB NOT NULL, -- 리포트 전체 내용
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '1 year')
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_saju_profiles_user_id ON saju_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_saju_profiles_session_id ON saju_profiles(session_id);
CREATE INDEX IF NOT EXISTS idx_results_profile_id ON results(profile_id);
CREATE INDEX IF NOT EXISTS idx_results_date ON results(result_date);
CREATE INDEX IF NOT EXISTS idx_questions_result_id ON questions(result_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_session_id ON payments(session_id);
CREATE INDEX IF NOT EXISTS idx_reports_result_id ON reports(result_id);

-- RLS (Row Level Security) 활성화
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE saju_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 사용자는 자신의 데이터만 접근
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can read own profiles" ON saju_profiles
  FOR SELECT USING (auth.uid() = user_id OR session_id IS NOT NULL);

CREATE POLICY "Users can insert profiles" ON saju_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id OR session_id IS NOT NULL);

CREATE POLICY "Users can read own results" ON results
  FOR SELECT USING (
    profile_id IN (SELECT id FROM saju_profiles WHERE user_id = auth.uid() OR session_id IS NOT NULL)
  );

CREATE POLICY "Users can read own payments" ON payments
  FOR SELECT USING (auth.uid() = user_id OR session_id IS NOT NULL);

CREATE POLICY "Users can read own reports" ON reports
  FOR SELECT USING (
    result_id IN (
      SELECT r.id FROM results r
      JOIN saju_profiles sp ON r.profile_id = sp.id
      WHERE sp.user_id = auth.uid() OR sp.session_id IS NOT NULL
    )
  );

-- updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
