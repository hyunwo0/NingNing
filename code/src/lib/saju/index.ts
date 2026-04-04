// ==========================================
// 사주 계산 엔진 — 통합 진입점
// ==========================================
//
// [이 파일이 하는 일]
// 사주 엔진의 모든 기능을 한 곳에서 import할 수 있게 해주는 "창구" 역할입니다.
// 외부에서는 이 파일만 import하면 사주 관련 모든 기능을 사용할 수 있습니다.
//
// 사용 예:
//   import { analyzeSaju, getFullReading } from '@/lib/saju';
//   const result = analyzeSaju(userInput);

// 각 모듈에서 필요한 함수들을 re-export (외부에서 바로 쓸 수 있게)
export { normalizeBirthDate, solarToLunar, lunarToSolar, getLunarFromSolar } from './calendar';
export { calculateFourPillars, getDayPillarForDate, fourPillarsToString } from './pillars';
export { analyzeFiveElements, analyzeDayMasterStrength, getElementRelation, countFiveElements, fiveElementsToString } from './five-elements';
export { analyzeDailyFortune, getTodayPillar } from './daily-fortune';
export * from './types'; // 모든 타입과 상수도 re-export

import { calculateFourPillars } from './pillars';
import { analyzeFiveElements, analyzeDayMasterStrength } from './five-elements';
import { analyzeDailyFortune } from './daily-fortune';
import type { SajuInput, SajuAnalysis, DailyRelation } from './types';
import { STEM_ELEMENT } from './types';

/**
 * 사주 입력 → 전체 분석 결과를 한 번에 반환하는 함수
 *
 * [처리 흐름]
 * 1) 생년월일시로 사주 팔자(4기둥) 계산
 * 2) 일주의 천간(일간) = "나 자신" 추출
 * 3) 오행 분포 분석
 * 4) 일간 강약 판단
 * 5) 결과를 SajuAnalysis 객체로 반환
 *
 * @param input - 사용자가 입력한 생년월일시 정보
 * @returns 사주 분석 결과 (팔자 + 오행 + 일간 강약)
 */
export function analyzeSaju(input: SajuInput): SajuAnalysis {
  const fourPillars = calculateFourPillars(input);        // 4기둥 계산
  const dayMaster = fourPillars.day.stem;                  // 일간 추출 (예: '경')
  const dayMasterElement = STEM_ELEMENT[dayMaster];        // 일간의 오행 (예: '금')
  const fiveElements = analyzeFiveElements(fourPillars);   // 오행 분포 분석
  const dayMasterStrength = analyzeDayMasterStrength(fourPillars, dayMaster); // 강약 판단

  return {
    fourPillars,
    fiveElements,
    dayMaster,
    dayMasterElement,
    dayMasterStrength,
  };
}

/**
 * 사주 입력 + 날짜 → 오늘의 운세까지 포함한 전체 결과
 *
 * analyzeSaju()에 더해서 "오늘의 운세"(일진 분석)까지 합친 결과를 반환합니다.
 * 이 함수 하나로 서비스에 필요한 모든 데이터를 얻을 수 있습니다.
 *
 * @param input - 사용자 입력 (생년월일시)
 * @param date - 운세를 볼 날짜 (기본값: 오늘)
 * @returns { analysis: 사주 분석, daily: 오늘의 운세 }
 */
export function getFullReading(input: SajuInput, date?: Date): {
  analysis: SajuAnalysis;
  daily: DailyRelation;
} {
  const analysis = analyzeSaju(input);                     // 사주 분석
  const daily = analyzeDailyFortune(analysis, date);       // 오늘의 운세 분석
  return { analysis, daily };
}
