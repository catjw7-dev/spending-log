# 용돈 기입장 💸

Toss 스타일 용돈 기입장. Next.js 14 + TypeScript + Tailwind + Supabase.

## 시작하기

### 1. Supabase 세팅

1. [supabase.com](https://supabase.com) 에서 새 프로젝트 생성
2. **SQL Editor** → `supabase-schema.sql` 내용 붙여넣기 → Run
3. **Project Settings → API** 에서 URL과 anon key 복사

### 2. 환경변수 설정

```bash
cp .env.local.example .env.local
# .env.local 에 Supabase URL과 anon key 입력
```

### 3. 로컬 실행

```bash
npm install
npm run dev
```

### 4. Vercel 배포

Vercel 프로젝트 → Settings → Environment Variables 에서
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` 추가

## 기능

- 💰 수입/지출 내역 입력 및 삭제
- 🗂 카테고리 분류
- 📊 월별 통계 및 차트 (6개월 바 차트, 파이 차트)
- 🎯 카테고리별 + 총 예산 설정
- ☁️ Supabase DB 저장
