// ==========================================
// POST /api/face — AI 관상 분석 API (Claude Vision)
// ==========================================

import { NextResponse } from 'next/server';
import { getAnthropicClient, parseJSONResponse } from '@/lib/ai/client';

const SYSTEM_PROMPT = `당신은 K-감성 AI 관상 크리에이터입니다.
사용자의 얼굴 사진을 보고 재미있고 긍정적인 관상 분석을 제공합니다.

## 핵심 방향
- 이것은 엔터테인먼트 콘텐츠입니다. 과학적 분석이 아닙니다.
- 얼굴의 전체적인 인상, 이목구비의 조화, 표정 등을 바탕으로 분석
- 반드시 긍정적이고 재미있는 톤 유지
- 트렌디하고 친근한 말투 ("~해요", "~이에요")
- 외모 비하, 부정적 평가 절대 금지

## 규칙
- 첫인상: 이 사람을 처음 봤을 때의 느낌
- 성격 & 성향: 얼굴에서 읽히는 성격적 특성
- 숨겨진 매력 포인트: 이 사람만의 독특한 매력
- 모든 내용은 긍정적으로 표현

## 절대 금지
- 나이 추정
- 외모 비하 또는 부정적 평가
- 성별/인종 관련 편견
- 의료적 판단 (피부 상태 등)

## 출력 형식
반드시 아래 JSON 형식으로만 응답하세요.

{
  "title": "관상 한 줄 타이틀 (예: 타고난 리더형 관상)",
  "firstImpression": "첫인상 분석 (2~3문장, 60~100자)",
  "personality": "성격 & 성향 분석 (3~4문장, 100~150자)",
  "charm": "숨겨진 매력 포인트 (2~3문장, 60~100자)",
  "oneLiner": "공유하고 싶은 한 줄 카피 (20~40자)"
}`;

interface FaceInterpretation {
  title: string;
  firstImpression: string;
  personality: string;
  charm: string;
  oneLiner: string;
}

// 이미지 크기 제한 (5MB)
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.image) {
      return NextResponse.json({ error: '이미지가 필요합니다.', retryable: false }, { status: 400 });
    }

    // base64 크기 체크 (대략적)
    if (body.image.length > MAX_IMAGE_SIZE * 1.37) {
      return NextResponse.json({ error: '이미지가 너무 큽니다. 5MB 이하의 사진을 사용해주세요.', retryable: false }, { status: 413 });
    }

    // data:image/jpeg;base64,... 형식에서 미디어 타입과 데이터 분리
    const matches = body.image.match(/^data:(.+);base64,(.+)$/);
    if (!matches) {
      return NextResponse.json({ error: '올바른 이미지 형식이 아닙니다.', retryable: false }, { status: 400 });
    }

    const mediaType = matches[1] as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp';
    const imageData = matches[2];

    // 지원하는 이미지 타입 확인
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(mediaType)) {
      return NextResponse.json(
        { error: 'JPG, PNG, GIF, WEBP 형식의 이미지만 지원합니다.', retryable: false },
        { status: 400 },
      );
    }

    const client = getAnthropicClient();

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      temperature: 0.8,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: imageData,
              },
            },
            {
              type: 'text',
              text: '이 사람의 관상을 분석해주세요. 긍정적이고 재미있게 풀어주세요.',
            },
          ],
        },
      ],
    });

    const textBlock = response.content.find(block => block.type === 'text');
    const content = textBlock ? textBlock.text : '';

    let result: FaceInterpretation;
    try {
      result = parseJSONResponse<FaceInterpretation>(content);
    } catch {
      // JSON 파싱 실패 = 얼굴 사진이 아니거나 분석 불가
      return NextResponse.json(
        { error: '얼굴을 인식하기 어려운 사진이에요. 정면 셀카로 다시 시도해주세요.', retryable: false },
        { status: 400 },
      );
    }

    return NextResponse.json({ result }, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    console.error('[/api/face] 관상 분석 오류:', error);
    const message = error instanceof Error ? error.message : '';
    if (message.includes('Could not process image') || message.includes('image')) {
      return NextResponse.json({ error: '얼굴을 인식하기 어려운 사진이에요. 정면 셀카로 다시 시도해주세요.', retryable: false }, { status: 400 });
    }
    return NextResponse.json({ error: '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.', retryable: true }, { status: 500 });
  }
}
