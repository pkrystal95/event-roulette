-- participants 테이블에 pin_number 컬럼 추가
ALTER TABLE participants
ADD COLUMN pin_number VARCHAR(20);

-- 기존 데이터에 대한 인덱스 추가 (선택사항)
CREATE INDEX idx_participants_pin_number ON participants(pin_number);
