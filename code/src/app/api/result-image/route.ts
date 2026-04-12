// ==========================================
// POST /api/result-image — 결과 화면 AI 이미지 생성
// ==========================================
//
// 모든 운세 타입(사주/타로/MBTI/궁합/관상)의 결과를 바탕으로
// 행동 중심 일러스트를 생성합니다.

import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

interface ResultImageRequest {
  prompt: string;
}

export async function POST(request: Request) {
  try {
    const body: ResultImageRequest = await request.json();

    if (!body.prompt) {
      return NextResponse.json({ error: '프롬프트가 필요합니다.' }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: '이미지 생성 서비스가 설정되지 않았습니다.' }, { status: 503 });
    }

    const ai = new GoogleGenAI({ apiKey });

    const imagePrompt = `${body.prompt}

Style requirements:
- Show a single person (seen from behind or side, face not fully visible) doing the described activity
- Warm, cozy, lo-fi illustration style
- Soft pastel or muted color palette
- Modern Korean aesthetic, Instagram-worthy
- NO text, NO letters, NO words in the image
- Square format (1:1 ratio)
- Clean, minimal, simple composition
- Low detail, flat colors, minimal shading`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: imagePrompt,
      config: {
        responseModalities: ['IMAGE'],
      } as Record<string, unknown>,
    });

    const parts = response.candidates?.[0]?.content?.parts;
    if (!parts) {
      return NextResponse.json({ error: '이미지 생성에 실패했습니다.' }, { status: 500 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const imagePart = parts.find((p: any) => p.inlineData);
    if (!imagePart?.inlineData) {
      return NextResponse.json({ error: '이미지를 생성하지 못했습니다.' }, { status: 500 });
    }

    const inlineData = imagePart.inlineData as { data: string; mimeType: string };

    return NextResponse.json({
      image: `data:${inlineData.mimeType};base64,${inlineData.data}`,
    }, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('[/api/result-image] 이미지 생성 오류:', errMsg, error);
    return NextResponse.json({ error: `이미지 생성 실패: ${errMsg}` }, { status: 500 });
  }
}
