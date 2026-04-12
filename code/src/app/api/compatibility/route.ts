// ==========================================
// POST /api/compatibility — 궁합 분석 API
// ==========================================

import { NextResponse } from 'next/server';
import { generateResponse, parseJSONResponse } from '@/lib/ai/client';

const SYSTEM_PROMPT = `당신은 K-감성 궁합 분석 크리에이터입니다.
두 사람의 생년월일과 성별을 바탕으로 궁합을 분석합니다.

## 톤앤매너
- 트렌디하고 친근한 말투 ("~해요", "~이에요")
- 긍정적이고 재미있는 톤
- 사주 전문 용어 사용 금지
- 공유하고 싶어지는 한 줄 카피 포함

## 규칙
- 생년월일 기반으로 두 사람의 성격/에너지 궁합을 분석
- 연애 궁합, 친구 궁합, 일 궁합 3축으로 나눠 분석
- 각 축별 점수(1~100)와 해석 제공
- 총점은 3축 평균이 아닌 종합적으로 판단
- 부정적인 결과도 건설적으로 표현 (최소 50점 이상)
- 확정적 예언이나 관계 파괴적 표현 금지

## 출력 형식
반드시 아래 JSON 형식으로만 응답하세요.

{
  "totalScore": 87,
  "summary": "궁합 한 줄 요약 (20~40자)",
  "love": {
    "score": 90,
    "interpretation": "연애 궁합 해석 (2~3문장, 60~100자)"
  },
  "friendship": {
    "score": 85,
    "interpretation": "친구 궁합 해석 (2~3문장, 60~100자)"
  },
  "work": {
    "score": 78,
    "interpretation": "일 궁합 해석 (2~3문장, 60~100자)"
  },
  "advice": "이 관계를 위한 구체적 조언 (2~3문장, 60~100자)",
  "oneLiner": "공유하고 싶은 한 줄 카피 (20~40자)"
}`;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { person1, person2 } = body;

    if (!person1 || !person2) {
      return NextResponse.json({ error: '두 사람의 정보가 필요합니다.' }, { status: 400 });
    }

    const userMessage = `## 첫 번째 사람
- 이름: ${person1.name}
- 생년월일: ${person1.birthYear}년 ${person1.birthMonth}월 ${person1.birthDay}일
- 성별: ${person1.gender === 'male' ? '남성' : '여성'}

## 두 번째 사람
- 이름: ${person2.name}
- 생년월일: ${person2.birthYear}년 ${person2.birthMonth}월 ${person2.birthDay}일
- 성별: ${person2.gender === 'male' ? '남성' : '여성'}

두 사람의 궁합을 분석해주세요.`;

    const aiResponse = await generateResponse(SYSTEM_PROMPT, userMessage, {
      maxTokens: 1024,
      temperature: 0.8,
    });

    const result = parseJSONResponse<{
      totalScore: number;
      summary: string;
      love: { score: number; interpretation: string };
      friendship: { score: number; interpretation: string };
      work: { score: number; interpretation: string };
      advice: string;
      oneLiner: string;
    }>(aiResponse.content);

    return NextResponse.json({ result }, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    console.error('[/api/compatibility] 궁합 분석 오류:', error);
    return NextResponse.json({ error: '궁합 분석 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
