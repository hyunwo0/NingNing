// ==========================================
// 운세 결과 페이지 (/result)
// ==========================================
//
// [역할]
// /input에서 입력한 사주 데이터를 기반으로
// 사주 계산 → AI 해석 → 결과 표시까지 처리하는 페이지입니다.
//
// [동작 흐름]
// 1) sessionStorage에서 사주 입력 데이터 읽기
// 2) POST /api/saju → 사주 계산 결과 수신 → 팔자/오행/3축 점수 표시
// 3) POST /api/interpret → AI 해석 수신 → 총평/해석 문장 표시
//
// [화면 구성]
// - 사주 팔자 표시 (4기둥)
// - 한 줄 총평
// - 3축 카드 (연애/일/재물)
// - 오늘 하면 좋은 것 / 피할 것
// - 행운 단서

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { FourPillars, FiveElementProfile, DailyRelation, DayMasterStrength, HeavenlyStem, FiveElement } from '@/lib/saju/types';

// ──────────────────────────────────────────
// 타입 정의
// ──────────────────────────────────────────

// /api/saju 응답 타입
interface SajuResponse {
  fourPillars: FourPillars;
  fiveElements: FiveElementProfile;
  dayMaster: HeavenlyStem;
  dayMasterElement: FiveElement;
  dayMasterStrength: DayMasterStrength;
  daily: DailyRelation;
  display: {
    fourPillars: string;
    fiveElements: string;
  };
}

// /api/interpret 응답 타입
interface InterpretResponse {
  interpretation: {
    dailySummary: string;
    dailyKeywords: string[];
    background: string;
    loveReading: { interpretation: string; advice: string };
    workReading: { interpretation: string; advice: string };
    moneyReading: { interpretation: string; advice: string };
    doToday: string;
    avoidToday: string;
    luckyHints: string[];
  };
}

// 로딩 단계 (사용자에게 진행 상황을 보여주기 위해)
type LoadingStep = 'loading-saju' | 'loading-ai' | 'done' | 'error';

// ──────────────────────────────────────────
// 메인 컴포넌트
// ──────────────────────────────────────────

export default function ResultPage() {
  const router = useRouter();

  const [step, setStep] = useState<LoadingStep>('loading-saju');
  const [errorMessage, setErrorMessage] = useState('');

  // 사주 계산 결과
  const [sajuData, setSajuData] = useState<SajuResponse | null>(null);
  // AI 해석 결과
  const [interpretation, setInterpretation] = useState<InterpretResponse['interpretation'] | null>(null);
  // AI 해석 실패 여부 (재시도 버튼 표시용)
  const [aiError, setAiError] = useState(false);
  const [aiRetrying, setAiRetrying] = useState(false);

  // AI 해석 API 호출 (재시도 가능하도록 별도 함수)
  const fetchInterpretation = useCallback(async (saju: SajuResponse, gender: string) => {
    setAiError(false);
    try {
      const interpretRes = await fetch('/api/interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysis: {
            fourPillars: saju.fourPillars,
            fiveElements: saju.fiveElements,
            dayMaster: saju.dayMaster,
            dayMasterElement: saju.dayMasterElement,
            dayMasterStrength: saju.dayMasterStrength,
          },
          daily: saju.daily,
          gender,
        }),
      });

      if (!interpretRes.ok) {
        console.warn('AI 해석 실패, 기본 결과만 표시');
        setAiError(true);
        return;
      }

      const interpretData: InterpretResponse = await interpretRes.json();
      setInterpretation(interpretData.interpretation);
    } catch {
      console.warn('AI 해석 네트워크 오류');
      setAiError(true);
    }
  }, []);

  // AI 해석 재시도 핸들러
  const handleRetryInterpret = useCallback(async () => {
    if (!sajuData || aiRetrying) return;
    const raw = sessionStorage.getItem('sajuInput');
    if (!raw) return;
    const input = JSON.parse(raw);

    setAiRetrying(true);
    await fetchInterpretation(sajuData, input.gender);
    setAiRetrying(false);
  }, [sajuData, aiRetrying, fetchInterpretation]);

  useEffect(() => {
    async function fetchResults() {
      // 1) sessionStorage에서 입력 데이터 읽기
      const raw = sessionStorage.getItem('sajuInput');
      if (!raw) {
        // 입력 데이터가 없으면 입력 페이지로 이동
        router.replace('/input');
        return;
      }

      const input = JSON.parse(raw);

      try {
        // 2) 사주 계산 API 호출
        setStep('loading-saju');
        const sajuRes = await fetch('/api/saju', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        });

        if (!sajuRes.ok) {
          const err = await sajuRes.json();
          throw new Error(err.error || '사주 계산 실패');
        }

        const saju: SajuResponse = await sajuRes.json();
        setSajuData(saju);

        // 사주 결과를 sessionStorage에 저장 (추가질문 페이지에서 사용)
        sessionStorage.setItem('sajuResult', JSON.stringify(saju));

        // 3) AI 해석 API 호출
        setStep('loading-ai');
        await fetchInterpretation(saju, input.gender);
        setStep('done');
      } catch (error) {
        console.error('결과 로딩 오류:', error);
        setErrorMessage(error instanceof Error ? error.message : '알 수 없는 오류');
        setStep('error');
      }
    }

    fetchResults();
  }, [router, fetchInterpretation]);

  // ── 로딩 화면 ──
  if (step === 'loading-saju' || step === 'loading-ai') {
    return (
      <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 dark:bg-black min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <LoadingSpinner />
          <p className="text-sm text-muted-foreground animate-pulse">
            {step === 'loading-saju' ? '사주를 분석하고 있습니다...' : 'AI가 오늘의 운세를 해석하고 있습니다...'}
          </p>
        </div>
      </div>
    );
  }

  // ── 에러 화면 ──
  if (step === 'error') {
    return (
      <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 dark:bg-black min-h-screen">
        <div className="flex flex-col items-center gap-4 px-6 text-center">
          <p className="text-lg font-medium text-foreground">오류가 발생했습니다</p>
          <p className="text-sm text-muted-foreground">{errorMessage}</p>
          <Button onClick={() => router.push('/input')} variant="outline">
            다시 입력하기
          </Button>
        </div>
      </div>
    );
  }

  // ── 결과 화면 ──
  if (!sajuData) return null;

  const { fourPillars, fiveElements, dayMaster, dayMasterElement, dayMasterStrength, daily } = sajuData;

  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 dark:bg-black">
      <main className="flex flex-col w-full max-w-md px-6 py-8 gap-6">

        {/* ── 헤더 영역: 홈으로 링크 ── */}
        <div className="flex items-center">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            홈으로
          </Link>
        </div>

        {/* ── AI 해석 실패 시 재시도 배너 ── */}
        {aiError && !interpretation && (
          <div className="rounded-xl bg-destructive/10 px-4 py-3 flex items-center justify-between">
            <p className="text-sm text-destructive">AI 해석을 불러오지 못했습니다</p>
            <Button
              onClick={handleRetryInterpret}
              disabled={aiRetrying}
              variant="outline"
              className="text-xs px-3 py-1 h-auto"
            >
              {aiRetrying ? '재시도 중...' : '다시 시도'}
            </Button>
          </div>
        )}

        {/* ── 사주 팔자 표시 ── */}
        <section className="rounded-2xl bg-background border border-border p-5">
          <h2 className="text-xs font-medium text-muted-foreground mb-3">나의 사주 팔자</h2>
          <div className="grid grid-cols-4 gap-2 text-center">
            {(['year', 'month', 'day', 'hour'] as const).map((key) => {
              const pillar = key === 'hour' ? fourPillars.hour : fourPillars[key];
              const labels = { year: '년주', month: '월주', day: '일주', hour: '시주' };
              return (
                <div key={key} className="flex flex-col items-center gap-1">
                  <span className="text-[10px] text-muted-foreground">{labels[key]}</span>
                  {pillar ? (
                    <>
                      <span className="text-xl font-bold text-foreground">{pillar.stem}</span>
                      <span className="text-lg text-muted-foreground">{pillar.branch}</span>
                    </>
                  ) : (
                    <span className="text-lg text-muted-foreground">미상</span>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <span>일간: {dayMaster}({dayMasterElement})</span>
            <span>{dayMasterStrength === 'strong' ? '신강' : dayMasterStrength === 'weak' ? '신약' : '중화'}</span>
          </div>
        </section>

        {/* ── 오행 분포 ── */}
        <section className="rounded-2xl bg-background border border-border p-5">
          <h2 className="text-xs font-medium text-muted-foreground mb-3">오행 분포</h2>
          <div className="flex items-end justify-between gap-1 h-20">
            {(['목', '화', '토', '금', '수'] as const).map((elem) => {
              const count = fiveElements.counts[elem];
              const maxCount = Math.max(...Object.values(fiveElements.counts), 1);
              const heightPercent = (count / maxCount) * 100;
              const colors: Record<string, string> = {
                '목': 'bg-green-500', '화': 'bg-red-500', '토': 'bg-yellow-600',
                '금': 'bg-gray-400', '수': 'bg-blue-500',
              };
              return (
                <div key={elem} className="flex flex-col items-center gap-1 flex-1">
                  <span className="text-xs font-medium text-foreground">{count}</span>
                  <div className="w-full rounded-t-sm flex items-end" style={{ height: '48px' }}>
                    <div
                      className={`w-full rounded-t-sm ${colors[elem]} transition-all`}
                      style={{ height: `${Math.max(heightPercent, 8)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground">{elem}</span>
                </div>
              );
            })}
          </div>
          {fiveElements.lacking && (
            <p className="mt-2 text-xs text-muted-foreground">
              부족한 오행: <span className="font-medium text-foreground">{fiveElements.lacking}</span>
            </p>
          )}
        </section>

        {/* ── AI 한 줄 총평 ── */}
        {interpretation && (
          <section className="rounded-2xl bg-foreground text-background p-5">
            <p className="text-lg font-semibold leading-relaxed">
              {interpretation.dailySummary}
            </p>
            <div className="flex gap-2 mt-3">
              {interpretation.dailyKeywords.map((kw) => (
                <span key={kw} className="text-xs px-2 py-0.5 rounded-full bg-background/20">
                  {kw}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* ── 3축 운세 카드 ── */}
        <section className="flex flex-col gap-3">
          <ReadingCard
            axis="연애"
            emoji="heart"
            score={daily.reading.love.score}
            keyword={daily.reading.love.keyword}
            engineSummary={daily.reading.love.summary}
            aiInterpretation={interpretation?.loveReading.interpretation}
            aiAdvice={interpretation?.loveReading.advice}
          />
          <ReadingCard
            axis="일/직장"
            emoji="briefcase"
            score={daily.reading.work.score}
            keyword={daily.reading.work.keyword}
            engineSummary={daily.reading.work.summary}
            aiInterpretation={interpretation?.workReading.interpretation}
            aiAdvice={interpretation?.workReading.advice}
          />
          <ReadingCard
            axis="재물"
            emoji="coin"
            score={daily.reading.money.score}
            keyword={daily.reading.money.keyword}
            engineSummary={daily.reading.money.summary}
            aiInterpretation={interpretation?.moneyReading.interpretation}
            aiAdvice={interpretation?.moneyReading.advice}
          />
        </section>

        {/* ── 오늘의 행동 조언 ── */}
        {interpretation && (
          <section className="rounded-2xl bg-background border border-border p-5 space-y-3">
            <div>
              <h3 className="text-xs font-medium text-green-600 dark:text-green-400 mb-1">오늘 하면 좋은 것</h3>
              <p className="text-sm text-foreground">{interpretation.doToday}</p>
            </div>
            <div className="border-t border-border pt-3">
              <h3 className="text-xs font-medium text-red-500 dark:text-red-400 mb-1">오늘 피하면 좋은 것</h3>
              <p className="text-sm text-foreground">{interpretation.avoidToday}</p>
            </div>
          </section>
        )}

        {/* ── 행운 단서 ── */}
        {interpretation?.luckyHints && interpretation.luckyHints.length > 0 && (
          <section className="rounded-2xl bg-background border border-border p-5">
            <h2 className="text-xs font-medium text-muted-foreground mb-2">오늘의 행운 단서</h2>
            <div className="flex flex-wrap gap-2">
              {interpretation.luckyHints.map((hint) => (
                <span key={hint} className="text-sm px-3 py-1.5 rounded-full bg-muted text-foreground">
                  {hint}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* ── 사주 근거 (접을 수 있는 섹션) ── */}
        {interpretation?.background && (
          <details className="rounded-2xl bg-background border border-border p-5 group">
            <summary className="text-xs font-medium text-muted-foreground cursor-pointer list-none flex items-center justify-between">
              사주 근거 보기
              <svg className="size-4 transition-transform group-open:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="m6 9 6 6 6-6" /></svg>
            </summary>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              {interpretation.background}
            </p>
          </details>
        )}

        {/* ── 하단 버튼들 ── */}
        <div className="flex flex-col gap-2 mt-2">
          <Button
            onClick={() => router.push('/question')}
            className="h-12 w-full rounded-xl text-base font-semibold"
            size="lg"
          >
            AI에게 추가 질문하기
          </Button>
          <Button
            onClick={() => router.push('/report')}
            variant="secondary"
            className="h-11 w-full rounded-xl"
          >
            심층 리포트 보기
          </Button>
          <Button
            onClick={() => router.push('/input')}
            variant="outline"
            className="h-11 w-full rounded-xl"
          >
            다른 사주로 보기
          </Button>
        </div>
      </main>
    </div>
  );
}

// ──────────────────────────────────────────
// 3축 운세 카드 컴포넌트
// ──────────────────────────────────────────

function ReadingCard({
  axis,
  emoji,
  score,
  keyword,
  engineSummary,
  aiInterpretation,
  aiAdvice,
}: {
  axis: string;
  emoji: 'heart' | 'briefcase' | 'coin';
  score: number;
  keyword: string;
  engineSummary: string;
  aiInterpretation?: string;
  aiAdvice?: string;
}) {
  const icons = {
    heart: <HeartIcon />,
    briefcase: <BriefcaseIcon />,
    coin: <CoinIcon />,
  };

  // 점수에 따른 바 색상
  const barColor = score >= 7 ? 'bg-green-500' : score >= 4 ? 'bg-yellow-500' : 'bg-red-400';

  return (
    <div className="rounded-2xl bg-background border border-border p-5">
      {/* 카드 헤더: 아이콘 + 축 이름 + 키워드 + 점수 바 */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-muted-foreground">{icons[emoji]}</span>
        <span className="text-sm font-medium text-foreground">{axis}</span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground ml-auto">
          {keyword}
        </span>
      </div>

      {/* 점수 바 */}
      <div className="w-full h-1.5 rounded-full bg-muted mb-3">
        <div
          className={`h-full rounded-full ${barColor} transition-all`}
          style={{ width: `${score * 10}%` }}
        />
      </div>

      {/* 해석 텍스트 (AI 해석 우선, 없으면 엔진 요약) */}
      <p className="text-sm text-foreground leading-relaxed">
        {aiInterpretation || engineSummary}
      </p>

      {/* AI 행동 조언 */}
      {aiAdvice && (
        <p className="mt-2 text-xs text-muted-foreground">
          {aiAdvice}
        </p>
      )}
    </div>
  );
}

// ──────────────────────────────────────────
// 아이콘 컴포넌트들
// ──────────────────────────────────────────

function LoadingSpinner() {
  return (
    <svg className="size-8 animate-spin text-muted-foreground" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}

function BriefcaseIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      <rect width="20" height="14" x="2" y="6" rx="2" />
    </svg>
  );
}

function CoinIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );
}
