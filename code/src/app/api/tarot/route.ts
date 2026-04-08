// ==========================================
// POST /api/tarot — 타로 카드 AI 해석 API
// ==========================================

import { NextResponse } from 'next/server';
import { generateResponse, parseJSONResponse } from '@/lib/ai/client';

const SYSTEM_PROMPT = `당신은 K-감성 타로 리더입니다.
사용자가 뽑은 타로 카드와 질문 유형을 바탕으로 감각적이고 현실적인 해석을 제공합니다.

## 톤앤매너
- 사주를 잘 아는 트렌디한 친구가 대화하는 느낌
- 부드러운 어투 ("~해요", "~이에요")
- 짧은 문장 + 화살표(→)로 풀어쓰기
- 공유하고 싶어지는 한 줄 카피 포함

## 규칙
- 카드의 전통적 의미를 바탕으로 하되, 현대적이고 직관적으로 풀어쓰기
- 질문 유형(연애/진로/오늘)에 맞게 해석 방향을 조정
- 공포 조장, 확정적 예언 금지
- 구체적이고 실행 가능한 조언 포함

## 출력 형식
반드시 아래 JSON 형식으로만 응답하세요.

{
  "cardMeaning": "이 카드의 핵심 의미 한 줄 (20~40자)",
  "interpretation": "질문 유형에 맞는 해석 (3~4문장, 100~200자)",
  "advice": "오늘 실행 가능한 구체적 조언 한 줄 (30~50자)",
  "oneLiner": "공유하고 싶은 한 줄 카피 (20~40자)"
}`;

interface TarotRequest {
  card: { name: string; nameKo: string; keywords: string[] };
  questionType: 'love' | 'career' | 'today';
}

interface TarotInterpretation {
  cardMeaning: string;
  interpretation: string;
  advice: string;
  oneLiner: string;
}

export async function POST(request: Request) {
  try {
    const body: TarotRequest = await request.json();

    if (!body.card || !body.questionType) {
      return NextResponse.json({ error: '카드와 질문 유형이 필요합니다.' }, { status: 400 });
    }

    const questionLabels = { love: '연애/관계', career: '일/진로', today: '오늘 하루' };

    const userMessage = `## 뽑은 카드
- 카드: ${body.card.nameKo} (${body.card.name})
- 키워드: ${body.card.keywords.join(', ')}

## 질문 유형
- ${questionLabels[body.questionType]}

이 카드를 위 질문 유형에 맞게 해석해주세요.`;

    const aiResponse = await generateResponse(SYSTEM_PROMPT, userMessage, {
      maxTokens: 1024,
      temperature: 0.8,
    });

    const result = parseJSONResponse<TarotInterpretation>(aiResponse.content);

    return NextResponse.json({ result }, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    console.error('[/api/tarot] 타로 해석 오류:', error);
    return NextResponse.json({ error: '타로 해석 생성 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
