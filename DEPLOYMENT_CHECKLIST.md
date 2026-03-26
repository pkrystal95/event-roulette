# 배포 체크리스트 ✅

Vercel 배포 전에 확인해야 할 사항들입니다.

## 사전 준비 ✅

### Google Sheets API 설정
- [ ] Google Cloud Console에서 프로젝트 생성
- [ ] Google Sheets API 활성화
- [ ] Service Account 생성 및 JSON 키 다운로드
- [ ] Google Sheets 생성 및 Service Account에 공유 (편집자 권한)
- [ ] 스프레드시트 ID 복사

### 로컬 테스트
- [ ] `.env.local` 파일 생성 및 환경 변수 설정
- [ ] Supabase 프로젝트 설정 및 테이블 생성
- [ ] `npm run build` 성공 확인
- [ ] `npm run dev`로 로컬에서 전체 기능 테스트
  - [ ] PIN 입력 (data/pin_codes.json에 있는 유효한 PIN 코드 사용)
  - [ ] 영상 시청
  - [ ] 룰렛 회전 (1차)
  - [ ] 정보 입력
  - [ ] Supabase DB에 데이터 저장 확인
  - [ ] Google Sheets 백업 확인
  - [ ] 전화번호 중복 체크
  - [ ] 룰렛 회전 (2차)
  - [ ] 2차 결과 업데이트 확인

### Git 레포지토리
- [ ] `.gitignore`에 `.env.local` 포함 확인
- [ ] GitHub/GitLab/Bitbucket 레포지토리 생성
- [ ] 로컬 코드 커밋 및 푸시

## Vercel 배포 ✅

### 프로젝트 설정
- [ ] [Vercel](https://vercel.com) 계정 생성/로그인
- [ ] GitHub 계정 연동
- [ ] 레포지토리 Import
- [ ] Framework: Next.js 확인

### 환경 변수 설정
- [ ] `GOOGLE_SERVICE_ACCOUNT_KEY` 추가
  - [ ] JSON 전체 내용 한 줄로 복사
  - [ ] Production, Preview, Development 모두 체크
- [ ] `GOOGLE_SHEET_ID` 추가
  - [ ] 스프레드시트 ID 입력
  - [ ] Production, Preview, Development 모두 체크
- [ ] `NEXT_PUBLIC_SUPABASE_URL` 추가
  - [ ] Supabase 프로젝트 URL 입력
  - [ ] Production, Preview, Development 모두 체크
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` 추가
  - [ ] Supabase anon key 입력
  - [ ] Production, Preview, Development 모두 체크
- [ ] `SUPABASE_SERVICE_ROLE_KEY` 추가
  - [ ] Supabase service role key 입력
  - [ ] Production, Preview, Development 모두 체크
- [ ] `ADMIN_PASSWORD` 추가
  - [ ] 관리자 비밀번호 설정
  - [ ] Production, Preview, Development 모두 체크

### 배포 실행
- [ ] "Deploy" 버튼 클릭
- [ ] 빌드 성공 확인 (약 1-2분)
- [ ] 배포 URL 확인

## 배포 후 테스트 ✅

### 기능 테스트
- [ ] 배포된 URL 접속
- [ ] PIN 입력 페이지 정상 작동 (유효한 PIN 코드 사용)
- [ ] 영상 시청 페이지 정상 작동
- [ ] 룰렛 회전 (1차)
- [ ] 결과 팝업 표시
- [ ] 정보 입력 폼
- [ ] Supabase DB 데이터 저장 확인
- [ ] Google Sheets 백업 확인
- [ ] 전화번호 자동 포맷팅 (`010-0000-0000`)
- [ ] 전화번호 중복 체크 작동
- [ ] 룰렛 회전 (2차)
- [ ] 2차 결과 업데이트 확인
- [ ] 관리자 페이지 접속 (`/admin`)
- [ ] 관리자 기능 테스트 (경품 설정, 참가자 조회 등)

### 모바일 테스트
- [ ] 모바일 브라우저에서 접속
- [ ] 반응형 디자인 확인
- [ ] 터치 동작 정상 작동
- [ ] PIN 입력 (4개 박스)
- [ ] 영상 전체 화면
- [ ] 룰렛 회전 애니메이션
- [ ] 팝업 스크롤 정상 작동

### 데이터베이스 확인

**Supabase DB (메인)**
- [ ] Supabase 대시보드 열기
- [ ] `participants` 테이블 확인
- [ ] 데이터 저장 확인:
  - [ ] name: 이름
  - [ ] phone: 전화번호 (010-0000-0000 형식)
  - [ ] first_result: 1차 결과
  - [ ] second_result: 2차 결과 (null 또는 경품명)
  - [ ] is_winner: 당첨 여부 (boolean)
  - [ ] created_at: 참여시간
- [ ] `prizes` 테이블 확인
  - [ ] 경품 설정이 올바른지 확인

**Google Sheets (백업)**
- [ ] 스프레드시트 열기
- [ ] 헤더 행 자동 생성 확인
- [ ] 백업 데이터 저장 확인

### 에러 로그 확인
- [ ] Vercel 대시보드 → Deployments
- [ ] 최신 배포 클릭 → Functions 탭
- [ ] API 오류 로그 확인
- [ ] 에러 없음 확인

## 선택사항 ✅

### 커스텀 도메인 (선택)
- [ ] 도메인 구매
- [ ] Vercel에서 도메인 추가
- [ ] DNS 레코드 설정
- [ ] SSL 인증서 발급 확인 (자동)

### 모니터링 설정 (선택)
- [ ] Vercel Analytics 활성화
- [ ] Google Analytics 연동 (선택)

### 보안 강화 (선택)
- [ ] Rate limiting 추가
- [ ] CORS 설정
- [ ] CSP 헤더 추가

## 문제 해결 ✅

### 빌드 실패
- [ ] 로컬에서 `npm run build` 테스트
- [ ] 오류 메시지 확인
- [ ] 의존성 설치 확인: `npm install`

### Google Sheets 연동 실패
- [ ] 환경 변수 확인 (Vercel 대시보드)
- [ ] Service Account JSON 형식 확인
- [ ] 스프레드시트 공유 권한 확인
- [ ] Google Sheets API 활성화 확인

### 데이터가 저장되지 않음
- [ ] Vercel Functions 로그 확인
- [ ] 전화번호 형식 확인 (010-0000-0000)
- [ ] API 응답 확인 (브라우저 개발자 도구)

## 배포 완료 ✅

모든 항목을 체크했다면 배포가 완료되었습니다! 🎉

**배포 URL:** `https://your-project.vercel.app`

**Google Sheets:** [스프레드시트 링크]

**다음 단계:**
1. QR 코드 생성 (배포 URL 사용)
2. 이벤트 홍보
3. 실시간 데이터 모니터링

## 유지보수

### 코드 업데이트
```bash
git add .
git commit -m "Update feature"
git push origin main
# Vercel이 자동으로 재배포
```

### 환경 변수 변경
1. Vercel 대시보드 → Settings → Environment Variables
2. 변수 수정
3. **Redeploy 필요** (Deployments → Redeploy 버튼)

### Google Sheets 백업
정기적으로 스프레드시트를 다운로드하여 백업하세요:
- 파일 → 다운로드 → Microsoft Excel (.xlsx)
