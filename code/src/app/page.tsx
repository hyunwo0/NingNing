// ==========================================
// 메인 랜딩 페이지 (/)
// ==========================================
//
// 서비스의 첫 화면입니다.
// 비회원/회원에 따라 CTA 라벨과 테마 링크 노출이 달라집니다.
//
// [구성]
// 1) GNB 헤더: 좌측 로고, 우측 로그인/마이페이지
// 2) 히어로 영역: 서비스 소개 → 특징 소개 → CTA
// 3) 테마별 랜딩 링크 (회원만)
// 4) 푸터

'use client';

import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import AuthNavLink from './AuthNavLink';

export default function Home() {
  const { user, loading } = useAuth();
  const isLoggedIn = !loading && !!user;

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

        {/* ── 히어로 영역 ── */}
        <section className="flex flex-col pt-12 pb-12 gap-8">
          {/* 서비스 소개 */}
          <div className="text-center space-y-2">
            <p className="text-lg font-medium text-foreground">
              사주명리학 기반 AI 오늘의 운세
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              정통 사주 계산과 AI 해석으로<br />
              오늘 하루를 위한 현실적인 가이드를 제공합니다
            </p>
          </div>

          {/* 특징 소개 */}
          <div className="space-y-6">
            <FeatureItem
              icon={<CompassIcon />}
              title="정통 사주 계산"
              description="입춘/절기 기준의 정확한 사주 팔자 계산. 만세력 데이터 기반으로 년주, 월주, 일주, 시주를 산출합니다."
            />
            <FeatureItem
              icon={<SparklesIcon />}
              title="AI 맞춤 해석"
              description="사주 구조를 근거로 연애, 일, 재물 3가지 축의 오늘 흐름을 현실적인 언어로 풀어드립니다."
            />
            <FeatureItem
              icon={<ShieldIcon />}
              title="안전한 운세"
              description="공포 조장이나 확정적 예언 없이, 오늘 실제로 적용할 수 있는 담백한 조언을 제공합니다."
            />
          </div>

          {/* CTA 버튼 */}
          <div className="flex flex-col items-center gap-3">
            <Link
              href="/input"
              className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-foreground px-8 text-base font-semibold text-background transition-colors hover:bg-foreground/90"
            >
              {isLoggedIn ? '오늘의 운세 보기' : '무료로 운세 보기'}
            </Link>

            {/* 보조 문구 (비회원만) */}
            {!isLoggedIn && (
              <p className="text-xs text-muted-foreground">
                회원가입 없이 바로 이용할 수 있습니다
              </p>
            )}
          </div>
        </section>

        {/* ── 테마별 랜딩 링크 (회원만) ── */}
        {isLoggedIn && (
          <>
            <div className="w-12 h-px bg-border mx-auto" />
            <section className="py-8 flex flex-col items-center gap-3">
              <Link
                href="/landing/love"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                연애운이 궁금하다면? →
              </Link>
              <Link
                href="/landing/career"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                이직을 고민 중이라면? →
              </Link>
            </section>
          </>
        )}

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
// 아이콘
// ──────────────────────────────────────────

function CompassIcon() {
  return (
    <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88" />
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

function ShieldIcon() {
  return (
    <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
