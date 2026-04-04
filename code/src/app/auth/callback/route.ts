// ==========================================
// OAuth 콜백 라우트 (/auth/callback)
// ==========================================
//
// [이 파일이 하는 일]
// 카카오, Google 등 소셜 로그인 후 리다이렉트되는 엔드포인트입니다.
// OAuth 인증 코드를 받아서 Supabase 세션으로 교환합니다.
//
// [동작 흐름]
// 1) 소셜 로그인 제공자가 ?code=xxx 파라미터와 함께 이 URL로 리다이렉트
// 2) 서버에서 코드를 세션으로 교환 (쿠키에 저장)
// 3) 원래 이동하려던 페이지(next 파라미터)로 리다이렉트

import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    // Next.js 16에서는 cookies()가 Promise를 반환하므로 await 필요
    const cookieStore = await cookies();

    // 서버용 Supabase 클라이언트 생성 (쿠키 연동)
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // 리다이렉트 후 쿠키 설정이 실패할 수 있음 (무시)
            }
          },
        },
      }
    );

    // 인증 코드를 세션으로 교환
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // 세션 교환 성공 → 원래 페이지로 이동
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // 코드가 없거나 교환 실패 → 홈으로 이동
  return NextResponse.redirect(`${origin}/`);
}
