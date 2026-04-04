// ==========================================
// POST /api/saju — 사주 계산 API
// ==========================================
//
// [역할]
// 사용자의 생년월일시 입력을 받아서 사주 팔자를 계산하고,
// 오늘의 일진과의 관계(3축 점수)까지 분석하여 반환합니다.
//
// [호출 흐름]
// 클라이언트 → POST /api/saju (이 파일) → 사주 엔진(lib/saju)
//   → 계산 결과 반환 (JSON)
//
// 이 API는 순수 계산만 수행하며, AI 호출은 하지 않습니다.
// AI 해석은 별도의 /api/interpret에서 처리합니다.

import { NextResponse } from 'next/server';
import { analyzeSaju, analyzeDailyFortune, fourPillarsToString, fiveElementsToString } from '@/lib/saju';
import type { SajuInput } from '@/lib/saju/types';

// 요청 바디 크기 제한 (10KB)
const MAX_BODY_SIZE = 10 * 1024;

// ──────────────────────────────────────────
// 인메모리 캐시 (동일 입력 + 같은 날짜 → 동일 결과)
// ──────────────────────────────────────────
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24시간 (밀리초)
const CACHE_MAX_SIZE = 1000; // 최대 캐시 항목 수

interface CacheEntry {
  data: unknown;
  timestamp: number;
}

const sajuCache = new Map<string, CacheEntry>();

// 만료된 캐시 항목 제거
function evictExpiredEntries() {
  const now = Date.now();
  for (const [key, entry] of sajuCache) {
    if (now - entry.timestamp > CACHE_TTL) {
      sajuCache.delete(key);
    }
  }
}

// 캐시 키 생성 (입력 데이터 + 오늘 날짜)
function buildCacheKey(input: SajuInput): string {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  return JSON.stringify({ ...input, _date: today });
}

export async function POST(request: Request) {
  try {
    // 요청 바디 크기 검증
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > MAX_BODY_SIZE) {
      return NextResponse.json(
        { error: '요청 데이터가 너무 큽니다.' },
        { status: 413 },
      );
    }

    // 요청 바디에서 사주 입력 데이터 추출 (malformed JSON 처리)
    let body: SajuInput;
    try {
      body = await request.json() as SajuInput;
    } catch {
      return NextResponse.json(
        { error: '잘못된 요청 형식입니다.' },
        { status: 400 },
      );
    }

    // 필수 필드 검증
    if (!body.birthYear || !body.birthMonth || !body.birthDay || !body.gender) {
      return NextResponse.json(
        { error: '필수 입력값이 누락되었습니다.' },
        { status: 400 },
      );
    }

    // 연도 범위 검증 (1940~2010)
    if (body.birthYear < 1940 || body.birthYear > 2010) {
      return NextResponse.json(
        { error: '1940년~2010년 사이의 출생연도만 지원합니다.' },
        { status: 400 },
      );
    }

    // 캐시 확인 — 동일 입력 + 같은 날짜면 캐시된 결과 반환
    const cacheKey = buildCacheKey(body);
    const cached = sajuCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json(cached.data, {
        headers: { 'Cache-Control': 'private, max-age=86400' },
      });
    }

    // 사주 분석 수행 (사주 팔자 + 오행 + 일간 강약)
    const analysis = analyzeSaju(body);

    // 오늘의 운세 분석 (일진 기반 3축 점수)
    const daily = analyzeDailyFortune(analysis);

    // 응답 데이터 구성
    const responseData = {
      // 사주 분석 결과
      fourPillars: analysis.fourPillars,
      fiveElements: analysis.fiveElements,
      dayMaster: analysis.dayMaster,
      dayMasterElement: analysis.dayMasterElement,
      dayMasterStrength: analysis.dayMasterStrength,

      // 오늘의 운세 (일진 관계)
      daily: {
        todayPillar: daily.todayPillar,
        dominantInteraction: daily.dominantInteraction,
        reading: daily.reading,
      },

      // 디버깅/표시용 문자열
      display: {
        fourPillars: fourPillarsToString(analysis.fourPillars),
        fiveElements: fiveElementsToString(analysis.fiveElements),
      },
    };

    // 캐시에 저장 (최대 크기 초과 시 만료 항목 정리 후 가장 오래된 항목 제거)
    if (sajuCache.size >= CACHE_MAX_SIZE) {
      evictExpiredEntries();
      // 정리 후에도 가득 차 있으면 가장 오래된 항목 제거
      if (sajuCache.size >= CACHE_MAX_SIZE) {
        const oldestKey = sajuCache.keys().next().value;
        if (oldestKey !== undefined) {
          sajuCache.delete(oldestKey);
        }
      }
    }
    sajuCache.set(cacheKey, { data: responseData, timestamp: Date.now() });

    // 응답 반환
    return NextResponse.json(responseData, {
      headers: { 'Cache-Control': 'private, max-age=86400' },
    });
  } catch (error) {
    console.error('[/api/saju] 계산 오류:', error);
    return NextResponse.json(
      { error: '사주 계산 중 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}
