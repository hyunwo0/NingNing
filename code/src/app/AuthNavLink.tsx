// ==========================================
// 인증 상태에 따른 네비게이션 링크
// ==========================================
//
// [이 파일이 하는 일]
// 로그인 상태에 따라 "로그인" 또는 "마이페이지" 링크를 표시합니다.
// 클라이언트 컴포넌트로 useAuth() 훅을 사용합니다.

'use client';

import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';

export default function AuthNavLink() {
  const { user, loading } = useAuth();

  // 로딩 중에는 아무것도 표시하지 않음 (깜빡임 방지)
  if (loading) return null;

  if (user) {
    // 로그인 상태 → 마이페이지 링크
    return (
      <Link
        href="/my"
        className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
      >
        {/* 사용자 아이콘 */}
        <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="4" />
          <path d="M20 21a8 8 0 0 0-16 0" />
        </svg>
        마이페이지
      </Link>
    );
  }

  // 비로그인 상태 → 로그인 링크
  return (
    <Link
      href="/login"
      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
    >
      로그인
    </Link>
  );
}
