// ==========================================
// 오행 (五行) 분석
// ==========================================
//
// [이 파일이 하는 일]
// 사주 팔자(8글자)에서 오행(목/화/토/금/수)이 각각 몇 개인지 세고,
// "일간"(나 자신)의 힘이 강한지 약한지를 판단합니다.
//
// [왜 중요한가?]
// 오행의 균형과 일간의 강약은 사주 해석의 핵심입니다.
// - 오행이 골고루 있으면 → 균형잡힌 성격
// - 특정 오행이 과다하면 → 해당 기운이 성격/운세에 강하게 작용
// - 특정 오행이 0개면   → 해당 기운이 부족하여 보완이 필요
//
// [일간 강약이란?]
// 일간(일주의 천간) = "나 자신"
// 나를 도와주는 오행이 많으면 → 신강(강함): 독립적, 주관 뚜렷
// 나를 도와주는 오행이 적으면 → 신약(약함): 협력적, 유연함
// 이에 따라 운세 해석 방향이 완전히 달라집니다.

import {
  FIVE_ELEMENTS,
  STEM_ELEMENT,
  BRANCH_ELEMENT,
  ELEMENT_GENERATES,
  ELEMENT_OVERCOMES,
  type FiveElement,
  type FourPillars,
  type FiveElementProfile,
  type DayMasterStrength,
  type HeavenlyStem,
} from './types';

/**
 * 사주 팔자에서 오행 개수를 셉니다.
 *
 * 사주 4기둥 × 각 2글자(천간+지지) = 최대 8글자
 * (시주가 없으면 6글자)
 *
 * 각 글자가 어떤 오행에 속하는지 매핑 테이블(types.ts)을 참조하여 집계합니다.
 *
 * 예: 을해 기묘 경오 임오
 *   천간: 을(목) 기(토) 경(금) 임(수) → 목1, 토1, 금1, 수1
 *   지지: 해(수) 묘(목) 오(화) 오(화) → 수1, 목1, 화2
 *   합계: 목2, 화2, 토1, 금1, 수2
 */
export function countFiveElements(fourPillars: FourPillars): Record<FiveElement, number> {
  // 오행 카운터 초기화
  const counts: Record<FiveElement, number> = {
    '목': 0, '화': 0, '토': 0, '금': 0, '수': 0,
  };

  // 년주, 월주, 일주는 항상 존재
  const pillars = [fourPillars.year, fourPillars.month, fourPillars.day];
  // 시주는 출생 시간을 아는 경우에만 추가
  if (fourPillars.hour) pillars.push(fourPillars.hour);

  for (const pillar of pillars) {
    // 천간의 오행을 카운트 (예: '갑' → '목' → 목 +1)
    counts[STEM_ELEMENT[pillar.stem]]++;
    // 지지의 오행을 카운트 (예: '자' → '수' → 수 +1)
    counts[BRANCH_ELEMENT[pillar.branch]]++;
  }

  return counts;
}

/**
 * 오행 비율 계산 (전체 대비 각 오행의 비율)
 * 예: 목2/8 = 0.25 (25%)
 */
function calculateRatios(counts: Record<FiveElement, number>): Record<FiveElement, number> {
  const total = Object.values(counts).reduce((sum, c) => sum + c, 0);
  if (total === 0) {
    return { '목': 0, '화': 0, '토': 0, '금': 0, '수': 0 };
  }

  const ratios = {} as Record<FiveElement, number>;
  for (const element of FIVE_ELEMENTS) {
    // 소수점 둘째 자리까지 반올림 (예: 0.25)
    ratios[element] = Math.round((counts[element] / total) * 100) / 100;
  }
  return ratios;
}

/**
 * 가장 많은 오행(강세)과 0개인 오행(부족)을 찾습니다.
 *
 * - dominant: 개수가 가장 많은 오행 → 성격/운세에 강하게 영향
 * - lacking: 개수가 0인 오행 → 보완이 필요한 기운 (전부 1 이상이면 null)
 */
function findDominantAndLacking(counts: Record<FiveElement, number>): {
  dominant: FiveElement;
  lacking: FiveElement | null;
} {
  let dominant: FiveElement = '목';
  let lacking: FiveElement | null = null;
  let maxCount = 0;
  let minCount = Infinity;

  for (const element of FIVE_ELEMENTS) {
    if (counts[element] > maxCount) {
      maxCount = counts[element];
      dominant = element;
    }
    if (counts[element] < minCount) {
      minCount = counts[element];
      lacking = element;
    }
  }

  // 최소 개수가 1 이상이면 "부족한 오행 없음"
  if (minCount > 0) lacking = null;

  return { dominant, lacking };
}

/**
 * 오행 프로필 전체를 계산하는 메인 함수
 * countFiveElements → calculateRatios → findDominantAndLacking 순서로 처리
 */
export function analyzeFiveElements(fourPillars: FourPillars): FiveElementProfile {
  const counts = countFiveElements(fourPillars);
  const ratios = calculateRatios(counts);
  const { dominant, lacking } = findDominantAndLacking(counts);

  return { counts, ratios, dominant, lacking };
}

/**
 * 일간(日干)의 강약을 판단합니다.
 *
 * [판단 기준]
 * 나(일간)를 돕는 세력의 비율로 판단합니다:
 *
 * 1) 비겁(比劫) — 나와 같은 오행: 동료, 경쟁자 (나를 직접 도움)
 *    예: 일간이 경(금)이면, 사주에 금이 몇 개?
 *
 * 2) 인성(印星) — 나를 생(生)해주는 오행: 어머니, 학문 (나에게 힘을 줌)
 *    예: 일간이 경(금)이면, 토가 금을 생해주므로 토가 몇 개?
 *    (토생금: 흙에서 금속이 나옴)
 *
 * (비겁 + 인성) ÷ 전체 = 나를 돕는 비율
 *   40% 이상 → 신강(strong): 자기 힘이 강함
 *   25% 이하 → 신약(weak): 도움이 필요함
 *   그 사이 → 중화(balanced): 균형잡힘
 */
export function analyzeDayMasterStrength(
  fourPillars: FourPillars,
  dayMaster: HeavenlyStem,
): DayMasterStrength {
  const dayElement = STEM_ELEMENT[dayMaster]; // 일간의 오행 (예: 경 → 금)
  const counts = countFiveElements(fourPillars);
  const total = Object.values(counts).reduce((sum, c) => sum + c, 0);

  if (total === 0) return 'balanced';

  // 1) 비겁: 나와 같은 오행의 개수
  const sameElementCount = counts[dayElement];

  // 2) 인성: 나를 생해주는 오행 찾기
  // ELEMENT_GENERATES[x] === dayElement인 x를 찾음
  // 예: dayElement가 '금'이면, '토'→'금' 이므로 generatingElement = '토'
  let generatingElement: FiveElement | null = null;
  for (const element of FIVE_ELEMENTS) {
    if (ELEMENT_GENERATES[element] === dayElement) {
      generatingElement = element;
      break;
    }
  }
  const generatingCount = generatingElement ? counts[generatingElement] : 0;

  // 나를 돕는 세력의 비율
  const supportRatio = (sameElementCount + generatingCount) / total;

  if (supportRatio >= 0.4) return 'strong';   // 40% 이상 → 신강
  if (supportRatio <= 0.25) return 'weak';     // 25% 이하 → 신약
  return 'balanced';                            // 그 사이 → 중화
}

/**
 * 두 오행 간의 관계를 반환합니다.
 *
 * 가능한 관계:
 * - same: 같은 오행 (예: 목↔목)
 * - generates: element1이 element2를 생함 (예: 목→화)
 * - generated_by: element1이 element2에 의해 생함 (예: 화←목 = 목이 화를 생해줌)
 * - overcomes: element1이 element2를 극함 (예: 목→토)
 * - overcome_by: element1이 element2에 의해 극함 (예: 목←금 = 금이 목을 자름)
 *
 * 이 관계는 일진 분석, 십신 판단 등 여러 곳에서 활용됩니다.
 */
export function getElementRelation(
  element1: FiveElement,
  element2: FiveElement,
): 'same' | 'generates' | 'generated_by' | 'overcomes' | 'overcome_by' {
  if (element1 === element2) return 'same';
  if (ELEMENT_GENERATES[element1] === element2) return 'generates';
  if (ELEMENT_GENERATES[element2] === element1) return 'generated_by';
  if (ELEMENT_OVERCOMES[element1] === element2) return 'overcomes';
  if (ELEMENT_OVERCOMES[element2] === element1) return 'overcome_by';
  return 'same'; // fallback (이론상 도달하지 않음)
}

/**
 * 오행 분석 결과를 사람이 읽기 쉬운 문자열로 변환
 * 예: "[목:2 화:3 토:1 금:1 수:1] 강세: 화, 부족: 없음"
 */
export function fiveElementsToString(profile: FiveElementProfile): string {
  const parts = FIVE_ELEMENTS.map(e => `${e}:${profile.counts[e]}`);
  const extra = [];
  extra.push(`강세: ${profile.dominant}`);
  if (profile.lacking) extra.push(`부족: ${profile.lacking}`);
  return `[${parts.join(' ')}] ${extra.join(', ')}`;
}
