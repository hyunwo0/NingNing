// ==========================================
// POST /api/mbti — MBTI 운세 AI 해석 API
// ==========================================

import { NextResponse } from 'next/server';
import { generateResponse, parseJSONResponse } from '@/lib/ai/client';

const SYSTEM_PROMPT = `당신은 K-감성 MBTI 운세 크리에이터입니다.
사용자의 MBTI 유형을 바탕으로 오늘의 맞춤 운세를 생성합니다.

## 톤앤매너
- 트렌디하고 친근한 말투 ("~해요", "~이에요")
- MBTI 각 유형의 특성을 잘 반영
- 공유하고 싶어지는 한 줄 카피 포함
- 공포 조장, 확정적 예언 금지

## 출력 형식
반드시 아래 JSON 형식으로만 응답하세요.

{
  "title": "MBTI 유형의 오늘 한 줄 제목 (예: 아이디어가 폭발하는 날)",
  "mood": "오늘의 무드 해석 (3~4문장, 100~200자, 해당 MBTI 특성 반영)",
  "advice": "오늘 실행 가능한 구체적 조언 (2~3문장, 60~100자)",
  "caution": "이 MBTI가 오늘 주의할 점 (1~2문장, 40~80자)",
  "oneLiner": "공유하고 싶은 한 줄 카피 (20~40자)"
}`;

interface MbtiRequest {
  mbtiType: string;
}

interface MbtiInterpretation {
  title: string;
  mood: string;
  advice: string;
  caution: string;
  oneLiner: string;
}

export async function POST(request: Request) {
  try {
    const body: MbtiRequest = await request.json();

    if (!body.mbtiType) {
      return NextResponse.json({ error: 'MBTI 유형이 필요합니다.' }, { status: 400 });
    }

    const userMessage = `MBTI 유형: ${body.mbtiType}

이 유형의 오늘 운세를 생성해주세요.
${body.mbtiType}의 성격 특성(강점, 약점, 선호 패턴)을 반영해서 오늘 하루에 맞는 해석을 해주세요.`;

    const aiResponse = await generateResponse(SYSTEM_PROMPT, userMessage, {
      maxTokens: 1024,
      temperature: 0.8,
    });

    const result = parseJSONResponse<MbtiInterpretation>(aiResponse.content);

    return NextResponse.json({ result }, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    console.error('[/api/mbti] MBTI 운세 오류:', error);
    return NextResponse.json({ error: 'MBTI 운세 생성 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
