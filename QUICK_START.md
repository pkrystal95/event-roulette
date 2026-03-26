# 🚀 빠른 시작 가이드

10분 안에 Vercel에 배포하기!

## 1️⃣ Supabase 설정 (3분)

### 프로젝트 생성
1. [Supabase](https://supabase.com) 계정 생성 및 로그인
2. 새 프로젝트 생성
3. 프로젝트 설정에서 API 키 복사:
   - Project URL
   - Anon key
   - Service role key

### 테이블 생성
SQL Editor에서 다음 테이블 생성:
- `prizes`: 경품 정보
- `participants`: 참가자 정보

## 2️⃣ Google Sheets 준비 (2분, 백업용)

### Service Account 생성
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 프로젝트 생성 → API 라이브러리에서 "Google Sheets API" 활성화
3. 사용자 인증 정보 → 서비스 계정 만들기
4. JSON 키 다운로드 ⬇️

### 스프레드시트 준비
1. [Google Sheets](https://sheets.google.com/) 새 시트 생성
2. "공유" → Service Account 이메일 추가 (JSON의 `client_email`)
3. 권한: **편집자**
4. URL에서 ID 복사: `https://docs.google.com/spreadsheets/d/[여기]/edit`

## 3️⃣ GitHub 푸시 (1분)

```bash
# 레포지토리 생성 후
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/your-repo.git
git push -u origin main
```

## 4️⃣ Vercel 배포 (3분)

### 프로젝트 Import
1. [Vercel](https://vercel.com) 로그인
2. "Add New..." → "Project"
3. GitHub 레포지토리 선택
4. Import 클릭

### 환경 변수 설정

**Supabase 설정:**
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase 프로젝트 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Anon key
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key
- 모든 환경 체크 ✅

**관리자 인증:**
- `ADMIN_PASSWORD`: 관리자 비밀번호 (원하는 비밀번호 설정)
- 모든 환경 체크 ✅

**Google Sheets (백업용):**
- `GOOGLE_SERVICE_ACCOUNT_KEY`: JSON 파일 전체 내용을 한 줄로 복사
- `GOOGLE_SHEET_ID`: 스프레드시트 ID
- 모든 환경 체크 ✅

### 배포!
"Deploy" 버튼 클릭 → 완료! 🎉

## 5️⃣ 테스트

배포 URL 접속:
1. PIN 입력 (예: `P160817` - Excel 파일의 유효한 PIN 코드 사용)
2. 영상 시청 (설정된 시간 후 건너뛰기 가능)
3. 룰렛 돌리기
4. 정보 입력
5. Supabase DB 및 Google Sheets 백업 확인!
6. 관리자 페이지 (`/admin`) 접속 테스트

---

**문제가 있나요?**
→ [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) 상세 가이드 참조
→ [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) 체크리스트 확인
