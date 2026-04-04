// ==========================================
// POST /api/question — AI 추가질문 API
// ==========================================
//
// [역할]
// 사용자가 운세 결과를 보고 "이직해도 될까요?" 같은
// 추가 질문을 하면, 사주 맥락을 바탕으로 맞춤 답변을 생성합니다.
//
// [무료/유료 구분]
// 현재는 무료 2회까지 허용합니다.
// 횟수 체크는 클라이언트에서 관리하며,
// 추후 DB 연동 시 서버에서도 검증하도록 확장합니다.
//
// [호출 흐름]
// 클라이언트 → POST /api/question
//   → 프롬프트 조합 (question.ts)
//   → Claude API 호출
//   → 가드레일 검증
//   → 답변 반환

import { NextResponse } from 'next/server';
import { generateResponse } from '@/lib/ai/client';
import { QUESTION_SYSTEM_PROMPT, buildQuestionUserPrompt } from '@/lib/ai/prompts/question';
import { checkGuardrail, sanitizeContent } from '@/lib/ai/guardrail';
import type { SajuAnalysis, DailyRelation } from '@/lib/saju/types';

interface QuestionRequest {
  analysis: SajuAnalysis;
  daily: DailyRelation;
  gender: 'male' | 'female';
  question: string;
  previousQA: Array<{ question: string; answer: string }>;
}

// 요청 바디 크기 제한 (50KB — 대화 이력 포함)
const MAX_BODY_SIZE = 50 * 1024;

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
    let body: QuestionRequest;
    try {
      body = await request.json() as QuestionRequest;
    } catch {
      return NextResponse.json(
        { error: '잘못된 요청 형식입니다.' },
        { status: 400 },
      );
    }

    // 필수 데이터 검증
    if (!body.analysis || !body.daily || !body.gender || !body.question) {
      return NextResponse.json(
        { error: '필수 데이터가 누락되었습니다.' },
        { status: 400 },
      );
    }

    // 질문 길이 제한 (너무 긴 질문 방지)
    if (body.question.length > 500) {
      return NextResponse.json(
        { error: '질문은 500자 이내로 입력해주세요.' },
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
    const userMessage = buildQuestionUserPrompt(
      body.analysis,
      body.daily,
      body.gender,
      body.question,
      body.previousQA ?? [],
    );

    // 2) Claude API 호출 (추가질문은 짧은 답변이므로 토큰 제한 낮게)
    const aiResponse = await generateResponse(QUESTION_SYSTEM_PROMPT, userMessage, {
      maxTokens: 512,
      temperature: 0.7,
    });

    // 3) 가드레일 검증
    let content = aiResponse.content;
    const guardrailResult = checkGuardrail(content);

    if (!guardrailResult.passed) {
      console.warn('[/api/question] 가드레일 위반:', guardrailResult.violations);
      content = sanitizeContent(content);

      const recheck = checkGuardrail(content);
      if (!recheck.passed) {
        return NextResponse.json(
          { error: '안전한 응답을 생성하지 못했습니다. 다시 시도해주세요.' },
          { status: 500 },
        );
      }
    }

    // 4) 응답 반환 (AI 응답은 브라우저 캐시 방지)
    return NextResponse.json({
      answer: content,
      usage: aiResponse.usage,
    }, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    console.error('[/api/question] 추가질문 오류:', error);
    return NextResponse.json(
      { error: 'AI 답변 생성 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}
