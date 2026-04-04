import { describe, it, expect } from 'vitest';
import { analyzeSaju, getFullReading, fourPillarsToString, fiveElementsToString } from '@/lib/saju';
import type { SajuInput } from '@/lib/saju/types';

describe('사주 계산 엔진', () => {
  const sampleInput: SajuInput = {
    calendarType: 'solar',
    isLeapMonth: false,
    birthYear: 1995,
    birthMonth: 3,
    birthDay: 15,
    birthTime: '오시',
    gender: 'female',
  };

  describe('analyzeSaju', () => {
    it('사주 팔자 4개 기둥을 모두 계산해야 한다', () => {
      const result = analyzeSaju(sampleInput);
      expect(result.fourPillars.year).toBeDefined();
      expect(result.fourPillars.year.stem).toBeTruthy();
      expect(result.fourPillars.year.branch).toBeTruthy();
      expect(result.fourPillars.month).toBeDefined();
      expect(result.fourPillars.day).toBeDefined();
      expect(result.fourPillars.hour).toBeDefined();
    });

    it('일간(dayMaster)이 유효한 천간이어야 한다', () => {
      const result = analyzeSaju(sampleInput);
      const validStems = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'];
      expect(validStems).toContain(result.dayMaster);
    });

    it('오행 분포의 합이 전체 글자 수와 일치해야 한다', () => {
      const result = analyzeSaju(sampleInput);
      const total = Object.values(result.fiveElements.counts).reduce((sum, c) => sum + c, 0);
      // 시주 포함 시 8, 미포함 시 6
      const expected = result.fourPillars.hour ? 8 : 6;
      expect(total).toBe(expected);
    });

    it('일간 강약이 유효한 값이어야 한다', () => {
      const result = analyzeSaju(sampleInput);
      expect(['strong', 'weak', 'balanced']).toContain(result.dayMasterStrength);
    });
  });

  describe('출생시간 미상 처리', () => {
    it('시주가 null이어야 한다', () => {
      const input: SajuInput = { ...sampleInput, birthTime: 'unknown' };
      const result = analyzeSaju(input);
      expect(result.fourPillars.hour).toBeNull();
    });

    it('오행 분포가 6개 글자 기준이어야 한다', () => {
      const input: SajuInput = { ...sampleInput, birthTime: 'unknown' };
      const result = analyzeSaju(input);
      const total = Object.values(result.fiveElements.counts).reduce((sum, c) => sum + c, 0);
      expect(total).toBe(6);
    });
  });

  describe('음력 입력 처리', () => {
    it('음력 입력도 정상적으로 계산해야 한다', () => {
      const lunarInput: SajuInput = {
        calendarType: 'lunar',
        isLeapMonth: false,
        birthYear: 1995,
        birthMonth: 2,
        birthDay: 15,
        birthTime: '자시',
        gender: 'male',
      };
      const result = analyzeSaju(lunarInput);
      expect(result.fourPillars.year.stem).toBeTruthy();
      expect(result.dayMaster).toBeTruthy();
    });
  });

  describe('getFullReading', () => {
    it('분석 결과와 오늘의 운세를 모두 반환해야 한다', () => {
      const result = getFullReading(sampleInput, new Date(2026, 3, 2));
      expect(result.analysis).toBeDefined();
      expect(result.daily).toBeDefined();
      expect(result.daily.todayPillar).toBeDefined();
      expect(result.daily.reading.love).toBeDefined();
      expect(result.daily.reading.work).toBeDefined();
      expect(result.daily.reading.money).toBeDefined();
    });

    it('3축 점수가 1~10 범위여야 한다', () => {
      const result = getFullReading(sampleInput, new Date(2026, 3, 2));
      const { love, work, money } = result.daily.reading;
      expect(love.score).toBeGreaterThanOrEqual(1);
      expect(love.score).toBeLessThanOrEqual(10);
      expect(work.score).toBeGreaterThanOrEqual(1);
      expect(work.score).toBeLessThanOrEqual(10);
      expect(money.score).toBeGreaterThanOrEqual(1);
      expect(money.score).toBeLessThanOrEqual(10);
    });

    it('각 축에 키워드와 요약이 있어야 한다', () => {
      const result = getFullReading(sampleInput, new Date(2026, 3, 2));
      const { love, work, money } = result.daily.reading;
      expect(love.keyword).toBeTruthy();
      expect(love.summary).toBeTruthy();
      expect(work.keyword).toBeTruthy();
      expect(money.keyword).toBeTruthy();
    });
  });

  describe('문자열 변환', () => {
    it('fourPillarsToString이 읽기 쉬운 형식을 반환해야 한다', () => {
      const result = analyzeSaju(sampleInput);
      const str = fourPillarsToString(result.fourPillars);
      expect(str).toContain('년주:');
      expect(str).toContain('월주:');
      expect(str).toContain('일주:');
    });

    it('fiveElementsToString이 오행 정보를 포함해야 한다', () => {
      const result = analyzeSaju(sampleInput);
      const str = fiveElementsToString(result.fiveElements);
      expect(str).toContain('목:');
      expect(str).toContain('강세:');
    });
  });
});
