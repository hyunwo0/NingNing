// ==========================================
// POST /api/celeb — 나와 맞는 연예인 매칭 API
// ==========================================

import { NextResponse } from 'next/server';
import { generateResponse, parseJSONResponse } from '@/lib/ai/client';

const SYSTEM_PROMPT = `당신은 K-감성 연예인 궁합 매칭 크리에이터입니다.
사용자의 생년월일 정보를 바탕으로 궁합이 잘 맞는 한국 연예인 3명을 추천합니다.

## 규칙
- 실제로 활동 중인 유명한 한국 연예인만 추천 (아이돌, 배우, 가수 등)
- 각 연예인과의 궁합 포인트를 재미있고 구체적으로 설명
- 사주/오행/성격적 궁합을 바탕으로 하되, 전문 용어는 사용하지 않기
- 트렌디하고 친근한 말투
- 팬덤 논란이 될 수 있는 비교나 순위 발언 금지

## 출력 형식
반드시 아래 JSON 형식으로만 응답하세요.

{
  "matches": [
    {
      "rank": 1,
      "name": "연예인 이름",
      "group": "소속 그룹/직업 (솔로면 직업)",
      "reason": "궁합 포인트 설명 (2~3문장, 60~100자)",
      "compatibility": "궁합 한 줄 요약 (예: 서로의 에너지를 채워주는 관계)"
    }
  ],
  "summary": "전체 매칭 결과 한 줄 정리 (20~40자)"
}`;

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const fiveElements = body.fiveElements;
    const elementCounts = fiveElements?.counts
      ? `목${fiveElements.counts['목']} 화${fiveElements.counts['화']} 토${fiveElements.counts['토']} 금${fiveElements.counts['금']} 수${fiveElements.counts['수']}`
      : '정보 없음';

    const userMessage = `## 사용자 정보
- 성별: ${body.gender === 'male' ? '남성' : '여성'}
- 생년: ${body.birthYear}년
- 생월: ${body.birthMonth}월
- 생일: ${body.birthDay}일
- 달력: ${body.calendarType === 'solar' ? '양력' : '음력'}
- 일간: ${body.dayMaster || '정보 없음'} (${body.dayMasterElement || ''})
- 오행 분포: ${elementCounts}

이 사람의 사주 특성을 바탕으로 궁합이 잘 맞는 한국 연예인 3명을 추천해주세요.
성별이 남성이면 여성 연예인을, 여성이면 남성 연예인을 위주로 추천하되, 동성도 괜찮습니다.
궁합 포인트는 오행이나 성격적 시너지를 바탕으로 설명해주세요.`;

    const aiResponse = await generateResponse(SYSTEM_PROMPT, userMessage, {
      maxTokens: 1024,
      temperature: 0.9,
    });

    const result = parseJSONResponse<{
      matches: { rank: number; name: string; group: string; reason: string; compatibility: string }[];
      summary: string;
    }>(aiResponse.content);

    return NextResponse.json({ result }, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    console.error('[/api/celeb] 연예인 매칭 오류:', error);
    return NextResponse.json({ error: '연예인 매칭 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
