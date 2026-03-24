-- ============================================
-- Supabase 데이터베이스 테이블 설정 SQL
-- ============================================
-- 이 파일을 Supabase Dashboard > SQL Editor에서 실행하세요
-- ============================================

-- 1. 경품(상품) 테이블
CREATE TABLE prizes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  message TEXT NOT NULL,
  sector INTEGER NOT NULL CHECK (sector BETWEEN 1 AND 6),
  weight DECIMAL(5, 2) NOT NULL DEFAULT 0 CHECK (weight >= 0),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 경품 테이블 인덱스
CREATE INDEX idx_prizes_active ON prizes(is_active);
CREATE INDEX idx_prizes_sector ON prizes(sector);

-- 2. 참가자(당첨자) 테이블
CREATE TABLE participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  first_result TEXT NOT NULL,
  second_result TEXT,
  is_winner BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 참가자 테이블 인덱스
CREATE INDEX idx_participants_phone ON participants(phone);
CREATE INDEX idx_participants_created_at ON participants(created_at DESC);
CREATE INDEX idx_participants_is_winner ON participants(is_winner);

-- 3. 관리자 계정 테이블
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 파일 메타데이터 테이블 (Storage 파일 관리용)
CREATE TABLE file_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  bucket_name TEXT NOT NULL,
  description TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 파일 메타데이터 인덱스
CREATE INDEX idx_file_metadata_bucket ON file_metadata(bucket_name);
CREATE INDEX idx_file_metadata_type ON file_metadata(file_type);

-- ============================================
-- 초기 데이터 삽입
-- ============================================

-- 경품 초기 데이터 (현재 설정된 4가지 상품, 각 25% 확률)
INSERT INTO prizes (name, message, sector, weight) VALUES
  ('아메리카노', '아메리카노 쿠폰을 받으셨습니다!', 1, 12.5),
  ('간식', '간식 쿠폰을 받으셨습니다!', 2, 12.5),
  ('도어캠 6개월 무료', '도어캠 6개월 무료 이용권을 받으셨습니다!', 3, 25),
  ('아메리카노', '아메리카노 쿠폰을 받으셨습니다!', 4, 12.5),
  ('간식', '간식 쿠폰을 받으셨습니다!', 5, 12.5),
  ('설치비 무료', '설치비 무료 혜택을 받으셨습니다!', 6, 25);

-- ============================================
-- Row Level Security (RLS) 설정
-- ============================================

-- RLS 활성화
ALTER TABLE prizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_metadata ENABLE ROW LEVEL SECURITY;

-- 경품 테이블: 모든 사용자 읽기 가능, 관리자만 수정 가능
CREATE POLICY "Anyone can view active prizes" ON prizes
  FOR SELECT USING (is_active = true);

CREATE POLICY "Service role can manage prizes" ON prizes
  FOR ALL USING (auth.role() = 'service_role');

-- 참가자 테이블: Service role만 접근 가능
CREATE POLICY "Service role can manage participants" ON participants
  FOR ALL USING (auth.role() = 'service_role');

-- 관리자 테이블: Service role만 접근 가능
CREATE POLICY "Service role can manage admin users" ON admin_users
  FOR ALL USING (auth.role() = 'service_role');

-- 파일 메타데이터: Service role만 접근 가능
CREATE POLICY "Service role can manage file metadata" ON file_metadata
  FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- 트리거: updated_at 자동 업데이트
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_prizes_updated_at
  BEFORE UPDATE ON prizes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 완료!
-- ============================================
-- 다음 단계: Storage 버킷 생성
-- 1. Supabase Dashboard > Storage 메뉴 이동
-- 2. "New bucket" 클릭
-- 3. 버킷 이름: "roulette-assets"
-- 4. Public bucket 체크 (이미지 공개 접근용)
-- 5. 생성 완료
-- ============================================
