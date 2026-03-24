-- Settings 테이블 생성
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 기본 광고 URL 삽입
INSERT INTO settings (key, value)
VALUES ('ad_url', 'https://www.w3schools.com/html/mov_bbb.mp4')
ON CONFLICT (key) DO NOTHING;

-- RLS (Row Level Security) 활성화
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- 읽기 권한: 모든 사용자 (인증 불필요)
CREATE POLICY "Anyone can read settings"
ON settings FOR SELECT
USING (true);

-- 쓰기 권한: 서비스 롤만 (관리자 API에서 사용)
CREATE POLICY "Service role can insert settings"
ON settings FOR INSERT
WITH CHECK (true);

CREATE POLICY "Service role can update settings"
ON settings FOR UPDATE
USING (true);

CREATE POLICY "Service role can delete settings"
ON settings FOR DELETE
USING (true);

-- 업데이트 시간 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_settings_updated_at
BEFORE UPDATE ON settings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
