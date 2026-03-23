# 룰렛 이벤트

QR 코드 기반 룰렛 이벤트 페이지입니다.

## 기능

- **PIN 코드 인증** (Excel 파일 기반, P + 6자리 숫자)
- **광고 영상 시청** (전체 화면, 1분 후 건너뛰기 가능)
- **원형 룰렛 UI** (6개 영역, 모든 영역 당첨)
- **GO 버튼** 클릭으로 룰렛 회전
- **서버 추첨** 시스템 (가중치 기반)
- **회전 애니메이션** 및 결과 모달
- **참여 제한**:
  - 당첨: 정보 입력 후 종료 (1회만)
  - 낙첨: 정보 입력 후 1회 추가 참여 (총 2회)
- **Google Sheets 연동** (참여자 정보 자동 저장)
- **전화번호 중복 체크** (다른 기기에서도 재참여 방지)
- **전화번호 자동 포맷팅** (010-0000-0000)
- **A2z 폰트** 적용

## 설치 및 실행

1. 의존성 설치
```bash
npm install
```

2. PIN 코드 파일 준비
- Excel 파일을 `data/pin_code.xlsx`에 저장
- JSON으로 변환: `node scripts/convert-pins.js`
- PIN 코드 형식: P + 6자리 숫자 (예: P160817)
- 자세한 내용: [PIN_CODE_GUIDE.md](./PIN_CODE_GUIDE.md)

3. 환경 변수 설정
- `.env.local` 파일 생성 (`.env.example` 참고)
- Google Sheets API 설정 필요 → [설정 가이드](./GOOGLE_SHEETS_SETUP.md) 참조

4. 개발 서버 실행
```bash
npm run dev
```

5. 브라우저에서 접속
```
http://localhost:3000
```

## 📋 문서

- **[PIN_CODE_GUIDE.md](./PIN_CODE_GUIDE.md)** - PIN 코드 시스템 가이드
- **[GOOGLE_SHEETS_SETUP.md](./GOOGLE_SHEETS_SETUP.md)** - Google Sheets API 설정
- **[VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)** - Vercel 배포 가이드
- **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** - 배포 체크리스트
- **[QUICK_START.md](./QUICK_START.md)** - 5분 빠른 시작

## Vercel 배포

Vercel에 배포하려면 [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) 가이드를 참조하세요.

**간단 요약:**
1. GitHub 레포지토리 생성 및 푸시
2. [Vercel](https://vercel.com)에서 프로젝트 import
3. 환경 변수 설정 (GOOGLE_SERVICE_ACCOUNT_KEY, GOOGLE_SHEET_ID)
4. 배포 완료!

## 파일 구조

```
kmong/
├── assets/
│   ├── front.png      # 룰렛 앞판 (6개 영역)
│   ├── back.png       # 룰렛 뒷판
│   ├── button.png     # GO 버튼
│   └── arrow.png      # 화살표
├── roulette.html      # 메인 HTML
├── roulette.css       # 스타일시트
├── roulette.js        # 클라이언트 로직
├── server.js          # Express 서버
├── package.json       # 의존성 관리
└── README.md          # 문서
```

## API

### POST /api/spin

룰렛 결과를 반환합니다.

**응답 예시:**
```json
{
  "success": true,
  "result": 3,
  "message": "룰렛 결과"
}
```

- `result`: 1~6 사이의 숫자 (당첨 영역)

## 상품 설정

`roulette.js` 파일의 `prizes` 객체에서 각 영역의 상품을 수정할 수 있습니다:

```javascript
const prizes = {
    1: "10% 할인",
    2: "꽝",
    3: "무료쿠폰",
    4: "20% 할인",
    5: "꽝",
    6: "5% 할인"
};
```

HTML에서도 텍스트를 수정하세요:

```html
<div class="prize-text prize-1">10% 할인</div>
<div class="prize-text prize-2">꽝</div>
<!-- ... -->
```

## 확률 조정

`server.js`에서 주석 처리된 가중치 코드를 활성화하여 각 영역의 당첨 확률을 조정할 수 있습니다.

## 쿠키 관리

- 쿠키명: `roulette_played`
- 유효기간: 365일
- 삭제하려면 브라우저 개발자도구 > Application > Cookies에서 삭제
