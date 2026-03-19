# 🚀 빠른 시작 가이드

5분 안에 Vercel에 배포하기!

## 1️⃣ Google Sheets 준비 (2분)

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

## 2️⃣ GitHub 푸시 (1분)

```bash
# 레포지토리 생성 후
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/your-repo.git
git push -u origin main
```

## 3️⃣ Vercel 배포 (2분)

### 프로젝트 Import
1. [Vercel](https://vercel.com) 로그인
2. "Add New..." → "Project"
3. GitHub 레포지토리 선택
4. Import 클릭

### 환경 변수 설정

**GOOGLE_SERVICE_ACCOUNT_KEY:**
- JSON 파일 전체 내용을 한 줄로 복사 붙여넣기
- 모든 환경(Production, Preview, Development) 체크 ✅

**GOOGLE_SHEET_ID:**
- 스프레드시트 ID 입력
- 모든 환경 체크 ✅

### 배포!
"Deploy" 버튼 클릭 → 완료! 🎉

## 4️⃣ 테스트

배포 URL 접속:
1. PIN 입력: `1234`
2. 영상 시청 (1분 후 건너뛰기 가능)
3. 룰렛 돌리기
4. 정보 입력
5. Google Sheets 확인!

---

**문제가 있나요?**
→ [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) 상세 가이드 참조
→ [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) 체크리스트 확인
