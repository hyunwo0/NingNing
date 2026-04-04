// ==========================================
// POST /api/interpret — AI 해석 생성 API
// ==========================================
//
// [역할]
// /api/saju에서 계산된 사주 데이터를 받아서
// Claude AI에게 보내어 자연어 운세 해석을 생성합니다.
//
// [호출 흐름]
// 클라이언트 → POST /api/interpret (이 파일)
//   → 프롬프트 조합 (lib/ai/prompts)
//   → Claude API 호출 (lib/ai/client)
//   → 가드레일 검증 (lib/ai/guardrail)
//   → 해석 결과 반환 (JSON)
//
// [비용 참고]
// Claude API 호출 1회 ≈ 약 $0.01~0.03
// 하루 1000명 사용 시 ≈ 월 $300~900

import { NextResponse } from 'next/server';
import { generateResponse, parseJSONResponse } from '@/lib/ai/client';
import { DAILY_SYSTEM_PROMPT, buildDailyUserPrompt } from '@/lib/ai/prompts/daily';
import { checkGuardrail, sanitizeContent } from '@/lib/ai/guardrail';
import type { SajuAnalysis, DailyRelation } from '@/lib/saju/types';

// 요청 바디 타입
interface InterpretRequest {
  analysis: SajuAnalysis;
  daily: DailyRelation;
  gender: 'male' | 'female';
}

// Claude가 반환할 JSON 구조
interface DailyInterpretation {
  dailySummary: string;
  dailyKeywords: string[];
  background: string;
  loveReading: { interpretation: string; advice: string };
  workReading: { interpretation: string; advice: string };
  moneyReading: { interpretation: string; advice: string };
  doToday: string;
  avoidToday: string;
  luckyHints: string[];
}

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

    // malformed JSON 처리
    let body: InterpretRequest;
    try {
      body = await request.json() as InterpretRequest;
    } catch {
      return NextResponse.json(
        { error: '잘못된 요청 형식입니다.' },
        { status: 400 },
      );
    }

    // 필수 데이터 검증
    if (!body.analysis || !body.daily || !body.gender) {
      return NextResponse.json(
        { error: '사주 분석 데이터가 누락되었습니다.' },
        { status: 400 },
      );
    }

    // API 키 확인
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'AI 서비스가 설정되지 않았습니다.' },
        { status: 503 },
      );
    }

    // 1) 프롬프트 조합
    const userMessage = buildDailyUserPrompt(body.analysis, body.daily, body.gender);

    // 2) Claude API 호출
    const aiResponse = await generateResponse(DAILY_SYSTEM_PROMPT, userMessage, {
      maxTokens: 2048,
      temperature: 0.7,
    });

    // 3) 가드레일 검증
    let content = aiResponse.content;
    const guardrailResult = checkGuardrail(content);

    if (!guardrailResult.passed) {
      console.warn('[/api/interpret] 가드레일 위반:', guardrailResult.violations);
      // 경미한 위반이면 자동 순화, 심각하면 에러 반환
      content = sanitizeContent(content);

      // 순화 후에도 통과 안 되면 에러
      const recheck = checkGuardrail(content);
      if (!recheck.passed) {
        return NextResponse.json(
          { error: '안전한 응답을 생성하지 못했습니다. 다시 시도해주세요.' },
          { status: 500 },
        );
      }
    }

    // 4) JSON 파싱
    const interpretation = parseJSONResponse<DailyInterpretation>(content);

    // 5) 응답 반환
    return NextResponse.json({
      interpretation,
      usage: aiResponse.usage,
    });
  } catch (error) {
    console.error('[/api/interpret] AI 해석 오류:', error);
    return NextResponse.json(
      { error: 'AI 해석 생성 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}
