// ==========================================
// 테마별 랜딩 페이지 (/landing/[theme])
// ==========================================
//
// 특정 주제(연애운, 이직운 등)에 맞춘 랜딩 페이지입니다.
// 동적 라우트를 통해 여러 테마를 하나의 파일로 관리합니다.
//
// [지원 테마]
// - /landing/love   → 연애운 테마
// - /landing/career → 이직운 테마
//
// [구성]
// 1) 히어로: 테마 타이틀 + 서브타이틀 + CTA 버튼
// 2) 샘플 결과 미리보기 카드
// 3) 3가지 특징 소개 (인라인 SVG 아이콘)
// 4) 하단 CTA
// 5) 푸터

import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

// ──────────────────────────────────────────
// 테마 설정
// ──────────────────────────────────────────

const THEMES = {
  love: {
    title: '오늘의 연애운',
    subtitle: '그 사람과의 타이밍, 사주로 읽어드립니다',
    description: '썸, 고백, 관계 진전... 사주 흐름에서 연애의 방향을 찾아보세요',
    features: [
      { title: '연애 타이밍 분석', description: '사주 원국과 오늘 일진의 관계에서 감정 흐름을 읽습니다' },
      { title: '상대방과의 궁합 힌트', description: '오행 균형으로 어떤 유형과 잘 맞는지 알려드립니다' },
      { title: 'AI 맞춤 연애 조언', description: '"고백해도 될까요?" 같은 구체적 질문에 사주 기반으로 답합니다' },
    ],
    cta: '내 연애운 확인하기',
    sampleResult: '오늘은 솔직한 감정 표현이 좋은 반응을 만드는 날입니다. 식상(食傷)의 기운이 활발해 평소보다 말이 잘 통하는 흐름이에요.',
  },
  career: {
    title: '오늘의 이직운',
    subtitle: '지금 움직여도 될까? 사주가 알려주는 타이밍',
    description: '이직, 부서 이동, 새로운 시작... 사주 흐름에서 직장운의 방향을 찾아보세요',
    features: [
      { title: '직장운 흐름 분석', description: '관성(官星)과 인성(印星)의 흐름으로 일의 방향을 읽습니다' },
      { title: '변화 타이밍 판단', description: '오늘 일진이 변화에 유리한지, 기다림이 나은지 분석합니다' },
      { title: 'AI 맞춤 커리어 조언', description: '"이직 준비를 시작해도 될까요?" 같은 질문에 답합니다' },
    ],
    cta: '내 직장운 확인하기',
    sampleResult: '지금 사주 흐름상 관성이 강해지는 시기입니다. 새로운 기회를 모색하되, 이번 달은 정보 수집에 집중하는 편이 유리합니다.',
  },
} as const;

type ThemeKey = keyof typeof THEMES;

// ──────────────────────────────────────────
// 정적 파라미터 생성 (빌드 시 페이지 생성)
// ──────────────────────────────────────────

export function generateStaticParams() {
  return [{ theme: 'love' }, { theme: 'career' }];
}

// ──────────────────────────────────────────
// 메타데이터 생성
// ──────────────────────────────────────────

export async function generateMetadata({ params }: { params: Promise<{ theme: string }> }): Promise<Metadata> {
  const { theme } = await params;
  const config = THEMES[theme as ThemeKey];

  if (!config) {
    return { title: 'NingNing - AI 운세' };
  }

  return {
    title: `${config.title} | NingNing`,
    description: config.description,
  };
}

// ──────────────────────────────────────────
// 페이지 컴포넌트
// ──────────────────────────────────────────

export default async function ThemeLandingPage({ params }: { params: Promise<{ theme: string }> }) {
  const { theme } = await params;
  const config = THEMES[theme as ThemeKey];

  // 유효하지 않은 테마는 메인 랜딩으로 리다이렉트
  if (!config) {
    redirect('/');
  }

  // 테마별 아이콘 세트
  const icons = theme === 'love'
    ? [<HeartIcon key="heart" />, <SparklesIcon key="sparkles" />, <ChatIcon key="chat" />]
    : [<TrendingIcon key="trending" />, <ClockIcon key="clock" />, <ChatIcon key="chat" />];

  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 dark:bg-black">
      <main className="flex flex-col w-full max-w-md px-6">

        {/* ── 히어로 영역 ── */}
        <section className="flex flex-col items-center text-center pt-20 pb-12 gap-6">
          {/* 테마 아이콘 */}
          <div className="size-16 rounded-2xl bg-foreground flex items-center justify-center">
            {theme === 'love' ? (
              <HeartLargeIcon />
            ) : (
              <BriefcaseIcon />
            )}
          </div>

          {/* 제목 + 서브타이틀 */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {config.title}
            </h1>
            <p className="text-lg font-medium text-foreground">
              {config.subtitle}
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {config.description}
            </p>
          </div>

          {/* CTA 버튼 */}
          <Link
            href="/input"
            className="inline-flex h-12 items-center justify-center rounded-xl bg-foreground px-8 text-base font-semibold text-background transition-colors hover:bg-foreground/90"
          >
            {config.cta}
          </Link>
        </section>

        {/* ── 구분선 ── */}
        <div className="w-12 h-px bg-border mx-auto" />

        {/* ── 샘플 결과 미리보기 ── */}
        <section className="py-12 space-y-4">
          <h2 className="text-sm font-medium text-muted-foreground text-center">
            이런 결과를 받아볼 수 있어요
          </h2>
          <div className="rounded-2xl border border-border bg-background p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="size-6 rounded-full bg-foreground flex items-center justify-center">
                <span className="text-xs text-background font-bold">N</span>
              </div>
              <span className="text-xs font-medium text-muted-foreground">NingNing AI</span>
            </div>
            <p className="text-sm text-foreground leading-relaxed">
              {config.sampleResult}
            </p>
          </div>
        </section>

        {/* ── 구분선 ── */}
        <div className="w-12 h-px bg-border mx-auto" />

        {/* ── 특징 소개 ── */}
        <section className="py-12 space-y-6">
          {config.features.map((feature, index) => (
            <FeatureItem
              key={feature.title}
              icon={icons[index]}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </section>

        {/* ── 하단 CTA ── */}
        <section className="py-12 flex flex-col items-center gap-4">
          <Link
            href="/input"
            className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-foreground px-8 text-base font-semibold text-background transition-colors hover:bg-foreground/90"
          >
            {config.cta}
          </Link>
          <Link
            href="/"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            ← 메인으로 돌아가기
          </Link>
        </section>

        {/* ── 푸터 ── */}
        <footer className="py-8 text-center text-xs text-muted-foreground space-y-1">
          <p>NingNing &middot; AI 운세 서비스</p>
          <p>사주 결과는 참고용이며, 중요한 결정의 근거로 사용하지 마세요.</p>
        </footer>
      </main>
    </div>
  );
}

// ──────────────────────────────────────────
// 하위 컴포넌트
// ──────────────────────────────────────────

function FeatureItem({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 size-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────
// 아이콘 (인라인 SVG)
// ──────────────────────────────────────────

// 히어로용 큰 아이콘
function HeartLargeIcon() {
  return (
    <svg className="size-7 text-background" viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  );
}

function BriefcaseIcon() {
  return (
    <svg className="size-7 text-background" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      <path d="M2 13h20" />
    </svg>
  );
}

// 피처 목록용 작은 아이콘
function HeartIcon() {
  return (
    <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}

function SparklesIcon() {
  return (
    <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
      <path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      <path d="M8 10h.01" /><path d="M12 10h.01" /><path d="M16 10h.01" />
    </svg>
  );
}

function TrendingIcon() {
  return (
    <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
