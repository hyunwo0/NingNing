// ==========================================
// GNB (Global Navigation Bar)
// ==========================================
//
// [규칙]
// - 메인(/): 좌측 NingNing 로고 (비활성) + 중앙 없음 + 우측 로그인/마이페이지
// - 나머지: 좌측 ← 뒤로가기 + 중앙 페이지 이름 + 우측 로그인/마이페이지

'use client';

import { useRouter } from 'next/navigation';
import AuthNavLink from '@/app/AuthNavLink';

interface GNBProps {
  isHome?: boolean;
  title?: string;
}

export default function GNB({ isHome = false, title }: GNBProps) {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <nav className="flex items-center justify-between h-14">
      {/* 좌측 */}
      <div className="w-10 flex items-center">
        {isHome ? (
          <span className="text-base font-bold text-foreground">NingNing</span>
        ) : (
          <button
            onClick={handleBack}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
        )}
      </div>

      {/* 중앙: 페이지 이름 */}
      {title && (
        <span className="text-base font-semibold text-foreground">{title}</span>
      )}

      {/* 우측 */}
      <div className="flex items-end gap-3">
        {!isHome && (
          <button
            onClick={() => router.push('/')}
            className="text-foreground hover:text-foreground/70 transition-colors"
          >
            <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3 2 12h3v8h6v-5h2v5h6v-8h3L12 3z" />
            </svg>
          </button>
        )}
        <AuthNavLink />
      </div>
    </nav>
  );
}
