// ==========================================
// 심층 리포트 페이지 (/report)
// ==========================================
//
// [역할]
// 유료 심층 리포트를 표시하는 페이지입니다.
// /result 페이지에서 "심층 리포트 보기" 버튼을 통해 진입합니다.
//
// [동작 흐름]
// 1) sessionStorage에서 사주 결과(sajuResult)와 입력(sajuInput) 읽기
// 2) POST /api/report → 심층 리포트 수신
// 3) 리포트 섹션별로 카드 형태로 표시
//
// [화면 구성]
// - 사주 개요 (일간, 오행, 성격)
// - 오늘의 상세 해석 (전체 흐름 + 3축 각각)
// - 구체적 행동 조언 3가지
// - 이번 주 흐름
// - 마무리 메시지
// - 결과 화면으로 돌아가기 버튼

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

// ──────────────────────────────────────────
// 타입 정의
// ──────────────────────────────────────────

// 심층 리포트 응답 구조 (API에서 반환하는 형태)
interface ReportData {
  sajuOverview: {
    dayMasterExplanation: string;   // 일간에 대한 쉬운 설명
    fiveElementAnalysis: string;    // 오행 분포 해석
    personalityInsight: string;     // 성격/성향 해석
  };
  todayDetailed: {
    overallFlow: string;    // 오늘의 전체 흐름
    loveDetailed: string;   // 연애운 상세 해석
    workDetailed: string;   // 직장/일운 상세 해석
    moneyDetailed: string;  // 재물운 상세 해석
  };
  actionAdvice: string[];    // 구체적 행동 조언 3가지
  weeklyPreview: string;     // 이번 주 흐름 미리보기
  closingMessage: string;    // 마무리 한마디
}

// 로딩 상태
type LoadingState = 'loading' | 'done' | 'error';

// ──────────────────────────────────────────
// 메인 컴포넌트
// ──────────────────────────────────────────

export default function ReportPage() {
  const router = useRouter();

  const [state, setState] = useState<LoadingState>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [report, setReport] = useState<ReportData | null>(null);

  useEffect(() => {
    async function fetchReport() {
      // 1) sessionStorage에서 사주 결과와 입력 데이터 읽기
      const sajuResultRaw = sessionStorage.getItem('sajuResult');
      const sajuInputRaw = sessionStorage.getItem('sajuInput');

      if (!sajuResultRaw || !sajuInputRaw) {
        router.replace('/input');
        return;
      }

      // 2) 캐시 확인: 이미 리포트가 있으면 API 호출 스킵
      const cachedReport = sessionStorage.getItem('sajuReport');
      if (cachedReport) {
        setReport(JSON.parse(cachedReport));
        setState('done');
        return;
      }

      const sajuResult = JSON.parse(sajuResultRaw);
      const sajuInput = JSON.parse(sajuInputRaw);

      try {
        // 3) 심층 리포트 API 호출
        setState('loading');
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
        setReport(data.report);
        // 리포트 결과를 sessionStorage에 캐싱
        sessionStorage.setItem('sajuReport', JSON.stringify(data.report));
        setState('done');
      } catch (error) {
        console.error('심층 리포트 로딩 오류:', error);
        setErrorMessage(error instanceof Error ? error.message : '알 수 없는 오류');
        setState('error');
      }
    }

    fetchReport();
  }, [router]);

  // ── 로딩 화면 ──
  if (state === 'loading') {
    return (
      <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 dark:bg-black min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <LoadingSpinner />
          <p className="text-sm text-muted-foreground animate-pulse">
            심층 리포트를 작성하고 있습니다...
          </p>
        </div>
      </div>
    );
  }

  // ── 에러 화면 ──
  if (state === 'error') {
    return (
      <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 dark:bg-black min-h-screen">
        <div className="flex flex-col items-center gap-4 px-6 text-center">
          <p className="text-lg font-medium text-foreground">오류가 발생했습니다</p>
          <p className="text-sm text-muted-foreground">{errorMessage}</p>
          <Button onClick={() => router.push('/result')} variant="outline">
            결과 화면으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  // ── 리포트 화면 ──
  if (!report) return null;

  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 dark:bg-black">
      <main className="flex flex-col w-full max-w-md px-6 py-8 gap-6">

        {/* ── 페이지 제목 ── */}
        <div className="flex items-center gap-2">
          <ReportIcon />
          <h1 className="text-lg font-bold text-foreground">심층 리포트</h1>
        </div>

        {/* ── 섹션 1: 사주 개요 ── */}
        <section className="rounded-2xl bg-background border border-border p-5">
          <h2 className="text-xs font-medium text-muted-foreground mb-3 flex items-center gap-1.5">
            <CompassIcon />
            사주 개요
          </h2>
          <div className="space-y-4">
            {/* 일간 설명 */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-1">나의 일간</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {report.sajuOverview.dayMasterExplanation}
              </p>
            </div>
            {/* 오행 분석 */}
            <div className="border-t border-border pt-4">
              <h3 className="text-sm font-semibold text-foreground mb-1">오행 분석</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {report.sajuOverview.fiveElementAnalysis}
              </p>
            </div>
            {/* 성격/성향 해석 */}
            <div className="border-t border-border pt-4">
              <h3 className="text-sm font-semibold text-foreground mb-1">성격과 성향</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {report.sajuOverview.personalityInsight}
              </p>
            </div>
          </div>
        </section>

        {/* ── 섹션 2: 오늘의 상세 해석 ── */}
        <section className="rounded-2xl bg-background border border-border p-5">
          <h2 className="text-xs font-medium text-muted-foreground mb-3 flex items-center gap-1.5">
            <CalendarIcon />
            오늘의 상세 해석
          </h2>
          <div className="space-y-4">
            {/* 전체 흐름 */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-1">전체 흐름</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {report.todayDetailed.overallFlow}
              </p>
            </div>
            {/* 연애운 상세 */}
            <div className="border-t border-border pt-4">
              <h3 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-1.5">
                <HeartIcon />
                연애운
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {report.todayDetailed.loveDetailed}
              </p>
            </div>
            {/* 직장/일운 상세 */}
            <div className="border-t border-border pt-4">
              <h3 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-1.5">
                <BriefcaseIcon />
                직장/일운
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {report.todayDetailed.workDetailed}
              </p>
            </div>
            {/* 재물운 상세 */}
            <div className="border-t border-border pt-4">
              <h3 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-1.5">
                <CoinIcon />
                재물운
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {report.todayDetailed.moneyDetailed}
              </p>
            </div>
          </div>
        </section>

        {/* ── 섹션 3: 구체적 행동 조언 3가지 ── */}
        <section className="rounded-2xl bg-background border border-border p-5">
          <h2 className="text-xs font-medium text-muted-foreground mb-3 flex items-center gap-1.5">
            <LightbulbIcon />
            구체적 행동 조언
          </h2>
          <div className="space-y-3">
            {report.actionAdvice.map((advice, index) => (
              <div key={index} className="flex gap-3">
                {/* 번호 뱃지 */}
                <span className="flex-shrink-0 flex items-center justify-center size-6 rounded-full bg-foreground text-background text-xs font-bold">
                  {index + 1}
                </span>
                <p className="text-sm text-foreground leading-relaxed pt-0.5">
                  {advice}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 섹션 4: 이번 주 흐름 ── */}
        <section className="rounded-2xl bg-background border border-border p-5">
          <h2 className="text-xs font-medium text-muted-foreground mb-3 flex items-center gap-1.5">
            <TrendIcon />
            이번 주 흐름
          </h2>
          <p className="text-sm text-foreground leading-relaxed">
            {report.weeklyPreview}
          </p>
        </section>

        {/* ── 섹션 5: 마무리 메시지 ── */}
        <section className="rounded-2xl bg-foreground text-background p-5">
          <p className="text-sm leading-relaxed font-medium">
            {report.closingMessage}
          </p>
        </section>

        {/* ── 하단 버튼 ── */}
        <div className="flex flex-col gap-2 mt-2">
          <Button
            onClick={() => router.push('/result')}
            variant="outline"
            className="h-11 w-full rounded-xl"
          >
            결과 화면으로 돌아가기
          </Button>
        </div>
      </main>
    </div>
  );
}

// ──────────────────────────────────────────
// 아이콘 컴포넌트들 (인라인 SVG)
// ──────────────────────────────────────────

// 로딩 스피너
function LoadingSpinner() {
  return (
    <svg className="size-8 animate-spin text-muted-foreground" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

// 리포트 아이콘 (문서 모양)
function ReportIcon() {
  return (
    <svg className="size-5 text-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

// 나침반 아이콘 (사주 개요용)
function CompassIcon() {
  return (
    <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
}

// 캘린더 아이콘 (오늘 해석용)
function CalendarIcon() {
  return (
    <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

// 하트 아이콘 (연애운)
function HeartIcon() {
  return (
    <svg className="size-3.5 text-pink-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}

// 서류가방 아이콘 (직장운)
function BriefcaseIcon() {
  return (
    <svg className="size-3.5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      <rect width="20" height="14" x="2" y="6" rx="2" />
    </svg>
  );
}

// 동전 아이콘 (재물운)
function CoinIcon() {
  return (
    <svg className="size-3.5 text-yellow-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );
}

// 전구 아이콘 (행동 조언용)
function LightbulbIcon() {
  return (
    <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
      <path d="M9 18h6" />
      <path d="M10 22h4" />
    </svg>
  );
}

// 트렌드 아이콘 (이번 주 흐름용)
function TrendIcon() {
  return (
    <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  );
}
