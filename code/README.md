# NingNing (닝닝) — AI 운세 서비스

내 사주를, 오늘의 선택에 맞게 풀어주는 AI 운세

정통 사주 계산(만세력·오행·일간)을 바탕으로, AI가 연애·일·재물 흐름을 현실 언어로 해석해주는 한국형 운세 서비스입니다.

## 기술 스택

- **프론트엔드**: Next.js (App Router) + Tailwind CSS + shadcn/ui
- **백엔드**: Next.js API Routes
- **데이터베이스**: Supabase (PostgreSQL)
- **AI**: Claude API (Anthropic)
- **사주 엔진**: 자체 구현 (TypeScript + lunar-javascript)
- **결제**: 토스페이먼츠 (예정)
- **배포**: Vercel

## 시작하기

```bash
# 의존성 설치
pnpm install

# 개발 서버 실행
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인할 수 있습니다.

## 프로젝트 구조

```
code/
├── src/
│   ├── app/          # 페이지 및 API 라우트
│   ├── components/   # UI 컴포넌트
│   └── lib/
│       ├── saju/     # 사주 계산 엔진
│       ├── ai/       # AI 프롬프트 및 클라이언트
│       ├── db/       # Supabase 클라이언트
│       ├── payment/  # 결제 연동
│       └── analytics/# 이벤트 트래킹
├── supabase/         # DB 마이그레이션
└── tests/            # 테스트
```

## 환경 변수

`.env.local` 파일을 생성하고 아래 값을 설정하세요:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
```

## 테스트

```bash
pnpm vitest run
```

## 배포

Vercel을 통해 자동 배포됩니다. `main` 브랜치에 머지하면 프로덕션에 반영됩니다.
