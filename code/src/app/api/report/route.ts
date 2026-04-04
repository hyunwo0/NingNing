// ==========================================
// POST /api/report — 심층 리포트 생성 API
// ==========================================
//
// [역할]
// 유료 심층 리포트를 생성합니다.
// 무료 운세(/api/interpret)보다 훨씬 상세한 해석과 조언을 제공합니다.
//
// [호출 흐름]
// 클라이언트 → POST /api/report (이 파일)
//   → 프롬프트 조합 (lib/ai/prompts/report)
//   → Claude API 호출 (lib/ai/client) — maxTokens: 4096
//   → 가드레일 검증 (lib/ai/guardrail)
//   → 리포트 결과 반환 (JSON)

import { NextResponse } from 'next/server';
import { generateResponse, parseJSONResponse } from '@/lib/ai/client';
import { REPORT_SYSTEM_PROMPT, buildReportUserPrompt } from '@/lib/ai/prompts/report';
import { checkGuardrail, sanitizeContent } from '@/lib/ai/guardrail';
import type { SajuAnalysis, DailyRelation } from '@/lib/saju/types';

// 요청 바디 타입
interface ReportRequest {
  analysis: SajuAnalysis;
  daily: DailyRelation;
  gender: 'male' | 'female';
}

// Claude가 반환할 심층 리포트 JSON 구조
interface ReportResult {
  sajuOverview: {
    dayMasterExplanation: string;
    fiveElementAnalysis: string;
    personalityInsight: string;
  };
  todayDetailed: {
    overallFlow: string;
    loveDetailed: string;
    workDetailed: string;
    moneyDetailed: string;
  };
  actionAdvice: string[];
  weeklyPreview: string;
  closingMessage: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ReportRequest;

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
    const userMessage = buildReportUserPrompt(body.analysis, body.daily, body.gender);

    // 2) Claude API 호출 (리포트는 더 긴 응답이 필요하므로 maxTokens: 4096)
    const aiResponse = await generateResponse(REPORT_SYSTEM_PROMPT, userMessage, {
      maxTokens: 4096,
      temperature: 0.7,
    });

    // 3) 가드레일 검증 (금지 패턴 및 부정 표현 검사)
    let content = aiResponse.content;
    const guardrailResult = checkGuardrail(content);

    if (!guardrailResult.passed) {
      console.warn('[/api/report] 가드레일 위반:', guardrailResult.violations);

      // 길이 초과만 위반인 경우는 리포트 특성상 허용 (리포트는 상세 해석이라 길 수 있음)
      const nonLengthViolations = guardrailResult.violations.filter(
        (v) => v !== '응답이 너무 깁니다',
      );

      if (nonLengthViolations.length > 0) {
        // 경미한 위반이면 자동 순화 시도
        content = sanitizeContent(content);

        // 순화 후 재검증 (길이 위반은 제외하고 체크)
        const recheck = checkGuardrail(content);
        const recheckNonLength = recheck.violations.filter(
          (v) => v !== '응답이 너무 깁니다',
        );

        if (recheckNonLength.length > 0) {
          return NextResponse.json(
            { error: '안전한 응답을 생성하지 못했습니다. 다시 시도해주세요.' },
            { status: 500 },
          );
        }
      }
    }

    // 4) JSON 파싱
    const report = parseJSONResponse<ReportResult>(content);

    // 5) 응답 반환
    return NextResponse.json({
      report,
      usage: aiResponse.usage,
    });
  } catch (error) {
    console.error('[/api/report] 심층 리포트 생성 오류:', error);
    return NextResponse.json(
      { error: '심층 리포트 생성 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}
