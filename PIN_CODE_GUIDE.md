# PIN 코드 시스템 가이드

## 📋 개요

이 프로젝트는 Excel 파일(`pin_code.xlsx`)에서 PIN 코드를 읽어 검증합니다.

## 🔐 PIN 코드 형식

- **형식**: `P` + 6자리 숫자
- **예시**: `P160817`, `P036089`, `P045113`
- **대소문자**: 자동으로 대문자로 변환 (p123456 → P123456)

## 📂 Excel 파일 구조

**위치**: `data/pin_code.xlsx` (원본 Excel 파일)
**JSON**: `data/pin_codes.json` (변환된 JSON 파일, Git에 포함)

**구조**:
```
| 매장 코드   |
|-----------|
| P160817   |
| P036089   |
| P045113   |
| ...       |
```

- 첫 번째 행: 헤더 (예: "매장 코드", "PIN", "CODE" 등)
- 나머지 행: PIN 코드 (P + 6자리 숫자)

## 💻 사용 방법

### 1. PIN 코드 파일 준비

1. Excel 파일 생성 (`pin_code.xlsx`)
2. 첫 번째 행에 헤더 입력 (예: "매장 코드")
3. PIN 코드 입력 (P160817, P036089, ...)
4. 파일을 `data/` 폴더에 저장
5. JSON으로 변환 (아래 스크립트 사용)

### 2. 사용자 입력

사용자는 다음과 같이 입력할 수 있습니다:

- **자동 포맷팅**: `123456` → `P123456`
- **대문자 변환**: `p123456` → `P123456`
- **직접 입력**: `P123456`

### 3. 검증 프로세스

1. 사용자가 PIN 입력
2. 서버가 Excel 파일에서 PIN 목록 로드 (첫 실행 시만)
3. 입력된 PIN이 목록에 있는지 확인
4. 유효하면 다음 단계로 진행

## 🔧 기술 구현

### Excel → JSON 변환

**스크립트** (`scripts/convert-pins.js`):
```javascript
const XLSX = require('xlsx');
const fs = require('fs');

const workbook = XLSX.readFile('data/pin_code.xlsx');
const worksheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(worksheet);

const pinCodes = data
  .map(row => row['매장 코드'])
  .filter(pin => pin && /^P\d{6}$/.test(String(pin).trim()))
  .map(pin => String(pin).trim().toUpperCase());

fs.writeFileSync(
  'data/pin_codes.json',
  JSON.stringify(pinCodes, null, 2)
);

console.log(`✅ ${pinCodes.length}개 PIN 코드를 JSON으로 변환 완료`);
```

**실행**:
```bash
node scripts/convert-pins.js
```

### 파일 읽기 (`lib/pinCodes.ts`)

```typescript
import pinCodesData from '@/data/pin_codes.json';

// JSON 파일에서 PIN 코드 로드
export function loadPinCodes(): Set<string> {
  return new Set<string>(pinCodesData);
}

// PIN 코드 검증
export function verifyPinCode(pin: string): boolean {
  const pinCodes = loadPinCodes();
  return pinCodes.has(pin.toUpperCase());
}
```

### API 엔드포인트 (`/api/verify-pin`)

```typescript
import { verifyPinCode } from '@/lib/pinCodes';

export async function POST(request: NextRequest) {
  const { pin } = await request.json();

  if (verifyPinCode(pin)) {
    return NextResponse.json({ success: true });
  } else {
    return NextResponse.json(
      { success: false, message: '올바르지 않은 PIN 코드입니다.' },
      { status: 401 }
    );
  }
}
```

### 프론트엔드 입력 (`components/PinInputSection.tsx`)

```typescript
const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  let value = e.target.value.toUpperCase();

  // P로 시작하지 않으면 P 추가
  if (value && !value.startsWith('P')) {
    value = 'P' + value;
  }

  // 숫자만 추출
  const numbers = value.slice(1).replace(/[^\d]/g, '');

  // P + 최대 6자리
  setPin('P' + numbers.slice(0, 6));
};
```

## 📊 성능 최적화

### 메모리 캐싱

PIN 코드는 첫 로드 시 메모리에 캐싱됩니다:

```typescript
let pinCodesCache: Set<string> | null = null;

export function loadPinCodes(): Set<string> {
  if (pinCodesCache) {
    return pinCodesCache; // 캐시에서 반환
  }

  // Excel 파일 읽기...
  pinCodesCache = pinCodes;
  return pinCodes;
}
```

### 캐시 초기화

PIN 코드 파일 업데이트 후:

```typescript
import { clearPinCodesCache } from '@/lib/pinCodes';

// 서버 재시작 또는 API 호출
clearPinCodesCache();
```

## 🧪 테스트

### 로컬 테스트

```bash
# 개발 서버 시작
npm run dev

# http://localhost:3000 접속
# PIN 입력 페이지에서 테스트:
# - P160817 (유효한 코드)
# - P000000 (존재하지 않는 코드)
```

### Excel 파일 확인

```bash
# PIN 코드 수 확인
node -e "
const XLSX = require('xlsx');
const wb = XLSX.readFile('public/assets/pin_code.xlsx');
const data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
console.log('총 PIN 코드 수:', data.length);
console.log('샘플:', data.slice(0, 5));
"
```

## 🚨 에러 처리

### "올바르지 않은 PIN 코드입니다"

**원인**:
- Excel 파일에 PIN이 없음
- PIN 형식이 잘못됨 (P + 6자리가 아님)
- 대소문자 문제 (자동 변환됨)

**해결**:
1. Excel 파일에서 PIN 확인
2. 형식이 `P` + 6자리 숫자인지 확인
3. 공백이나 특수문자 없는지 확인

### "서버 오류가 발생했습니다"

**원인**:
- Excel 파일이 없음
- 파일 경로 오류
- 파일 읽기 권한 문제

**해결**:
1. `public/assets/pin_code.xlsx` 파일 존재 확인
2. 파일 권한 확인
3. 서버 로그 확인

## 📝 PIN 코드 추가/수정

1. `data/pin_code.xlsx` 파일 열기
2. 새 행에 PIN 코드 추가 (P + 6자리 숫자)
3. 파일 저장
4. **JSON으로 변환** (중요!)

```bash
# Excel → JSON 변환
node -e "
const XLSX = require('xlsx');
const fs = require('fs');

const workbook = XLSX.readFile('data/pin_code.xlsx');
const worksheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(worksheet);

const pinCodes = data
  .map(row => row['매장 코드'])
  .filter(pin => pin && /^P\d{6}$/.test(String(pin).trim()))
  .map(pin => String(pin).trim().toUpperCase());

fs.writeFileSync(
  'data/pin_codes.json',
  JSON.stringify(pinCodes, null, 2)
);

console.log('✅', pinCodes.length, '개 PIN 코드 변환 완료');
"

# Git에 커밋
git add data/pin_codes.json
git commit -m "Update PIN codes"
git push
```

## 🔒 보안 권장사항

### 1. PIN 코드 파일 보호

**.gitignore에 추가** (선택사항):
```
# PIN 코드 파일 (운영 환경에서만)
public/assets/pin_code.xlsx
```

### 2. 환경별 파일 관리

- **개발**: 테스트용 PIN 코드
- **운영**: 실제 PIN 코드

### 3. 사용 제한

PIN 코드당 1회만 사용 가능하도록 추가 구현 가능:

```typescript
// 사용된 PIN 코드 추적 (데이터베이스 또는 파일)
const usedPins = new Set<string>();

export function markPinAsUsed(pin: string): void {
  usedPins.add(pin);
}

export function isPinUsed(pin: string): boolean {
  return usedPins.has(pin);
}
```

## 📦 배포

### Vercel 배포 시

**중요**: JSON 파일(`data/pin_codes.json`)이 Git에 커밋되어야 합니다.

**확인사항**:
- ✅ `data/pin_codes.json` 파일 존재
- ✅ Git에 커밋되었는지 확인
- ✅ `.gitignore`에서 제외되지 않았는지 확인
- ⚠️ Excel 파일(`data/pin_code.xlsx`)은 선택사항 (로컬 편집용)

### 배포 후 확인

```bash
# 배포된 사이트에서 테스트
# - 유효한 PIN 코드 입력
# - 존재하지 않는 PIN 코드 입력
# - 형식이 잘못된 PIN 코드 입력
```

## 🆘 문제 해결

### PIN 코드가 인식되지 않음

```bash
# 1. Excel 파일 확인
cat public/assets/pin_code.xlsx

# 2. PIN 코드 로드 테스트
node -e "
const { loadPinCodes } = require('./lib/pinCodes');
const pins = loadPinCodes();
console.log('로드된 PIN 수:', pins.size);
console.log('샘플:', Array.from(pins).slice(0, 5));
"

# 3. 특정 PIN 검증
node -e "
const { verifyPinCode } = require('./lib/pinCodes');
console.log('P160817:', verifyPinCode('P160817'));
console.log('P000000:', verifyPinCode('P000000'));
"
```

## 📚 추가 리소스

- [xlsx 라이브러리 문서](https://www.npmjs.com/package/xlsx)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
