# Vercel 배포 가이드

이 프로젝트를 Vercel에 배포하는 방법을 안내합니다.

## 사전 준비

### 1. Supabase 프로젝트 설정
1. [Supabase](https://supabase.com)에서 계정 생성 및 프로젝트 생성
2. 다음 테이블 생성:
   - `prizes`: 경품 정보 테이블
   - `participants`: 참가자 정보 테이블
3. 프로젝트 설정에서 다음 정보 복사:
   - ✅ Project URL
   - ✅ Anon/Public Key
   - ✅ Service Role Key

### 2. Google Sheets API 설정 (백업용)
[GOOGLE_SHEETS_SETUP.md](./GOOGLE_SHEETS_SETUP.md)를 참고하여 Google Sheets API를 설정하고, 다음 정보를 준비하세요:
- ✅ Service Account JSON 키 파일
- ✅ Google Sheets 스프레드시트 ID

### 3. Git 레포지토리 생성

```bash
# Git 초기화 (아직 안 했다면)
git init

# .gitignore 확인 (.env.local이 포함되어 있는지)
cat .gitignore

# 첫 커밋
git add .
git commit -m "Initial commit"

# GitHub에 푸시 (GitHub 레포지토리 생성 후)
git remote add origin https://github.com/your-username/your-repo.git
git branch -M main
git push -u origin main
```

## Vercel 배포 단계

### 1단계: Vercel 계정 생성 및 로그인

1. [Vercel 웹사이트](https://vercel.com) 접속
2. "Sign Up" 또는 GitHub 계정으로 로그인
3. GitHub 계정 연동 권장 (자동 배포를 위해)

### 2단계: 프로젝트 Import

1. Vercel 대시보드에서 "Add New..." → "Project" 클릭
2. GitHub 레포지토리 선택
3. 레포지토리 접근 권한 허용
4. Import 클릭

### 3단계: 프로젝트 설정

**Framework Preset:** Next.js (자동 감지됨)

**Build Command:**
```bash
npm run build
```

**Output Directory:**
```
.next
```

**Install Command:**
```bash
npm install
```

### 4단계: 환경 변수 설정

⚠️ **매우 중요**: Vercel 대시보드에서 환경 변수를 설정해야 합니다.

1. 프로젝트 설정에서 "Environment Variables" 섹션으로 이동
2. 다음 환경 변수들을 추가:

#### Supabase 설정

```
NEXT_PUBLIC_SUPABASE_URL
```

**Value:** Supabase 프로젝트 URL (예: `https://xxxxx.supabase.co`)
**Environment:** Production, Preview, Development 모두 체크

```
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

**Value:** Supabase anon/public key
**Environment:** Production, Preview, Development 모두 체크

```
SUPABASE_SERVICE_ROLE_KEY
```

**Value:** Supabase service role key (관리자 권한)
**Environment:** Production, Preview, Development 모두 체크

#### 관리자 인증

```
ADMIN_PASSWORD
```

**Value:** 관리자 페이지 접속 비밀번호 (원하는 비밀번호 설정)
**Environment:** Production, Preview, Development 모두 체크

#### Google Sheets API (백업용)

#### GOOGLE_SERVICE_ACCOUNT_KEY

```
GOOGLE_SERVICE_ACCOUNT_KEY
```

**Value:**
- Service Account JSON 파일의 **전체 내용**을 한 줄로 복사
- 예시:
```json
{"type":"service_account","project_id":"your-project","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...@....iam.gserviceaccount.com","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"..."}
```

**Environment:** Production, Preview, Development 모두 체크

#### GOOGLE_SHEET_ID

```
GOOGLE_SHEET_ID
```

**Value:**
- 스프레드시트 URL에서 추출한 ID
- 예시: `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`

**Environment:** Production, Preview, Development 모두 체크

### 5단계: 배포

1. "Deploy" 버튼 클릭
2. 빌드 및 배포 진행 (약 1-2분 소요)
3. 배포 완료 후 URL 확인 (예: `https://your-project.vercel.app`)

## 배포 후 확인사항

### 1. 기능 테스트

배포된 사이트에서 다음을 테스트:

- ✅ PIN 코드 입력 (data/pin_codes.json에 있는 유효한 PIN 코드 사용)
- ✅ 영상 시청 페이지
- ✅ 룰렛 회전
- ✅ 결과 팝업
- ✅ 정보 입력 및 Supabase DB 저장
- ✅ Google Sheets 백업 저장
- ✅ 전화번호 중복 체크
- ✅ 두 번째 룰렛 참여
- ✅ 관리자 페이지 접속 (`/admin`)

### 2. 데이터베이스 확인

**Supabase (메인)**
1. Supabase 대시보드 열기
2. `participants` 테이블에서 데이터 확인
3. `prizes` 테이블에서 경품 설정 확인

**Google Sheets (백업)**
1. Google Sheets 열기
2. 백업 데이터가 올바르게 저장되는지 확인
3. 헤더 행이 자동 생성되었는지 확인

### 3. 로그 확인

문제가 있다면 Vercel 대시보드에서 로그 확인:

1. 프로젝트 → "Deployments" 탭
2. 최신 배포 클릭
3. "Functions" 탭에서 API 로그 확인

## 자동 배포 설정

GitHub와 연동하면 자동 배포가 활성화됩니다:

- **main 브랜치 푸시** → Production 배포
- **다른 브랜치 푸시** → Preview 배포
- **Pull Request** → Preview 배포

```bash
# 코드 수정 후
git add .
git commit -m "Update feature"
git push origin main

# Vercel이 자동으로 감지하고 재배포합니다
```

## 커스텀 도메인 설정 (선택사항)

### 1. 도메인 추가

1. Vercel 프로젝트 → "Settings" → "Domains"
2. "Add" 버튼 클릭
3. 도메인 입력 (예: `event.yourdomain.com`)

### 2. DNS 설정

Vercel이 제공하는 DNS 레코드를 도메인 제공업체에 추가:

**A 레코드:**
```
Type: A
Name: @ (또는 subdomain)
Value: 76.76.21.21
```

**CNAME 레코드 (서브도메인):**
```
Type: CNAME
Name: event
Value: cname.vercel-dns.com
```

### 3. SSL 인증서

Vercel이 자동으로 Let's Encrypt SSL 인증서를 발급합니다 (무료).

## 문제 해결

### "GOOGLE_SHEET_ID is not configured" 오류

**원인:** 환경 변수가 설정되지 않았거나 배포에 반영되지 않음

**해결:**
1. Vercel 대시보드 → Settings → Environment Variables 확인
2. 환경 변수 추가 후 **Redeploy** 필요
3. Deployments → 최신 배포 → "Redeploy" 버튼 클릭

### "Invalid credentials" 오류

**원인:** Service Account JSON이 올바르지 않음

**해결:**
1. JSON 파일 전체 내용이 한 줄로 복사되었는지 확인
2. 개행 문자(`\n`)가 그대로 유지되었는지 확인
3. 큰따옴표가 올바르게 유지되었는지 확인

### "Permission denied" 오류

**원인:** Service Account가 스프레드시트에 접근 권한이 없음

**해결:**
1. Google Sheets 열기
2. "공유" 버튼 클릭
3. Service Account 이메일 추가 (JSON의 `client_email`)
4. 권한: "편집자"로 설정

### 빌드 실패

**원인:** 의존성 또는 코드 오류

**해결:**
1. 로컬에서 빌드 테스트:
```bash
npm run build
```
2. 오류 수정 후 다시 푸시

### API 라우트 타임아웃

**원인:** Google Sheets API 호출 시간 초과 (Vercel 무료 플랜: 10초)

**해결:**
- Pro 플랜 업그레이드 (60초)
- 또는 데이터 양 줄이기

## 환경별 설정

### Production (프로덕션)
- URL: `https://your-project.vercel.app`
- 환경 변수: Production 환경 사용
- 실제 사용자가 접근

### Preview (프리뷰)
- URL: `https://your-project-git-branch-name.vercel.app`
- 환경 변수: Preview 환경 사용
- 테스트용

### Development (개발)
- URL: `http://localhost:3000`
- 환경 변수: `.env.local` 사용
- 로컬 개발

## 비용

### Vercel 무료 플랜 (Hobby)

**포함 사항:**
- ✅ 무제한 배포
- ✅ 100GB 대역폭/월
- ✅ 자동 SSL 인증서
- ✅ Serverless Functions (10초 타임아웃)
- ✅ GitHub/GitLab/Bitbucket 연동

**제한 사항:**
- 상업적 사용 불가
- API 라우트 타임아웃: 10초
- 동시 빌드: 1개

### Pro 플랜 ($20/월)

- 상업적 사용 가능
- API 타임아웃: 60초
- 우선 지원

## 보안 권장사항

### 1. 환경 변수 보호
- ✅ `.env.local`을 Git에 커밋하지 마세요
- ✅ Service Account 키를 공개하지 마세요
- ✅ Vercel 환경 변수는 암호화되어 저장됩니다

### 2. API 라우트 보호 (선택사항)

추가 보안이 필요하다면:

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Rate limiting, 인증 등 추가
}
```

### 3. CORS 설정

필요한 경우 `next.config.mjs`에서 설정:

```javascript
const nextConfig = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'https://yourdomain.com' },
        ],
      },
    ];
  },
};
```

## 유용한 명령어

```bash
# Vercel CLI 설치 (선택사항)
npm i -g vercel

# CLI로 배포
vercel

# Production 배포
vercel --prod

# 환경 변수 확인
vercel env ls

# 로그 확인
vercel logs
```

## 추가 리소스

- [Vercel 공식 문서](https://vercel.com/docs)
- [Next.js 배포 가이드](https://nextjs.org/docs/deployment)
- [Vercel 커뮤니티](https://github.com/vercel/vercel/discussions)

## 지원

문제가 발생하면:
1. Vercel 대시보드에서 로그 확인
2. [Vercel 지원팀 문의](https://vercel.com/support)
3. [GitHub Issues](https://github.com/vercel/vercel/issues)
