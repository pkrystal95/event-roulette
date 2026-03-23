import path from 'path';
import fs from 'fs';

// PIN 코드 캐시 (메모리에 저장)
let pinCodesCache: Set<string> | null = null;

// JSON 파일에서 PIN 코드 읽기
export function loadPinCodes(): Set<string> {
  // 캐시가 있으면 반환
  if (pinCodesCache) {
    return pinCodesCache;
  }

  try {
    // JSON 파일 경로
    const filePath = path.join(process.cwd(), 'data', 'pin_codes.json');

    // 파일 존재 확인
    if (!fs.existsSync(filePath)) {
      console.error('❌ PIN 코드 파일을 찾을 수 없습니다:', filePath);
      return new Set();
    }

    // JSON 파일 읽기
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const pinCodesArray: string[] = JSON.parse(fileContent);

    // Set으로 변환
    const pinCodes = new Set<string>(pinCodesArray);

    console.log(`✅ PIN 코드 ${pinCodes.size}개 로드 완료`);

    // 캐시에 저장
    pinCodesCache = pinCodes;

    return pinCodes;
  } catch (error) {
    console.error('❌ PIN 코드 파일 읽기 실패:', error);
    return new Set();
  }
}

// PIN 코드 검증
export function verifyPinCode(pin: string): boolean {
  const pinCodes = loadPinCodes();

  // PIN 코드 정규화 (대문자, 공백 제거)
  const normalizedPin = pin.trim().toUpperCase();

  // 형식 검증 (P + 6자리 숫자)
  if (!/^P\d{6}$/.test(normalizedPin)) {
    console.log('❌ PIN 형식 오류:', normalizedPin);
    return false;
  }

  // Excel 파일에 존재하는지 확인
  const isValid = pinCodes.has(normalizedPin);

  if (isValid) {
    console.log('✅ 유효한 PIN 코드:', normalizedPin);
  } else {
    console.log('❌ 존재하지 않는 PIN 코드:', normalizedPin);
  }

  return isValid;
}

// 캐시 초기화 (개발 시 또는 파일 업데이트 후 사용)
export function clearPinCodesCache(): void {
  pinCodesCache = null;
  console.log('🔄 PIN 코드 캐시 초기화 완료');
}
