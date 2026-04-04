// ==========================================
// 로그인 페이지 (/login)
// ==========================================
//
// [역할]
// 이메일/비밀번호 로그인, 회원가입, 소셜 로그인(카카오, Google)을 제공합니다.
//
// [화면 구성]
// - 이메일 + 비밀번호 폼 (로그인/회원가입 탭 전환)
// - 카카오 로그인 버튼 (노란색)
// - Google 로그인 버튼 (흰색 테두리)
// - 홈으로 돌아가기 링크

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseBrowserClient } from '@/lib/auth/supabase';

// 로그인/회원가입 모드
type AuthMode = 'login' | 'signup';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);

  // ── 이메일/비밀번호 로그인 ──
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const supabase = getSupabaseBrowserClient();

    try {
      if (mode === 'login') {
        // 로그인
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) {
          setError(
            signInError.message === 'Invalid login credentials'
              ? '이메일 또는 비밀번호가 올바르지 않습니다'
              : signInError.message
          );
          return;
        }
        // 로그인 성공 → 홈으로 이동
        router.push('/');
        router.refresh();
      } else {
        // 회원가입
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) {
          setError(
            signUpError.message === 'User already registered'
              ? '이미 가입된 이메일입니다'
              : signUpError.message
          );
          return;
        }
        // 회원가입 성공 → 이메일 확인 안내
        setSignupSuccess(true);
      }
    } catch {
      setError('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  // ── 소셜 로그인 (카카오) ──
  // 비즈앱이 아니면 account_email 권한이 없으므로 scope에서 제외
  const handleKakaoLogin = async () => {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: 'profile_nickname profile_image',
      },
    });
  };

  // ── 소셜 로그인 (Google) ──
  const handleGoogleLogin = async () => {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  // ── 회원가입 성공 안내 화면 ──
  if (signupSuccess) {
    return (
      <div className="flex flex-col flex-1 items-center bg-zinc-50 dark:bg-black min-h-screen">
        <main className="flex flex-col w-full max-w-md px-6 py-8 gap-6">
          <div className="flex flex-col items-center text-center pt-20 gap-6">
            {/* 체크 아이콘 */}
            <div className="size-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <svg className="size-8 text-green-600 dark:text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-foreground">가입 완료!</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              입력하신 이메일로 확인 메일을 보냈습니다.<br />
              메일의 링크를 클릭하면 가입이 완료됩니다.
            </p>
            <button
              onClick={() => {
                setSignupSuccess(false);
                setMode('login');
              }}
              className="inline-flex h-11 items-center justify-center rounded-xl bg-foreground px-8 text-sm font-semibold text-background transition-colors hover:bg-foreground/90"
            >
              로그인하기
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 dark:bg-black min-h-screen">
      <main className="flex flex-col w-full max-w-md px-6 py-8 gap-6">

        {/* ── 뒤로가기 링크 ── */}
        <div className="flex items-center">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← 홈으로
          </Link>
        </div>

        {/* ── 타이틀 ── */}
        <div className="flex flex-col items-center text-center pt-8 pb-4 gap-2">
          <div className="size-12 rounded-2xl bg-foreground flex items-center justify-center">
            <span className="text-lg text-background font-bold">N</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            {mode === 'login' ? '로그인' : '회원가입'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {mode === 'login'
              ? '운세 결과를 저장하고 관리하세요'
              : '이메일과 비밀번호로 가입하세요'}
          </p>
        </div>

        {/* ── 로그인/회원가입 탭 ── */}
        <div className="flex rounded-xl bg-muted p-1">
          <button
            onClick={() => { setMode('login'); setError(''); }}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
              mode === 'login'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground'
            }`}
          >
            로그인
          </button>
          <button
            onClick={() => { setMode('signup'); setError(''); }}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${
              mode === 'signup'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground'
            }`}
          >
            회원가입
          </button>
        </div>

        {/* ── 이메일/비밀번호 폼 ── */}
        <form onSubmit={handleEmailAuth} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-xs font-medium text-muted-foreground">
              이메일
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              required
              className="h-11 rounded-xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-xs font-medium text-muted-foreground">
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === 'signup' ? '8자 이상 입력하세요' : '비밀번호 입력'}
              required
              minLength={mode === 'signup' ? 8 : undefined}
              className="h-11 rounded-xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
            />
          </div>

          {/* 에러 메시지 */}
          {error && (
            <p className="text-sm text-red-500 dark:text-red-400 px-1">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="h-12 rounded-xl bg-foreground text-background text-sm font-semibold transition-colors hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed mt-1"
          >
            {loading
              ? '처리 중...'
              : mode === 'login'
                ? '로그인'
                : '가입하기'}
          </button>
        </form>

        {/* ── 구분선 ── */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">또는</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* ── 소셜 로그인 버튼들 ── */}
        <div className="flex flex-col gap-2">
          {/* 카카오 로그인 */}
          <button
            onClick={handleKakaoLogin}
            className="h-12 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-colors"
            style={{ backgroundColor: '#FEE500', color: '#000000' }}
          >
            {/* 카카오 로고 SVG */}
            <svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3C6.48 3 2 6.36 2 10.44c0 2.61 1.73 4.9 4.33 6.2-.19.7-.68 2.53-.78 2.93-.12.49.18.48.38.35.15-.1 2.42-1.64 3.4-2.31.87.13 1.77.19 2.67.19 5.52 0 10-3.36 10-7.36S17.52 3 12 3z" />
            </svg>
            카카오로 시작하기
          </button>

          {/* Google 로그인 */}
          <button
            onClick={handleGoogleLogin}
            className="h-12 rounded-xl border border-border bg-background flex items-center justify-center gap-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
          >
            {/* Google 로고 SVG */}
            <svg className="size-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Google로 시작하기
          </button>
        </div>

        {/* ── 하단 안내 ── */}
        <p className="text-center text-xs text-muted-foreground pt-4">
          로그인 없이도 운세를 볼 수 있습니다
        </p>

      </main>
    </div>
  );
}
