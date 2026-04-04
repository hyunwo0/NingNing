// ==========================================
// POST /api/saju — 사주 계산 API
// ==========================================
//
// [역할]
// 사용자의 생년월일시 입력을 받아서 사주 팔자를 계산하고,
// 오늘의 일진과의 관계(3축 점수)까지 분석하여 반환합니다.
//
// [호출 흐름]
// 클라이언트 → POST /api/saju (이 파일) → 사주 엔진(lib/saju)
//   → 계산 결과 반환 (JSON)
//
// 이 API는 순수 계산만 수행하며, AI 호출은 하지 않습니다.
// AI 해석은 별도의 /api/interpret에서 처리합니다.

import { NextResponse } from 'next/server';
import { analyzeSaju, analyzeDailyFortune, fourPillarsToString, fiveElementsToString } from '@/lib/saju';
import type { SajuInput } from '@/lib/saju/types';

// 요청 바디 크기 제한 (10KB)
const MAX_BODY_SIZE = 10 * 1024;

export async function POST(request: Request) {
  try {
    // 요청 바디 크기 검증
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > MAX_BODY_SIZE) {
      return NextResponse.json(
        { error: '요청 데이터가 너무 큽니다.' },
        { status: 413 },
      );
    }

    // 요청 바디에서 사주 입력 데이터 추출 (malformed JSON 처리)
    let body: SajuInput;
    try {
      body = await request.json() as SajuInput;
    } catch {
      return NextResponse.json(
        { error: '잘못된 요청 형식입니다.' },
        { status: 400 },
      );
    }

    // 필수 필드 검증
    if (!body.birthYear || !body.birthMonth || !body.birthDay || !body.gender) {
      return NextResponse.json(
        { error: '필수 입력값이 누락되었습니다.' },
        { status: 400 },
      );
    }

    // 연도 범위 검증 (1940~2010)
    if (body.birthYear < 1940 || body.birthYear > 2010) {
      return NextResponse.json(
        { error: '1940년~2010년 사이의 출생연도만 지원합니다.' },
        { status: 400 },
      );
    }

    // 사주 분석 수행 (사주 팔자 + 오행 + 일간 강약)
    const analysis = analyzeSaju(body);

    // 오늘의 운세 분석 (일진 기반 3축 점수)
    const daily = analyzeDailyFortune(analysis);

    // 응답 반환
    return NextResponse.json({
      // 사주 분석 결과
      fourPillars: analysis.fourPillars,
      fiveElements: analysis.fiveElements,
      dayMaster: analysis.dayMaster,
      dayMasterElement: analysis.dayMasterElement,
      dayMasterStrength: analysis.dayMasterStrength,

      // 오늘의 운세 (일진 관계)
      daily: {
        todayPillar: daily.todayPillar,
        dominantInteraction: daily.dominantInteraction,
        reading: daily.reading,
      },

      // 디버깅/표시용 문자열
      display: {
        fourPillars: fourPillarsToString(analysis.fourPillars),
        fiveElements: fiveElementsToString(analysis.fiveElements),
      },
    });
  } catch (error) {
    console.error('[/api/saju] 계산 오류:', error);
    return NextResponse.json(
      { error: '사주 계산 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}
