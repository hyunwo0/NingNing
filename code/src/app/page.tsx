// ==========================================
// 메인 페이지 (/)
// ==========================================
//
// 다양한 운세 타입 중 하나를 선택해 시작할 수 있는 허브 페이지입니다.
//
// [구성]
// 1) GNB 헤더
// 2) 타이틀: "오늘, 뭐 볼까?"
// 3) 타입 선택 카드들
// 4) 푸터

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthNavLink from './AuthNavLink';

// ──────────────────────────────────────────
// 타입 카드 데이터
// ──────────────────────────────────────────

const FORTUNE_TYPES = [
  {
    id: 'saju',
    emoji: '🔮',
    title: '오늘의 운세',
    description: '사주로 보는 오늘의 흐름',
    href: '/input',
    available: true,
  },
  {
    id: 'tarot',
    emoji: '🃏',
    title: '타로 한 장',
    description: '카드가 말해주는 오늘',
    href: '/tarot',
    available: true,
  },
  {
    id: 'mbti',
    emoji: '🧠',
    title: 'MBTI 운세',
    description: '내 유형에 맞는 오늘',
    href: '/mbti',
    available: true,
  },
  {
    id: 'celeb',
    emoji: '⭐',
    title: '나와 맞는 연예인',
    description: '사주 궁합 TOP 3',
    href: '/celeb',
    available: true,
  },
  {
    id: 'face',
    emoji: '👀',
    title: 'AI 관상',
    description: '얼굴로 보는 나의 성격',
    href: '/face',
    available: true,
  },
] as const;

// ──────────────────────────────────────────
// 메인 컴포넌트
// ──────────────────────────────────────────

export default function Home() {
  const router = useRouter();

  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 dark:bg-black">
      <main className="flex flex-col w-full max-w-md px-6">

        {/* ── GNB 헤더 ── */}
        <nav className="flex items-center justify-between py-4">
          <Link href="/" className="text-base font-bold text-foreground">
            NingNing
          </Link>
          <AuthNavLink />
        </nav>

        {/* ── 타이틀 ── */}
        <section className="pt-8 pb-6">
          <h1 className="text-2xl font-bold text-foreground">
            오늘, 뭐 볼까?
          </h1>
        </section>

        {/* ── 타입 선택 카드들 ── */}
        <section className="flex flex-col gap-3 pb-8">
          {FORTUNE_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => type.available && router.push(type.href)}
              disabled={!type.available}
              className={`flex items-center gap-4 p-4 rounded-2xl border text-left transition-colors ${
                type.available
                  ? 'border-border bg-background hover:bg-muted cursor-pointer'
                  : 'border-border/50 bg-background/50 cursor-not-allowed opacity-60'
              }`}
            >
              <span className="text-2xl">{type.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">{type.title}</p>
                  {!type.available && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                      준비 중
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{type.description}</p>
              </div>
              {type.available && (
                <svg className="size-4 text-muted-foreground shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              )}
            </button>
          ))}
        </section>

        {/* ── 푸터 ── */}
        <footer className="py-8 text-center text-xs text-muted-foreground space-y-1">
          <p>NingNing &middot; AI 운세 서비스</p>
          <p>사주 결과는 참고용이며, 중요한 결정의 근거로 사용하지 마세요.</p>
          <div className="pt-1">
            <Link href="/privacy" className="hover:text-foreground transition-colors">개인정보처리방침</Link>
            {' '}&middot;{' '}
            <Link href="/terms" className="hover:text-foreground transition-colors">이용약관</Link>
          </div>
        </footer>
      </main>
    </div>
  );
}
