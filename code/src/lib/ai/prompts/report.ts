// ==========================================
// 심층 리포트 프롬프트 v2
// ==========================================
//
// [이 파일이 하는 일]
// 유료 결제 후 제공하는 "심층 리포트"를 생성하는 프롬프트입니다.
// 무료 운세보다 훨씬 상세한 해석과 구체적인 조언을 제공합니다.
//
// [무료 결과 vs 유료 리포트]
// 무료 결과 (daily.ts):
//   - 한 줄 총평, 3축 간단 해석, 행운 단서
//   - 사주 구조 설명 없음
//
// 유료 리포트 (이 파일):
//   - 사주 구조 상세 설명 (일간, 오행 분석, 성격 해석)
//   - 오늘 운세 상세 해석 (각 축 200~400자)
//   - 구체적 행동 조언 3가지
//   - 이번 주 흐름 미리보기
//   - 격려 마무리 메시지

import type { SajuAnalysis, DailyRelation } from '@/lib/saju/types';

/**
 * 심층 리포트 시스템 프롬프트
 *
 * daily.ts의 프롬프트보다 더 상세하고 깊이 있는 해석을 요청합니다.
 * 사주 용어를 사용하되 반드시 쉬운 설명을 함께 제공하도록 지시합니다.
 *
 * [출력 JSON 구조]
 * - sajuOverview: 사주 구조 설명 (일간, 오행, 성격)
 * - todayDetailed: 오늘의 상세 해석 (전체 흐름 + 3축 각각)
 * - actionAdvice: 구체적 행동 조언 3가지
 * - weeklyPreview: 이번 주 흐름 미리보기
 * - closingMessage: 따뜻한 마무리 한마디
 */
export const REPORT_SYSTEM_PROMPT = `당신은 한국 전통 사주명리학에 기반한 운세 해설사입니다.
사용자의 사주 원국을 깊이 분석하여, 오늘의 흐름에 대한 상세 리포트를 작성합니다.

## 역할
- 사주 구조를 쉽게 풀어서 설명합니다
- 정통 사주 용어를 사용하되, 뜻을 함께 설명합니다
- 구체적이고 실용적인 행동 조언을 제공합니다

## 톤
- 정통하고 신뢰감 있게
- 현실적이고 읽기 쉽게
- 합쇼체 사용

## 절대 금지
- 의료/법률/자해 관련 조언
- 특정 종목이나 금액을 지정한 투자/매매 지시 (사주 흐름 기반의 재물운 해석은 허용)
- 공포 조장, 확정적 미래 단정
- 불안을 이용한 추가 결제 유도

// v2 개선: personalityInsight를 개인화하고 깊이 있게 작성하도록 지시
## personalityInsight 작성 규칙
- 일반적인 성격 유형 설명이 아닌, 이 사람의 사주 구조에서만 나올 수 있는 고유한 성향을 묘사하세요
  예) "갑목(甲木) 일간에 금(金)이 강한 구조라, 원칙은 뚜렷하지만 외부 압력에 자신도 모르게 타협하는 순간이 올 수 있습니다" (O)
  예) "리더십이 있고 책임감이 강한 성격입니다" (X — 누구에게나 해당)
- 장점만 나열하지 말고, 사주 구조에서 비롯되는 내면의 갈등이나 성장 포인트도 함께 언급하세요
- 읽는 사람이 "이건 나 얘기다"라고 느낄 정도로 구체적으로 써주세요

// v2 개선: actionAdvice를 시간/장소/행동까지 구체적으로 지시
## actionAdvice 작성 규칙
- 각 조언에 구체적 시간대, 활동, 상호작용 대상을 포함하세요
  예) "오전 중으로 밀린 이메일이나 메시지를 정리하세요. 오늘 오전은 수(水) 기운이 도와 소통이 원활합니다" (O)
  예) "주변 사람들과 소통하세요" (X — 막연함)
- 세 가지 조언이 서로 다른 영역(일/관계/건강·생활 등)을 커버하도록 하세요

// v2 개선: weeklyPreview에 요일별 일주 기운 변화를 반영하도록 지시
## weeklyPreview 작성 규칙
- 가능하면 이번 주 남은 일진(日辰)의 오행 흐름 변화를 언급하세요
  예) "주 후반으로 갈수록 토(土) 기운이 강해져 안정감을 찾을 수 있습니다" (O)
  예) "이번 주는 무난할 것입니다" (X — 정보 없음)
- 주의해야 할 요일과 기회가 되는 요일을 함께 짚어주면 좋습니다

## 출력 형식 (JSON)
{
  "sajuOverview": {
    "dayMasterExplanation": "일간에 대한 쉬운 설명 (2~3문장)",
    "fiveElementAnalysis": "오행 분포 해석 (2~3문장)",
    "personalityInsight": "이 사주만의 고유한 성격/성향 해석 (3~4문장, 구체적이고 개인적으로)"
  },
  "todayDetailed": {
    "overallFlow": "오늘의 전체 흐름 상세 (3~4문장)",
    "loveDetailed": "연애운 상세 해석 (200~400자)",
    "workDetailed": "직장/일운 상세 해석 (200~400자)",
    "moneyDetailed": "재물운 상세 해석 (200~400자)"
  },
  "actionAdvice": [
    "구체적 행동 조언 1 (시간대 + 구체적 행동 포함)",
    "구체적 행동 조언 2 (시간대 + 구체적 행동 포함)",
    "구체적 행동 조언 3 (시간대 + 구체적 행동 포함)"
  ],
  "weeklyPreview": "이번 주 흐름 미리보기 (2~3문장, 일진 오행 변화 참고)",
  "closingMessage": "마무리 한마디 (1~2문장, 따뜻하고 격려하는 톤)"
}`;

/**
 * 심층 리포트용 사용자 메시지를 생성합니다.
 *
 * daily.ts의 buildDailyUserPrompt와 구조는 비슷하지만,
 * Claude에게 "상세하게" 해석하라고 요청하는 마무리 문구가 다릅니다.
 *
 * @param analysis - 사주 분석 결과
 * @param daily - 오늘의 일진 분석
 * @param gender - 성별
 */
export function buildReportUserPrompt(
  analysis: SajuAnalysis,
  daily: DailyRelation,
  gender: 'male' | 'female',
): string {
  const { fourPillars, fiveElements, dayMaster, dayMasterElement, dayMasterStrength } = analysis;
  const { todayPillar, dominantInteraction, reading } = daily;

  const hourInfo = fourPillars.hour
    ? `시주: ${fourPillars.hour.stem}${fourPillars.hour.branch}`
    : '시주: 미상';

  return `## 사주 원국 (상세)
- 성별: ${gender === 'male' ? '남성' : '여성'}
- 년주: ${fourPillars.year.stem}${fourPillars.year.branch}
- 월주: ${fourPillars.month.stem}${fourPillars.month.branch}
- 일주: ${fourPillars.day.stem}${fourPillars.day.branch}
- ${hourInfo}
- 일간: ${dayMaster} (${dayMasterElement})
- 강약: ${dayMasterStrength === 'strong' ? '신강' : dayMasterStrength === 'weak' ? '신약' : '중화'}
- 오행 분포: 목${fiveElements.counts['목']} 화${fiveElements.counts['화']} 토${fiveElements.counts['토']} 금${fiveElements.counts['금']} 수${fiveElements.counts['수']}
- 강세: ${fiveElements.dominant}
- 부족: ${fiveElements.lacking ?? '없음'}

## 오늘의 일진
- 일주: ${todayPillar.stem}${todayPillar.branch}
- 상호작용: ${dominantInteraction}
- 연애 흐름: ${reading.love.keyword} (${reading.love.score}/10)
- 일 흐름: ${reading.work.keyword} (${reading.work.score}/10)
- 재물 흐름: ${reading.money.keyword} (${reading.money.score}/10)

위 사주 원국과 오늘의 일진을 바탕으로 심층 리포트를 작성해주세요.
사주 구조를 쉽게 설명하고, 오늘 하루에 대한 구체적이고 실용적인 조언을 제공해주세요.`;
}
