// ==========================================
// Supabase 데이터베이스 클라이언트
// ==========================================
//
// [이 파일이 하는 일]
// Supabase(PostgreSQL 기반 클라우드 DB)에 연결하는 클라이언트를 생성합니다.
// 사용자 정보, 사주 프로필, 운세 결과, 결제 내역 등을 저장/조회할 때 사용합니다.
//
// [Supabase란?]
// PostgreSQL 데이터베이스 + 인증(로그인) + 실시간 기능을 제공하는 클라우드 서비스입니다.
// Firebase의 오픈소스 대안으로, 무료 티어가 있어서 초기 비용이 들지 않습니다.
//
// [2가지 클라이언트]
// 1) supabase (anon key) — 프론트엔드/일반 API에서 사용
//    → 사용자 권한에 따라 접근 제한됨 (Row Level Security)
// 2) getServiceClient() (service role key) — 서버 사이드 전용
//    → 모든 데이터에 접근 가능 (관리자 권한)
//    → 절대 프론트엔드에 노출되면 안 됨!

import { createClient } from '@supabase/supabase-js';
import type { Database } from './schema';

// 환경변수에서 Supabase 접속 정보를 가져옴
// NEXT_PUBLIC_ 접두사가 붙으면 프론트엔드에서도 접근 가능 (공개 정보)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;       // Supabase 프로젝트 URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!; // 공개용 API 키 (제한된 권한)

// 일반 클라이언트 — 프론트엔드와 일반 API 라우트에서 사용
// <Database> 제네릭으로 타입 안전성을 확보 (schema.ts에서 정의한 타입)
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

/**
 * 서버 사이드 전용 클라이언트를 생성합니다.
 *
 * Service Role Key는 RLS(Row Level Security)를 무시하고
 * 모든 데이터에 접근할 수 있는 "관리자" 키입니다.
 *
 * 주의: 이 키는 절대 프론트엔드에 노출되면 안 됩니다!
 * (NEXT_PUBLIC_ 접두사가 없으므로 서버에서만 접근 가능)
 *
 * 사용 예: 결제 웹훅 처리, 관리자 기능 등
 */
export function getServiceClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // 서버 전용 비밀 키
  return createClient<Database>(supabaseUrl, serviceRoleKey);
}
