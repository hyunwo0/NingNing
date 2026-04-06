// ==========================================
// 공통 로딩 페이지 (/loading-screen?type=saju|report)
// ==========================================
//
// [역할]
// API 호출 중 재미있는 로딩 문구를 보여주는 공통 페이지입니다.
// 쿼리 파라미터 type에 따라 문구, API, 이동 대상이 달라집니다.
//
// [타입]
// - saju: 사주 계산 → /result
// - report: 심층 리포트 → /report

'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// ──────────────────────────────────────────
// 타입별 설정
// ──────────────────────────────────────────

const CONFIGS = {
  saju: {
    messages: [
      '사주 팔자를 펼치는 중...',
      '오행의 균형을 살피는 중...',
      '오늘의 기운을 읽는 중...',
      'AI 도사에게 연락하는 중...',
      '운세를 정리하는 중...',
    ],
    destination: '/result',
  },
  report: {
    messages: [
      '사주 원국을 깊이 분석하는 중...',
      '오행의 상생상극을 풀어보는 중...',
      '올해의 대운 흐름을 살피는 중...',
      '맞춤 행동 조언을 준비하는 중...',
      '심층 리포트를 정리하는 중...',
    ],
    destination: '/report',
  },
} as const;

type LoadingType = keyof typeof CONFIGS;

// ──────────────────────────────────────────
// 메인 컴포넌트
// ──────────────────────────────────────────

function LoadingScreenContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get('type') as LoadingType | null;

  const [messageIndex, setMessageIndex] = useState(0);
  const [error, setError] = useState('');

  const config = type ? CONFIGS[type] : null;

  // 문구 순환 (2초 간격)
  useEffect(() => {
    if (!config) return;
    const interval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % config.messages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [config]);

  // API 호출
  const fetchData = useCallback(async () => {
    if (!type || !config) {
      router.replace('/input');
      return;
    }

    setError('');
    const startTime = Date.now();

    const sajuInputRaw = sessionStorage.getItem('sajuInput');
    if (!sajuInputRaw) {
      router.replace('/input');
      return;
    }

    try {
      if (type === 'saju') {
        // 1) 사주 계산
        const input = JSON.parse(sajuInputRaw);
        const sajuRes = await fetch('/api/saju', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        });

        if (!sajuRes.ok) {
          const err = await sajuRes.json();
          throw new Error(err.error || '사주 계산 실패');
        }

        const sajuData = await sajuRes.json();
        sessionStorage.setItem('sajuResult', JSON.stringify(sajuData));

        // 2) AI 해석 (실패해도 사주 결과는 있으므로 진행)
        try {
          const interpretRes = await fetch('/api/interpret', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              analysis: {
                fourPillars: sajuData.fourPillars,
                fiveElements: sajuData.fiveElements,
                dayMaster: sajuData.dayMaster,
                dayMasterElement: sajuData.dayMasterElement,
                dayMasterStrength: sajuData.dayMasterStrength,
              },
              daily: sajuData.daily,
              gender: input.gender,
            }),
          });

          if (interpretRes.ok) {
            const interpretData = await interpretRes.json();
            sessionStorage.setItem('sajuInterpretation', JSON.stringify(interpretData.interpretation));
          }
        } catch {
          // AI 해석 실패 시 무시 — /result에서 재시도 가능
        }
      } else if (type === 'report') {
        // 심층 리포트
        const sajuResultRaw = sessionStorage.getItem('sajuResult');
        if (!sajuResultRaw) {
          router.replace('/input');
          return;
        }

        const sajuResult = JSON.parse(sajuResultRaw);
        const sajuInput = JSON.parse(sajuInputRaw);

        const res = await fetch('/api/report', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            analysis: {
              fourPillars: sajuResult.fourPillars,
              fiveElements: sajuResult.fiveElements,
              dayMaster: sajuResult.dayMaster,
              dayMasterElement: sajuResult.dayMasterElement,
              dayMasterStrength: sajuResult.dayMasterStrength,
            },
            daily: sajuResult.daily,
            gender: sajuInput.gender,
          }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || '심층 리포트 생성 실패');
        }

        const data = await res.json();
        sessionStorage.setItem('sajuReport', JSON.stringify(data.report));
      }

      // 최소 3초 표시 (API가 빨리 끝나도 문구를 볼 수 있도록)
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 3000 - elapsed);
      if (remaining > 0) {
        await new Promise(resolve => setTimeout(resolve, remaining));
      }

      router.replace(config.destination);
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다');
    }
  }, [type, config, router]);

  // 마운트 시 API 호출
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 유효하지 않은 타입
  if (!config) return null;

  // 에러 화면
  if (error) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 dark:bg-black min-h-screen">
        <div className="flex flex-col items-center gap-4 px-6 text-center">
          <p className="text-lg font-medium text-foreground">오류가 발생했습니다</p>
          <p className="text-sm text-muted-foreground">{error}</p>
          <div className="flex gap-2">
            <button
              onClick={fetchData}
              className="h-10 px-6 rounded-xl bg-foreground text-background text-sm font-medium"
            >
              다시 시도
            </button>
            <button
              onClick={() => router.back()}
              className="h-10 px-6 rounded-xl border border-border text-sm font-medium text-foreground"
            >
              돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 로딩 화면
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 dark:bg-black min-h-screen">
      <div className="flex flex-col items-center gap-6">
        <svg className="size-8 animate-spin text-muted-foreground" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="text-sm text-muted-foreground animate-pulse">
          {config.messages[messageIndex]}
        </p>
      </div>
    </div>
  );
}

export default function LoadingScreenPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-1 items-center justify-center bg-zinc-50 dark:bg-black min-h-screen">
        <svg className="size-8 animate-spin text-muted-foreground" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    }>
      <LoadingScreenContent />
    </Suspense>
  );
}
