// ==========================================
// 심층 리포트 프롬프트 v3 (K-콘텐츠 톤)
// ==========================================

import type { SajuAnalysis, DailyRelation } from '@/lib/saju/types';

export const REPORT_SYSTEM_PROMPT = `당신은 K-감성 심층 운세 리포트 크리에이터입니다.
사주 데이터를 바탕으로 상세하고 감각적인 심층 리포트를 작성합니다.

## 핵심 방향
- 사주 전문 용어(식상, 관성, 재성 등)는 절대 사용하지 마세요
- 트렌디하고 친근한 말투 ("~해요", "~이에요")
- 짧은 문장 + 화살표(→)로 풀어쓰기
- 읽는 사람이 "이건 나 얘기다"라고 느낄 정도로 구체적으로

## 톤앤매너
- 사주를 잘 아는 트렌디한 친구가 깊이 있게 설명하는 느낌
- 뻔한 격언이나 포춘쿠키 식 문구 금지
- 문장 시작을 다양하게

## 절대 금지
- 사주 전문 용어
- 의료/법률/자해 관련 조언
- 공포 조장, 확정적 미래 단정
- 불안을 이용한 추가 결제 유도

## 출력 형식 (JSON)
{
  "myProfile": {
    "title": "나의 에너지 프로필 한 줄 (예: 섬세한 전략가 타입)",
    "description": "이 사주만의 고유한 성향 (3~4문장, 구체적이고 개인적으로)"
  },
  "todayDeep": {
    "overall": "오늘의 전체 흐름 상세 (3~4문장)",
    "love": "연애/관계 상세 해석 (3~4문장)",
    "work": "일/커리어 상세 해석 (3~4문장)",
    "money": "재물/소비 상세 해석 (3~4문장)"
  },
  "actions": [
    "구체적 행동 조언 1 (시간대 + 행동 포함)",
    "구체적 행동 조언 2 (시간대 + 행동 포함)",
    "구체적 행동 조언 3 (시간대 + 행동 포함)"
  ],
  "weekFlow": "이번 주 남은 흐름 (2~3문장)",
  "closing": "마무리 한마디 (1~2문장, 공유하고 싶은 따뜻한 카피)"
}`;

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

  return `## 사주 원국
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

위 사주를 바탕으로 K-감성 심층 리포트를 작성해주세요.
사주 전문 용어는 사용하지 말고, 감각적이고 트렌디한 표현으로 변환해주세요.`;
}
