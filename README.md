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
- `.env.local` 파일 생성
- **Supabase** 설정 (메인 데이터베이스)
  - `NEXT_PUBLIC_SUPABASE_URL`: Supabase 프로젝트 URL
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon key
  - `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key
- **Google Sheets** 설정 (백업용) → [설정 가이드](./GOOGLE_SHEETS_SETUP.md)
  - `GOOGLE_SERVICE_ACCOUNT_KEY`: Service Account JSON
  - `GOOGLE_SHEET_ID`: Spreadsheet ID
- **관리자 인증**
  - `ADMIN_PASSWORD`: 관리자 페이지 비밀번호

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
1. Supabase 프로젝트 생성 및 테이블 설정
2. GitHub 레포지토리 생성 및 푸시
3. [Vercel](https://vercel.com)에서 프로젝트 import
4. 환경 변수 설정:
   - Supabase (URL, Keys)
   - Google Sheets (Service Account, Sheet ID)
   - 관리자 비밀번호
5. 배포 완료!

## 파일 구조

```
kmong/
├── app/                    # Next.js App Router
│   ├── page.tsx           # 메인 페이지
│   ├── layout.tsx         # 레이아웃
│   ├── admin/             # 관리자 페이지
│   │   ├── page.tsx       # 관리자 대시보드
│   │   ├── login/         # 관리자 로그인
│   │   └── components/    # 관리자 컴포넌트
│   └── api/               # API Routes
│       ├── spin/          # 룰렛 추첨 API
│       ├── verify-pin/    # PIN 검증 API
│       ├── extra-chance/  # 추가 기회 API
│       └── admin/         # 관리자 API
├── components/            # React 컴포넌트
│   ├── PinInputSection.tsx      # PIN 입력
│   ├── VideoSection.tsx         # 광고 영상
│   ├── RouletteSection.tsx      # 룰렛
│   ├── ResultSection.tsx        # 결과 모달
│   └── ExtraFormSection.tsx     # 정보 입력 폼
├── lib/                   # 유틸리티 라이브러리
│   ├── pinCodes.ts        # PIN 코드 검증
│   ├── googleSheets.ts    # Google Sheets 연동
│   ├── supabase.ts        # Supabase DB 연동
│   └── adminAuth.ts       # 관리자 인증
├── public/assets/         # 정적 파일
│   ├── front.png          # 룰렛 앞판 (6개 영역)
│   ├── back.png           # 룰렛 뒷판
│   ├── button.png         # GO 버튼
│   └── arrow.png          # 화살표
├── data/                  # 데이터 파일
│   ├── pin_code.xlsx      # PIN 코드 Excel 파일
│   └── pin_codes.json     # PIN 코드 JSON (변환됨)
├── scripts/               # 유틸리티 스크립트
│   └── convert-pins.js    # Excel → JSON 변환
└── package.json           # 의존성 관리
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

## 상품 및 확률 설정

관리자 페이지(`/admin`)에서 경품과 확률을 설정할 수 있습니다:

1. 관리자 로그인 (`/admin/login`)
2. **경품 설정 섹션**:
   - 각 섹터(1-6)의 경품명 수정
   - 당첨 메시지 설정
   - 경품 활성화/비활성화
3. **확률 설정 섹션**:
   - 각 경품의 가중치 조정
   - 가중치가 높을수록 당첨 확률 증가
   - 실시간 확률 미리보기

**데이터 저장**:
- 경품 정보는 Supabase DB의 `prizes` 테이블에 저장
- 참가자 정보는 Supabase DB의 `participants` 테이블에 저장
- Google Sheets는 백업용으로 사용

## 쿠키 관리

- `event_participated`: 룰렛 참여 완료 여부 (1년)
- `event_extra_chance_used`: 추가 기회 사용 여부 (1년)
- `event_phone`: 참가자 전화번호 (1년)
- 삭제하려면 브라우저 개발자도구 > Application > Cookies에서 삭제

## 관리자 페이지

`/admin` 경로로 접속하여 다음 기능을 사용할 수 있습니다:
- **경품 설정**: 각 섹터의 경품명과 메시지 설정
- **확률 설정**: 가중치 기반 당첨 확률 조정
- **참가자 관리**: 실시간 참가자 목록 및 통계 확인
- **광고 설정**: 광고 영상 URL, 시청 시간, 건너뛰기 시간 설정
- **PIN 코드 관리**: Excel 파일 업로드 및 관리
- **파일 관리**: 룰렛 이미지 업로드 및 관리
