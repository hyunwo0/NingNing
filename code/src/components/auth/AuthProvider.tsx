// ==========================================
// 인증 컨텍스트 프로바이더
// ==========================================
//
// [이 파일이 하는 일]
// 앱 전체에서 로그인 상태를 공유할 수 있는 React Context를 제공합니다.
//
// [제공하는 값]
// - user: 현재 로그인된 사용자 정보 (없으면 null)
// - loading: 인증 상태 확인 중 여부
// - signOut: 로그아웃 함수
//
// [사용 방법]
// 1) layout.tsx에서 <AuthProvider>로 앱을 감쌈
// 2) 하위 컴포넌트에서 useAuth() 훅으로 인증 정보 접근

'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { getSupabaseBrowserClient } from '@/lib/auth/supabase';

// ── 컨텍스트 타입 정의 ──
interface AuthContextType {
  user: User | null;       // 현재 로그인된 사용자 (null이면 비로그인)
  loading: boolean;        // 인증 상태 확인 중 여부
  signOut: () => Promise<void>; // 로그아웃 함수
}

// ── 컨텍스트 생성 (기본값은 미로그인 상태) ──
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
});

// ── 프로바이더 컴포넌트 ──
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    // 현재 세션에서 사용자 정보를 가져옴
    const getInitialUser = async () => {
      try {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        setUser(currentUser);
      } catch {
        // 세션이 없거나 만료된 경우
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getInitialUser();

    // 인증 상태 변경 리스너 등록
    // 로그인, 로그아웃, 토큰 갱신 등의 이벤트를 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // 컴포넌트 언마운트 시 리스너 해제
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // 로그아웃 처리
  const signOut = async () => {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── useAuth 훅 ──
// 하위 컴포넌트에서 인증 정보에 접근할 때 사용
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth는 AuthProvider 내부에서만 사용할 수 있습니다');
  }
  return context;
}
