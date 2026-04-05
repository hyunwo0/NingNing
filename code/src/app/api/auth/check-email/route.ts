// ==========================================
// 이메일 중복 체크 API
// ==========================================
//
// POST /api/auth/check-email
// Body: { email: string }
// → { exists: true/false }

import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/db/client';

export async function POST(request: NextRequest) {
  const { email } = await request.json();

  if (!email) {
    return NextResponse.json({ error: '이메일을 입력해주세요' }, { status: 400 });
  }

  const supabase = getServiceClient();

  // admin API로 이메일로 사용자 조회
  const { data: { users }, error } = await supabase.auth.admin.listUsers();

  if (error) {
    return NextResponse.json({ error: '확인에 실패했습니다' }, { status: 500 });
  }

  const exists = users.some(u => u.email === email);

  return NextResponse.json({ exists });
}
