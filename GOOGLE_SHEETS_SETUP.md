# Google Sheets API 연동 설정 가이드

## 1. Google Cloud Console 설정

### 1.1 프로젝트 생성
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택

### 1.2 Google Sheets API 활성화
1. 왼쪽 메뉴에서 "API 및 서비스" > "라이브러리" 선택
2. "Google Sheets API" 검색 후 선택
3. "사용" 버튼 클릭

### 1.3 Service Account 생성
1. 왼쪽 메뉴에서 "API 및 서비스" > "사용자 인증 정보" 선택
2. "사용자 인증 정보 만들기" > "서비스 계정" 선택
3. 서비스 계정 이름 입력 (예: "qr-event-sheets")
4. "만들기 및 계속하기" 클릭
5. 역할 선택: "편집자" 또는 필요한 최소 권한
6. "완료" 클릭

### 1.4 Service Account 키 생성
1. 생성된 서비스 계정 클릭
2. "키" 탭 선택
3. "키 추가" > "새 키 만들기" 클릭
4. 키 유형: JSON 선택
5. "만들기" 클릭 → JSON 파일이 자동 다운로드됩니다

## 2. Google Sheets 준비

### 2.1 스프레드시트 생성
1. [Google Sheets](https://sheets.google.com/) 접속
2. 새 스프레드시트 생성
3. 시트 이름을 "Sheet1"로 설정 (또는 코드에서 수정)

### 2.2 스프레드시트 공유
1. 스프레드시트 우측 상단 "공유" 버튼 클릭
2. Service Account 이메일 추가 (JSON 파일의 `client_email` 값)
   - 예: `qr-event-sheets@your-project-id.iam.gserviceaccount.com`
3. 권한: "편집자"로 설정
4. "완료" 클릭

### 2.3 스프레드시트 ID 확인
- 스프레드시트 URL에서 ID 추출:
  ```
  https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit
  ```
  → `[SPREADSHEET_ID]` 부분을 복사

## 3. 환경 변수 설정

### 3.1 .env.local 파일 생성
프로젝트 루트에 `.env.local` 파일 생성:

```bash
# Google Sheets API 설정
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"...","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...@....iam.gserviceaccount.com","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"..."}

GOOGLE_SHEET_ID=your-spreadsheet-id-here
```

### 3.2 Service Account Key 설정
1. 다운로드한 JSON 파일 열기
2. 전체 내용을 **한 줄로** 복사
3. `GOOGLE_SERVICE_ACCOUNT_KEY`에 붙여넣기

**주의사항:**
- JSON 파일 전체를 한 줄로 입력해야 합니다
- 개행 문자(`\n`)는 그대로 유지
- 큰따옴표(`"`)는 이스케이프 처리 불필요

### 3.3 Spreadsheet ID 설정
1. 위에서 확인한 스프레드시트 ID 복사
2. `GOOGLE_SHEET_ID`에 붙여넣기

## 4. 테스트

### 4.1 개발 서버 재시작
```bash
npm run dev
```

### 4.2 동작 확인
1. PIN 입력 후 룰렛 참여
2. 결과 팝업에서 이름과 전화번호 입력
3. "한 번 더 도전하기" 버튼 클릭
4. Google Sheets에서 데이터 확인

## 5. 데이터 구조

Google Sheets에는 다음과 같이 데이터가 저장됩니다:

| A열 | B열 | C열 | D열 | E열 | F열 | G열 | H열 |
|-----|-----|-----|-----|-----|-----|-----|-----|
| 이름 | 전화번호 | 참여수 | 당첨수 | 1차 결과 | 2차 결과 | 당첨 상품 | 참여시간 |
| 홍길동 | 010-1234-5678 | 2 | 1 | 꽝 | 10% 할인 | 10% 할인 | 2024-03-19 14:30:25 |
| 김철수 | 010-9876-5432 | 2 | 0 | 꽝 | 꽝 | 없음 | 2024-03-19 15:10:42 |
| 이영희 | 010-1111-2222 | 2 | 2 | 5% 할인 | 무료쿠폰 | 5% 할인, 무료쿠폰 | 2024-03-19 16:20:15 |

### 컬럼 설명:
- **A열 (이름)**: 참여자 이름
- **B열 (전화번호)**: 참여자 전화번호 (중복 체크에 사용)
- **C열 (참여수)**: 총 참여 횟수 (1 또는 2)
- **D열 (당첨수)**: 당첨된 횟수 (0, 1, 2)
- **E열 (1차 결과)**: 첫 번째 룰렛 결과
- **F열 (2차 결과)**: 두 번째 룰렛 결과 (없으면 "-")
- **G열 (당첨 상품)**: 당첨된 상품 목록 (없으면 "없음")
- **H열 (참여시간)**: 정보 입력 시간 (한국 시간)

### 데이터 저장 흐름:
1. **첫 번째 룰렛 참여**: 결과만 클라이언트에 저장
2. **정보 입력**: 이름, 전화번호, 1차 결과를 Google Sheets에 저장
3. **두 번째 룰렛 참여**: 2차 결과를 업데이트 (참여수, 당첨수, 당첨 상품도 자동 계산)

## 6. 중복 참여 방지

시스템은 다음 두 가지 방법으로 중복 참여를 방지합니다:

1. **쿠키 기반 체크** (같은 브라우저/기기)
   - `event_extra_chance_used` 쿠키로 확인

2. **전화번호 기반 체크** (다른 기기)
   - Google Sheets의 B열(전화번호)에서 중복 확인
   - 이미 등록된 전화번호는 재참여 불가

## 7. 보안 주의사항

⚠️ **중요**: `.env.local` 파일은 절대 Git에 커밋하지 마세요!

`.gitignore`에 다음이 포함되어 있는지 확인:
```
.env.local
.env*.local
```

## 8. 문제 해결

### "GOOGLE_SHEET_ID is not configured" 오류
- `.env.local` 파일이 프로젝트 루트에 있는지 확인
- 개발 서버 재시작

### "Permission denied" 오류
- Service Account 이메일이 스프레드시트에 공유되었는지 확인
- 권한이 "편집자"인지 확인

### "Invalid credentials" 오류
- Service Account JSON이 올바르게 복사되었는지 확인
- JSON 형식이 깨지지 않았는지 확인

### 데이터가 저장되지 않음
- Google Sheets API가 활성화되었는지 확인
- 스프레드시트 ID가 올바른지 확인
- 시트 이름이 "Sheet1"인지 확인 (또는 코드 수정)
