// ==========================================
// 인증 상태에 따른 네비게이션 링크
// ==========================================
//
// 로그인 상태에 따라 "로그인" 또는 마이페이지 아이콘을 표시합니다.

'use client';

import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';

export default function AuthNavLink() {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (user) {
    return (
      <Link
        href="/my"
        className="text-foreground hover:text-foreground/70 transition-colors"
      >
        <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="4" />
          <path d="M20 21a8 8 0 0 0-16 0" />
        </svg>
      </Link>
    );
  }

  return (
    <Link
      href="/login"
      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
    >
      로그인
    </Link>
  );
}
