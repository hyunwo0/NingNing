// ==========================================
// GNB (Global Navigation Bar)
// ==========================================
//
// [규칙]
// - 메인(/): 좌측 NingNing 로고 (비활성) + 우측 로그인/마이페이지
// - 나머지: 좌측 ← 뒤로가기 + 우측 로그인/마이페이지

'use client';

import { useRouter } from 'next/navigation';
import AuthNavLink from '@/app/AuthNavLink';

interface GNBProps {
  isHome?: boolean;
}

export default function GNB({ isHome = false }: GNBProps) {
  const router = useRouter();

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  return (
    <nav className="flex items-center justify-between py-4">
      {isHome ? (
        <span className="text-base font-bold text-foreground">NingNing</span>
      ) : (
        <button
          onClick={handleBack}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
      )}
      <AuthNavLink />
    </nav>
  );
}
