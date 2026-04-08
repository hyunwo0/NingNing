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
  tarot: {
    messages: [
      '카드의 에너지를 읽는 중...',
      '타로 마스터에게 연결하는 중...',
      '카드의 메시지를 해석하는 중...',
      '오늘의 답을 정리하는 중...',
    ],
    destination: '/tarot/result',
  },
  mbti: {
    messages: [
      '당신의 유형을 분석하는 중...',
      '성격 패턴을 읽는 중...',
      '오늘의 맞춤 운세를 만드는 중...',
      'MBTI 마스터에게 연결하는 중...',
    ],
    destination: '/mbti/result',
  },
  celeb: {
    messages: [
      '사주 궁합을 분석하는 중...',
      '연예인 데이터를 탐색하는 중...',
      '최고의 매칭을 찾는 중...',
      '결과를 정리하는 중...',
    ],
    destination: '/celeb/result',
  },
  face: {
    messages: [
      '얼굴의 인상을 읽는 중...',
      'AI 관상사에게 연결하는 중...',
      '숨겨진 매력을 찾는 중...',
      '관상 분석을 정리하는 중...',
    ],
    destination: '/face/result',
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
  const [retryable, setRetryable] = useState(true);

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

    try {
      if (type === 'tarot') {
        // 타로 해석
        const tarotInputRaw = sessionStorage.getItem('tarotInput');
        if (!tarotInputRaw) {
          router.replace('/tarot');
          return;
        }

        const tarotInput = JSON.parse(tarotInputRaw);
        const res = await fetch('/api/tarot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(tarotInput),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || '타로 해석 실패');
        }

        const data = await res.json();
        sessionStorage.setItem('tarotResult', JSON.stringify({
          card: tarotInput.card,
          questionType: tarotInput.questionType,
          ...data.result,
        }));
      } else if (type === 'mbti') {
        // MBTI 운세
        const mbtiInputRaw = sessionStorage.getItem('mbtiInput');
        if (!mbtiInputRaw) {
          router.replace('/mbti');
          return;
        }

        const mbtiInput = JSON.parse(mbtiInputRaw);
        const res = await fetch('/api/mbti', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(mbtiInput),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'MBTI 운세 생성 실패');
        }

        const data = await res.json();
        sessionStorage.setItem('mbtiResult', JSON.stringify({
          mbtiType: mbtiInput.mbtiType,
          ...data.result,
        }));
      } else if (type === 'celeb') {
        // 나와 맞는 연예인
        const sajuResultRaw = sessionStorage.getItem('sajuResult');
        const sajuInputRaw = sessionStorage.getItem('sajuInput');
        if (!sajuResultRaw || !sajuInputRaw) {
          router.replace('/input');
          return;
        }

        const sajuResult = JSON.parse(sajuResultRaw);
        const sajuInput = JSON.parse(sajuInputRaw);
        const res = await fetch('/api/celeb', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gender: sajuInput.gender,
            birthYear: sajuInput.birthYear,
            birthMonth: sajuInput.birthMonth,
            birthDay: sajuInput.birthDay,
            calendarType: sajuInput.calendarType,
            dayMaster: sajuResult.dayMaster,
            dayMasterElement: sajuResult.dayMasterElement,
            fiveElements: sajuResult.fiveElements,
          }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || '연예인 매칭 실패');
        }

        const data = await res.json();
        sessionStorage.setItem('celebResult', JSON.stringify(data.result));
      } else if (type === 'face') {
        // AI 관상
        const faceInputRaw = sessionStorage.getItem('faceInput');
        if (!faceInputRaw) {
          router.replace('/face');
          return;
        }

        const faceInput = JSON.parse(faceInputRaw);
        const res = await fetch('/api/face', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(faceInput),
        });

        if (!res.ok) {
          const err = await res.json();
          setRetryable(err.retryable !== false);
          throw new Error(err.error || '관상 분석 실패');
        }

        const data = await res.json();
        sessionStorage.setItem('faceResult', JSON.stringify(data.result));
      } else {

      const sajuInputRaw = sessionStorage.getItem('sajuInput');
      if (!sajuInputRaw) {
        router.replace('/input');
        return;
      }

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

      } // else (saju/report) 닫기

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
            {retryable ? (
              <button
                onClick={fetchData}
                className="h-10 px-6 rounded-xl bg-foreground text-background text-sm font-medium"
              >
                다시 시도
              </button>
            ) : null}
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
