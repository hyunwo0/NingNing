// ==========================================
// 오늘의 운세 (일진 기반)
// ==========================================
//
// [이 파일이 하는 일]
// 사주 원국(타고난 팔자)과 "오늘의 일진"을 비교해서
// 연애/일/재물 3개 축의 운세를 점수와 키워드로 산출합니다.
//
// [일진(日辰)이란?]
// 매일매일 바뀌는 간지(천간+지지)입니다. 60일을 주기로 순환합니다.
// 예: 오늘이 "갑자일"이면, 내일은 "을축일"
// 이 일진이 내 사주와 어떤 관계인지에 따라 그 날의 기운이 달라집니다.
//
// [전체 흐름]
// 1) 오늘의 일주(일진) 구하기
// 2) 내 일간(나 자신)과 오늘 일진의 오행 관계 분석
// 3) 십신(十神) 관계에 따라 3축 점수 가중
// 4) 점수 → 키워드 + 요약 문장 변환

import { getDayPillarForDate } from './pillars';
import { getElementRelation } from './five-elements';
import {
  STEM_ELEMENT,
  BRANCH_ELEMENT,
  ELEMENT_GENERATES,
  ELEMENT_OVERCOMES,
  type Pillar,
  type FourPillars,
  type SajuAnalysis,
  type DailyRelation,
  type DailyReading,
  type FiveElement,
  type HeavenlyStem,
} from './types';

/**
 * 오늘의 일주(日柱)를 가져옵니다.
 * 기본값은 오늘 날짜이며, 특정 날짜를 지정할 수도 있습니다.
 */
export function getTodayPillar(date: Date = new Date()): Pillar {
  return getDayPillarForDate(
    date.getFullYear(),
    date.getMonth() + 1, // JavaScript Date는 0~11이므로 +1
    date.getDate(),
  );
}

// ──────────────────────────────────────────
// 십신 (十神) 관계 판단
// ──────────────────────────────────────────
//
// [십신이란?]
// 일간(나)을 기준으로, 다른 천간과의 오행 관계를 분류한 것입니다.
// 사주 해석의 핵심 도구로, 각 십신마다 의미가 다릅니다:
//
// 비겁 (比劫): 나와 같은 오행 → 동료, 경쟁, 자존심
// 식상 (食傷): 내가 생(生)하는 오행 → 표현력, 재능, 자녀
// 재성 (財星): 내가 극(克)하는 오행 → 재물, 아버지, 현실 이득
// 관성 (官星): 나를 극(克)하는 오행 → 직장, 규율, 명예, 압박
// 인성 (印星): 나를 생(生)해주는 오행 → 학문, 어머니, 보호, 안정

// 실제로는 10개이지만(편/정 구분), 여기서는 5개 그룹으로 단순화
type TenGod = 'bijian' | 'jiecai' | '식신' | 'sanggwan' | 'pyeonjae' | 'jeongjae' | 'pyeongwan' | 'jeong_gwan' | 'pyeonin' | 'jeongin';

/**
 * 일간(나)과 대상 천간 사이의 십신 관계를 판단합니다.
 *
 * @param dayMaster - 내 일간. 예: '경'(금)
 * @param targetStem - 오늘 일진의 천간. 예: '갑'(목)
 * @returns 십신 그룹 이름. 예: '재성' (금→목 = 내가 극함 = 재성)
 */
function getTenGodRelation(dayMaster: HeavenlyStem, targetStem: HeavenlyStem): string {
  const myElement = STEM_ELEMENT[dayMaster];
  const targetElement = STEM_ELEMENT[targetStem];
  const relation = getElementRelation(myElement, targetElement);

  switch (relation) {
    case 'same': return '비겁';       // 같은 오행 → 비겁 (동료, 경쟁)
    case 'generates': return '식상';   // 내가 생하는 → 식상 (표현, 재능)
    case 'overcomes': return '재성';   // 내가 극하는 → 재성 (재물, 실질적 이득)
    case 'overcome_by': return '관성'; // 나를 극하는 → 관성 (직장, 책임, 압박)
    case 'generated_by': return '인성'; // 나를 생하는 → 인성 (학문, 보호, 안정)
    default: return '비겁';
  }
}

// ──────────────────────────────────────────
// 오늘 일진과 사주의 상호작용 판단
// ──────────────────────────────────────────

/**
 * 오늘의 기운이 나에게 도움이 되는지, 부딪히는지 판단합니다.
 *
 * - support: 오늘 기운이 나를 생해주거나, 같은 오행 → 순조로운 하루
 * - clash: 오늘 기운이 나를 극함 → 긴장감 있는 하루
 * - neutral: 그 외 → 평범한 하루
 */
function analyzeInteraction(
  dayMaster: HeavenlyStem,
  todayPillar: Pillar,
): 'support' | 'clash' | 'neutral' {
  const myElement = STEM_ELEMENT[dayMaster];
  const todayElement = STEM_ELEMENT[todayPillar.stem];
  const relation = getElementRelation(myElement, todayElement);

  if (relation === 'generated_by' || relation === 'same') return 'support';
  if (relation === 'overcome_by') return 'clash';
  return 'neutral';
}

// ──────────────────────────────────────────
// 3축 점수 계산 (연애/일/재물)
// ──────────────────────────────────────────

/**
 * 연애/일/재물 각 축의 점수를 계산합니다. (1~10점)
 *
 * 기본 점수 5점에서 시작하여, 십신 관계와 오행 상생/상극에 따라 가감합니다.
 *
 * [십신별 가중 규칙]
 * - 비겁(동료): 일 +1, 재물 -1 (경쟁이 생겨 돈이 나감)
 * - 식상(표현): 연애 +2, 일 +1 (감정 표현이 활발)
 * - 재성(재물): 재물 +3, 연애 +1 (돈과 적극성 모두 좋음)
 * - 관성(규율): 일 +2 (책임감, 일 중심)
 * - 인성(안정): 전체 +1 (고르게 안정적)
 *
 * [오행 상생/상극 보정]
 * 천간끼리, 지지끼리의 오행 관계에 따라 추가 보정합니다.
 */
function calculateAxisScores(
  dayMaster: HeavenlyStem,
  todayPillar: Pillar,
  fourPillars: FourPillars,
): { love: number; work: number; money: number } {
  const myElement = STEM_ELEMENT[dayMaster];
  const todayStemElement = STEM_ELEMENT[todayPillar.stem];     // 오늘 천간의 오행
  const todayBranchElement = BRANCH_ELEMENT[todayPillar.branch]; // 오늘 지지의 오행
  const tenGod = getTenGodRelation(dayMaster, todayPillar.stem);

  // 기본 점수 5점에서 시작
  let love = 5;
  let work = 5;
  let money = 5;

  // 십신에 따라 점수 가중
  switch (tenGod) {
    case '비겁': // 동료/경쟁 기운 → 일은 활발, 재물은 지출 경향
      love += 0; work += 1; money -= 1;
      break;
    case '식상': // 표현/재능 기운 → 연애에 유리, 창의적 업무에 좋음
      love += 2; work += 1; money += 0;
      break;
    case '재성': // 재물/실질 기운 → 돈에 가장 유리, 연애도 적극적
      love += 1; work += 0; money += 3;
      break;
    case '관성': // 규율/책임 기운 → 일에 집중, 연애는 진지하지만 무거움
      love += 0; work += 2; money += 0;
      break;
    case '인성': // 안정/보호 기운 → 전체적으로 고르게 좋음
      love += 1; work += 1; money += 1;
      break;
  }

  // 오행 상생/상극 보정
  const stemRelation = getElementRelation(myElement, todayStemElement);   // 천간끼리
  const branchRelation = getElementRelation(myElement, todayBranchElement); // 지지끼리

  if (stemRelation === 'generated_by') { love += 1; work += 1; }   // 나를 생해주면 → 전반적 좋음
  if (stemRelation === 'overcome_by') { work -= 1; money -= 1; }    // 나를 극하면 → 일/돈 주의
  if (branchRelation === 'generates') { money += 1; }               // 내가 생하면 → 재물 기회
  if (branchRelation === 'overcomes') { love -= 1; }                // 내가 극하면 → 연애 갈등

  // 점수를 1~10 범위로 제한 (범위 밖으로 나가지 않도록)
  const clamp = (n: number) => Math.max(1, Math.min(10, Math.round(n)));
  return { love: clamp(love), work: clamp(work), money: clamp(money) };
}

// ──────────────────────────────────────────
// 점수 → 키워드 / 요약 변환
// ──────────────────────────────────────────

/**
 * 점수를 한 단어 키워드로 변환합니다.
 * 점수 7 이상 = high(좋음), 4~6 = mid(보통), 3 이하 = low(주의)
 *
 * 예: love 점수 8 → '설렘', work 점수 3 → '인내', money 점수 5 → '유지'
 */
function scoreToKeyword(score: number, axis: 'love' | 'work' | 'money'): string {
  const keywords: Record<string, Record<string, string>> = {
    love: {
      high: '설렘',   // 연애가 활발하고 좋은 흐름
      mid: '안정',     // 큰 변화 없이 차분한 흐름
      low: '관망',     // 감정적 결정을 보류하는 게 나은 흐름
    },
    work: {
      high: '성과',   // 일이 잘 풀리고 결과가 나오는 흐름
      mid: '정리',     // 새로운 일보다 기존 일을 마무리하는 흐름
      low: '인내',     // 참고 기다리는 게 나은 흐름
    },
    money: {
      high: '기회',   // 재물 기회가 들어오는 흐름
      mid: '유지',     // 큰 변동 없이 안정적인 흐름
      low: '절제',     // 불필요한 지출을 줄여야 하는 흐름
    },
  };

  const level = score >= 7 ? 'high' : score >= 4 ? 'mid' : 'low';
  return keywords[axis][level];
}

/**
 * 점수를 2~3문장의 요약 문장으로 변환합니다.
 *
 * 각 축(연애/일/재물) × 각 레벨(high/mid/low)별로 2개의 문장 후보가 있고,
 * 십신(tenGod) 문자열의 길이를 이용해 결정론적으로 하나를 선택합니다.
 * (랜덤이 아닌 결정론적 = 같은 사주+같은 날이면 항상 같은 결과)
 */
function scoreToSummary(score: number, axis: 'love' | 'work' | 'money', tenGod: string): string {
  const summaries: Record<string, Record<string, string[]>> = {
    love: {
      high: [
        '감정 표현이 자연스러워지는 흐름입니다. 솔직한 한마디가 좋은 반응을 만들 수 있습니다.',
        '상대방과의 공감이 깊어지는 날입니다. 가벼운 대화에서도 의미 있는 연결이 생깁니다.',
      ],
      mid: [
        '연애 흐름은 안정적입니다. 큰 변화보다는 현재 관계를 돌보는 데 집중하면 좋겠습니다.',
        '감정이 차분하게 정리되는 날입니다. 서두르지 않아도 됩니다.',
      ],
      low: [
        '감정적인 결정은 잠시 미루는 편이 유리합니다. 혼자만의 시간이 오히려 도움이 됩니다.',
        '오해가 생기기 쉬운 흐름입니다. 중요한 대화는 내일로 미루는 것도 방법입니다.',
      ],
    },
    work: {
      high: [
        '추진력이 강해지는 날입니다. 미뤄둔 일을 처리하기에 좋은 타이밍입니다.',
        '집중력이 높아지는 흐름입니다. 중요한 업무를 오전에 배치하면 효율이 올라갑니다.',
      ],
      mid: [
        '무난한 업무 흐름입니다. 새로운 시작보다는 기존 작업을 마무리하는 데 집중하세요.',
        '일의 방향을 점검하기 좋은 날입니다. 큰 결정보다 작은 정리가 성과를 만듭니다.',
      ],
      low: [
        '에너지가 분산되기 쉬운 날입니다. 핵심 업무 하나에만 집중하는 전략이 유리합니다.',
        '예상치 못한 변수가 생길 수 있습니다. 여유를 두고 일정을 관리하세요.',
      ],
    },
    money: {
      high: [
        '재물 흐름이 활발합니다. 기다리던 기회나 소식이 들어올 수 있습니다.',
        '실질적인 이득이 기대되는 날입니다. 다만 충동 소비는 구분해야 합니다.',
      ],
      mid: [
        '재정적으로 안정적인 흐름입니다. 큰 지출보다 작은 절약이 의미 있는 하루입니다.',
        '수입과 지출의 균형을 점검하기 좋은 날입니다.',
      ],
      low: [
        '불필요한 지출이 생기기 쉬운 날입니다. 큰 결제는 하루 미루는 게 현명합니다.',
        '재물 흐름이 느려지는 시기입니다. 지키는 전략이 공격보다 유리합니다.',
      ],
    },
  };

  const level = score >= 7 ? 'high' : score >= 4 ? 'mid' : 'low';
  const options = summaries[axis][level];
  // 십신 문자열의 길이를 문장 후보 수로 나눈 나머지로 선택 (결정론적)
  const index = tenGod.length % options.length;
  return options[index];
}

// ──────────────────────────────────────────
// 메인 함수
// ──────────────────────────────────────────

/**
 * 오늘의 운세를 분석하는 메인 함수
 *
 * [처리 흐름]
 * 1) 오늘(또는 지정 날짜)의 일주(일진) 구하기
 * 2) 내 일간과 오늘 일진의 전체적 상호작용 판단 (support/clash/neutral)
 * 3) 연애/일/재물 각 축의 점수 계산 (1~10)
 * 4) 점수를 키워드와 요약 문장으로 변환
 * 5) 결과를 DailyRelation 객체로 반환
 *
 * @param sajuAnalysis - analyzeSaju()로 미리 계산해둔 사주 분석 결과
 * @param date - 운세를 볼 날짜 (기본값: 오늘)
 */
export function analyzeDailyFortune(
  sajuAnalysis: SajuAnalysis,
  date: Date = new Date(),
): DailyRelation {
  // 1) 오늘의 일주 (예: {stem: '갑', branch: '자'})
  const todayPillar = getTodayPillar(date);
  const { dayMaster, fourPillars } = sajuAnalysis;

  // 2) 전체적 상호작용 판단
  const dominantInteraction = analyzeInteraction(dayMaster, todayPillar);

  // 3) 3축 점수 계산
  const scores = calculateAxisScores(dayMaster, todayPillar, fourPillars);

  // 십신 관계 (키워드/문장 선택에 사용)
  const tenGod = getTenGodRelation(dayMaster, todayPillar.stem);

  // 4) 점수 → 키워드 + 요약 문장 변환
  const reading: DailyReading = {
    love: {
      score: scores.love,
      keyword: scoreToKeyword(scores.love, 'love'),
      summary: scoreToSummary(scores.love, 'love', tenGod),
    },
    work: {
      score: scores.work,
      keyword: scoreToKeyword(scores.work, 'work'),
      summary: scoreToSummary(scores.work, 'work', tenGod),
    },
    money: {
      score: scores.money,
      keyword: scoreToKeyword(scores.money, 'money'),
      summary: scoreToSummary(scores.money, 'money', tenGod),
    },
  };

  // 5) 결과 반환
  return {
    todayPillar,
    dominantInteraction,
    reading,
  };
}
