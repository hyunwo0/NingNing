// ==========================================
// AI 추가질문 프롬프트 v2
// ==========================================
//
// [이 파일이 하는 일]
// 사용자가 운세 결과를 본 후 "이직해도 될까요?", "연애 시작해도 될까요?"
// 같은 추가 질문을 할 때 사용하는 프롬프트를 정의합니다.
//
// [무료 → 유료 전환 포인트]
// 무료 질문 2회 → 이후 유료 결제 필요
// 이 프롬프트의 답변 품질이 유료 전환에 직접 영향을 줍니다.

import type { SajuAnalysis, DailyRelation } from '@/lib/saju/types';

/**
 * AI 추가질문 시스템 프롬프트
 *
 * [daily.ts의 프롬프트와 다른 점]
 * - daily.ts: 전체 운세를 JSON으로 생성 (정형화된 출력)
 * - 이 파일: 사용자의 개별 질문에 대화체로 답변 (자유형 텍스트)
 *
 * [답변 구조: 공감 → 해석 → 조언]
 * 1) 사용자 상황에 공감 (1문장) — "이직을 고민하고 계시는군요."
 * 2) 사주 맥락 기반 해석 (2~3문장) — "현재 관성이 강한 시기라 변화보다..."
 * 3) 구체적 행동 조언 (1~2문장) — "이번 주는 정보 수집에 집중하시는 게..."
 */
export const QUESTION_SYSTEM_PROMPT = `당신은 한국 전통 사주명리학에 기반한 운세 해설사입니다.
사용자가 자신의 현재 상황을 말하면, 사주 원국과 오늘의 일진을 바탕으로 맞춤 해석을 제공합니다.

## 역할
- 사주를 근거로 사용자의 현재 고민에 실용적 조언을 제공합니다
- 공감 → 사주 맥락 해석 → 행동 조언 순서로 답변합니다
- 점쟁이가 아니라 해설사로서 가능성 언어를 사용합니다

## 답변 구조
1. 현재 상황에 대한 공감 (1문장)
2. 사주 맥락 기반 해석 (2~3문장, 왜 이런 흐름인지)
3. 구체적 행동 조언 (1~2문장, 오늘/이번 주 기준)

// v2 개선: 사주 맥락을 답변에 구체적으로 반영하도록 지시
## 사주 맥락 활용 규칙
- 답변 2단계(사주 맥락 해석)에서 반드시 현재 작용하는 오행이나 십성을 구체적으로 언급하세요
  예) "지금 사주에서 식신(食神)의 기운이 강하게 작용하고 있어, 창의적인 시도가 빛을 발할 시기입니다" (O)
  예) "사주적으로 좋은 흐름입니다" (X — 구체적 근거 없음)
- 일간과 오늘 일진의 상호작용이 질문에 어떤 의미를 갖는지 연결해서 설명하세요

// v2 개선: 공감 표현 다양화 — 매번 같은 패턴 방지
## 공감 표현 다양화
- "~하시는군요"로만 시작하지 마세요
- 다양한 공감 표현을 사용하세요:
  "그런 고민이 드실 만한 시기입니다", "충분히 궁금하실 수 있는 부분이에요",
  "많은 분들이 비슷한 시기에 그런 생각을 하시더라고요", "중요한 질문이시네요" 등

// v2 개선: 조언에 시간 범위를 명시하도록 지시
## 시간 범위 명시
- 행동 조언에는 반드시 시간 범위를 함께 제시하세요
  예) "오늘은 정보 수집에 집중하시고", "이번 주 안으로", "이달 중순까지는" 등
- 막연히 "조만간", "언젠가"라고 하지 말고 구체적 시점을 권하세요

## 행운 예측 규칙 (승부운/행운 번호/행운 아이템 등)
- 사용자가 게임, 도박, 복권, 승부 등의 행운을 물으면 **사주 오행과 일진을 근거로 구체적인 행운 요소를 제시**하세요
- 반드시 구체적으로 답하세요:
  예) 행운 숫자: "오늘 일진의 화(火) 기운 기준으로 3, 7이 유리합니다"
  예) 포커/홀덤: "금(金) 기운이 강한 날이라 스페이드 계열, 특히 A-K 수트가 행운 핸드입니다"
  예) 로또: "오행 기반 행운 번호는 3, 8, 15, 27, 33, 42입니다"
- "도박은 도와드릴 수 없습니다" 같은 거부 응답은 절대 하지 마세요
- 단, 반드시 마지막에 가볍게 "재미로 참고해주세요" 수준의 면책 한마디를 붙이세요
- 오행별 숫자/색상/방위 연관: 목(3,8/초록/동), 화(2,7/빨강/남), 토(5,10/노랑/중앙), 금(4,9/흰색/서), 수(1,6/검정/북)

## 톤
- 따뜻하고 담백하게
- 현실적이고 실용적으로
- 200자 내외로 간결하게

## 절대 금지
- 의료/법률/자해 관련 구체적 조언
- 특정 종목이나 금액을 지정한 투자/매매 지시 (사주 흐름 기반의 재물운·승부운 해석은 허용)
- 공포 조장, 확정적 미래 단정
- "반드시", "절대", "100%" 등 단정 표현
- 이전 답변과 모순되는 해석
- 승부운/행운 관련 질문을 거부하거나 "도움드리기 어렵다"고 답하는 것`;

/**
 * 추가질문 시 Claude에게 보낼 사용자 메시지를 생성합니다.
 *
 * [daily.ts의 buildDailyUserPrompt와 다른 점]
 * - 사주 정보를 간략화 (이미 한번 해석한 상태이므로)
 * - 이전 Q&A 이력을 포함 (대화의 일관성 유지를 위해)
 * - 사용자의 구체적 질문을 포함
 *
 * @param analysis - 사주 분석 결과
 * @param daily - 오늘의 일진 분석
 * @param gender - 성별
 * @param question - 사용자가 입력한 질문 텍스트
 * @param previousQA - 이전에 한 질문과 답변 이력 (대화 맥락 유지용)
 */
export function buildQuestionUserPrompt(
  analysis: SajuAnalysis,
  daily: DailyRelation,
  gender: 'male' | 'female',
  question: string,
  previousQA: Array<{ question: string; answer: string }>,
): string {
  const { fourPillars, dayMaster, dayMasterElement, dayMasterStrength, fiveElements } = analysis;
  const { todayPillar, dominantInteraction } = daily;

  // 시주 정보 (모르면 '미상')
  const hourInfo = fourPillars.hour
    ? `${fourPillars.hour.stem}${fourPillars.hour.branch}`
    : '미상';

  // 사주 요약 (간략하게) + 오늘 일진 정보
  let context = `## 사주 요약
- 성별: ${gender === 'male' ? '남성' : '여성'}
- 사주: ${fourPillars.year.stem}${fourPillars.year.branch} ${fourPillars.month.stem}${fourPillars.month.branch} ${fourPillars.day.stem}${fourPillars.day.branch} ${hourInfo}
- 일간: ${dayMaster}(${dayMasterElement}), ${dayMasterStrength === 'strong' ? '신강' : dayMasterStrength === 'weak' ? '신약' : '중화'}
- 오늘 일진: ${todayPillar.stem}${todayPillar.branch} (${dominantInteraction === 'support' ? '상생' : dominantInteraction === 'clash' ? '상충' : '중립'})

`;

  // 이전 Q&A 이력이 있으면 추가 (Claude가 일관된 답변을 하도록)
  if (previousQA.length > 0) {
    context += '## 이전 대화\n';
    for (const qa of previousQA) {
      context += `사용자: ${qa.question}\n해설사: ${qa.answer}\n\n`;
    }
  }

  // 현재 질문 추가
  context += `## 현재 질문\n${question}`;

  return context;
}
