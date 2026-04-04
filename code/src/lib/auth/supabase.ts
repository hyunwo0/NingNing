// ==========================================
// 브라우저용 Supabase Auth 클라이언트
// ==========================================
//
// [이 파일이 하는 일]
// 클라이언트 컴포넌트("use client")에서 Supabase 인증 기능을 사용할 때
// 호출하는 전용 클라이언트를 생성합니다.
//
// createBrowserClient는 @supabase/ssr 패키지에서 제공하는
// SSR 호환 브라우저 클라이언트로, 쿠키 기반 세션 관리를 자동 처리합니다.

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/lib/db/schema';

/**
 * 브라우저 환경에서 사용하는 Supabase 클라이언트를 반환합니다.
 *
 * 로그인, 로그아웃, 소셜 로그인 등 인증 관련 작업에 사용합니다.
 * NEXT_PUBLIC_ 환경변수만 사용하므로 브라우저에서 안전합니다.
 */
export function getSupabaseBrowserClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
