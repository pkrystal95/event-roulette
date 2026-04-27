-- participants 테이블 name, phone 컬럼 nullable 변경
-- (개인정보 수집 제거로 인해 spin 시점에 바로 저장, 이름/번호 불필요)
ALTER TABLE participants ALTER COLUMN name DROP NOT NULL;
ALTER TABLE participants ALTER COLUMN phone DROP NOT NULL;
