// ==========================================
// Next.js 미들웨어 — 인증 세션 갱신
// ==========================================
//
// [이 파일이 하는 일]
// 모든 요청마다 Supabase 인증 세션을 갱신합니다.
// 만료된 토큰을 자동으로 리프레시하여 사용자가 로그아웃되지 않도록 합니다.
//
// [동작 원리]
// 1) 요청의 쿠키에서 Supabase 세션을 읽음
// 2) getUser()를 호출하여 세션 유효성 확인 + 토큰 갱신
// 3) 갱신된 쿠키를 응답에 포함시킴

import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // 응답 객체 생성
  let supabaseResponse = NextResponse.next({
    request,
  });

  // 쿠키 기반 Supabase 클라이언트 생성
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // 요청 쿠키에 새 값 설정
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          // 응답 객체를 새로 생성하여 갱신된 쿠키 포함
          supabaseResponse = NextResponse.next({
            request,
          });
          // 응답 쿠키에도 설정
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 세션 갱신 — getUser()를 호출하면 만료된 토큰이 자동 리프레시됨
  // 주의: getSession() 대신 getUser()를 사용해야 서버에서 토큰 검증이 이루어짐
  await supabase.auth.getUser();

  return supabaseResponse;
}

// 미들웨어 적용 경로 설정
// 정적 파일과 이미지는 제외
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
