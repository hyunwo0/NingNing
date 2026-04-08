// ==========================================
// Claude API 클라이언트
// ==========================================
//
// [이 파일이 하는 일]
// Anthropic의 Claude AI에게 메시지를 보내고 응답을 받는 기능을 제공합니다.
// 사주 데이터를 Claude에게 전달하면, Claude가 자연스러운 한국어로
// 운세 해석 문장을 생성해줍니다.
//
// [사용 흐름]
// 1) 사주 엔진(lib/saju)이 계산한 사주 데이터를
// 2) 프롬프트 템플릿(lib/ai/prompts)으로 포맷팅한 뒤
// 3) 이 클라이언트를 통해 Claude API에 전송
// 4) Claude의 응답(JSON 형태의 운세 해석)을 파싱하여 사용

import Anthropic from '@anthropic-ai/sdk';

// Claude API 클라이언트 싱글톤 (앱 전체에서 하나만 생성)
let clientInstance: Anthropic | null = null;

/**
 * Anthropic API 클라이언트를 반환합니다. (싱글톤 패턴)
 *
 * 싱글톤이란: 클라이언트 객체를 매번 새로 만들지 않고,
 * 처음 한 번만 만들어두고 재사용하는 패턴입니다.
 * → 불필요한 객체 생성을 줄여 성능을 최적화합니다.
 *
 * API 키는 환경변수(ANTHROPIC_API_KEY)에서 가져옵니다.
 * (.env.local 파일에 설정)
 */
export function getAnthropicClient(): Anthropic {
  if (!clientInstance) {
    clientInstance = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY, // .env.local에 설정된 API 키
    });
  }
  return clientInstance;
}

// AI 응답의 구조를 정의하는 인터페이스
export interface AIResponse {
  content: string;  // Claude가 생성한 텍스트 (보통 JSON 형태)
  usage: {
    inputTokens: number;  // 입력에 사용된 토큰 수 (비용 계산용)
    outputTokens: number; // 출력에 사용된 토큰 수 (비용 계산용)
  };
}

/**
 * Claude API에 메시지를 보내고 응답을 받습니다.
 *
 * @param systemPrompt - AI의 역할/규칙을 정의하는 시스템 프롬프트
 *                       예: "당신은 사주 해설사입니다. JSON으로 응답하세요."
 * @param userMessage  - 실제 사주 데이터와 요청 내용
 *                       예: "년주: 을해, 월주: 기묘, ... 오늘의 운세를 해석해주세요."
 * @param options      - 선택적 설정
 *   - maxTokens: 응답 최대 길이 (기본 2048 토큰 ≈ 약 1500자)
 *   - temperature: 창의성 수준 (0=보수적, 1=창의적, 기본 0.7)
 *
 * @returns AI 응답 텍스트와 토큰 사용량
 */
export async function generateResponse(
  systemPrompt: string,
  userMessage: string,
  options?: { maxTokens?: number; temperature?: number },
): Promise<AIResponse> {
  const client = getAnthropicClient();

  // Claude API 호출
  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',       // 사용할 Claude 모델
    max_tokens: options?.maxTokens ?? 2048,   // 최대 응답 길이
    temperature: options?.temperature ?? 0.7,  // 창의성 수준 (0.7 = 적당히 다양하게)
    system: systemPrompt,                      // 시스템 프롬프트 (AI의 역할 정의)
    messages: [
      { role: 'user', content: userMessage }, // 사용자 메시지 (사주 데이터 + 요청)
    ],
  });

  // 응답에서 텍스트 블록을 추출
  // (Claude 응답은 여러 블록으로 올 수 있는데, 텍스트 타입만 사용)
  const textBlock = response.content.find(block => block.type === 'text');
  const content = textBlock ? textBlock.text : '';

  return {
    content,
    usage: {
      inputTokens: response.usage.input_tokens,   // 입력 토큰 (= 비용의 일부)
      outputTokens: response.usage.output_tokens,  // 출력 토큰 (= 비용의 일부)
    },
  };
}

/**
 * Claude가 반환한 텍스트에서 JSON을 추출하고 파싱합니다.
 *
 * Claude는 가끔 JSON을 ```json ... ``` 코드블록 안에 넣어서 반환합니다.
 * 이 함수는 코드블록이 있으면 안의 내용만 추출하고,
 * 없으면 전체 텍스트를 그대로 JSON으로 파싱합니다.
 *
 * @param content - Claude가 반환한 텍스트
 * @returns 파싱된 JSON 객체 (타입 T로 캐스팅)
 */
export function parseJSONResponse<T>(content: string): T {
  // ```json ... ``` 패턴이 있는지 확인하고, 있으면 안의 내용만 추출
  const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonStr = jsonMatch ? jsonMatch[1].trim() : content.trim();
  return JSON.parse(jsonStr) as T;
}
