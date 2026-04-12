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
import { Button } from '@/components/ui/button';
import GNB from '@/components/layout/GNB';
import ShareModal from '@/components/share/ShareModal';
import type { ShareCardData } from '@/components/share/ShareCard';
import type { DailyRelation } from '@/lib/saju/types';

// ──────────────────────────────────────────
// 타입 정의
// ──────────────────────────────────────────

// /api/saju 응답 타입
interface SajuResponse {
  fourPillars: Record<string, unknown>;
  fiveElements: Record<string, unknown>;
  dayMaster: string;
  dayMasterElement: string;
  dayMasterStrength: string;
  daily: DailyRelation;
}

// /api/interpret 응답 타입 (v3 K-콘텐츠 톤)
interface InterpretResponse {
  interpretation: {
    coreMood: { mode: string; summary: string; keywords: string[] };
    love: { status: string; interpretation: string; tip: string };
    work: { status: string; interpretation: string; tip: string };
    money: { status: string; interpretation: string; tip: string };
    strategy: { english: string; korean: string };
    luckBoosters: { styleCode: string; luckyNumber: string; energyDirection: string; goldenTime: string };
    kOracle: { energyDay: string; interpretation: string };
  };
}

type LoadingStep = 'init' | 'done' | 'error';

// ──────────────────────────────────────────
// 메인 컴포넌트
// ──────────────────────────────────────────

export default function ResultPage() {
  const router = useRouter();

  const [step, setStep] = useState<LoadingStep>('init');
  const [errorMessage, setErrorMessage] = useState('');

  // 사주 계산 결과
  const [sajuData, setSajuData] = useState<SajuResponse | null>(null);
  // AI 해석 결과
  const [interpretation, setInterpretation] = useState<InterpretResponse['interpretation'] | null>(null);
  // AI 해석 실패 여부 (재시도 버튼 표시용)
  const [aiError, setAiError] = useState(false);
  const [aiRetrying, setAiRetrying] = useState(false);

  // AI 해석 로딩 중 여부
  const [aiLoading, setAiLoading] = useState(false);

  // AI 생성 이미지
  const [aiImage, setAiImage] = useState<string | null>(null);

  // 공유 모달 표시 여부
  const [showShareModal, setShowShareModal] = useState(false);

  // 결과 저장 상태
  const [isSaved, setIsSaved] = useState(false);

  // AI 해석 API 호출 (재시도용)
  const fetchInterpretation = useCallback(async (saju: SajuResponse, gender: string) => {
    setAiError(false);
    setAiLoading(true);
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
        setAiError(true);
        return;
      }

      const interpretData: InterpretResponse = await interpretRes.json();
      setInterpretation(interpretData.interpretation);
      sessionStorage.setItem('sajuInterpretation', JSON.stringify(interpretData.interpretation));
    } catch {
      setAiError(true);
    } finally {
      setAiLoading(false);
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

  // sessionStorage에서 캐시된 결과 로드 (API 호출은 /input에서 수행)
  useEffect(() => {
    const cachedResult = sessionStorage.getItem('sajuResult');

    if (!cachedResult) {
      router.replace('/input');
      return;
    }

    const saju: SajuResponse = JSON.parse(cachedResult);
    setSajuData(saju);

    const cachedInterpret = sessionStorage.getItem('sajuInterpretation');
    if (cachedInterpret) {
      setInterpretation(JSON.parse(cachedInterpret));

      const cachedImage = sessionStorage.getItem('sajuImage');
      if (cachedImage) {
        setAiImage(cachedImage);
      }

      console.log(cachedImage);

      setStep('done');
    } else {
      // 해석 데이터가 없으면 에러 화면
      setErrorMessage('운세 해석을 불러오지 못했어요. 다시 시도해주세요.');
      setStep('error');
    }
  }, [router, fetchInterpretation]);

  // ── 저장 여부 확인 (오늘 날짜 기준) ──
  useEffect(() => {
    try {
      const raw = localStorage.getItem('savedResults');
      if (raw) {
        const saved = JSON.parse(raw);
        const today = new Date().toLocaleDateString('ko-KR');
        const alreadySaved = saved.some((r: { date: string }) => r.date === today);
        setIsSaved(alreadySaved);
      }
    } catch {
      // localStorage 접근 실패 시 무시
    }
  }, []);

  // ── 결과 저장 핸들러 ──
  const handleSaveResult = () => {
    if (!interpretation || !sajuData) return;

    const today = new Date().toLocaleDateString('ko-KR');
    const newResult = {
      id: `${Date.now()}`,
      date: today,
      dailySummary: `${interpretation.coreMood.mode} — ${interpretation.coreMood.summary}`,
      keywords: interpretation.coreMood.keywords,
      scores: {
        love: sajuData.daily.reading.love.score,
        work: sajuData.daily.reading.work.score,
        money: sajuData.daily.reading.money.score,
      },
    };

    try {
      const raw = localStorage.getItem('savedResults');
      const existing = raw ? JSON.parse(raw) : [];

      // 같은 날짜의 결과가 이미 있으면 교체, 없으면 추가
      const filtered = existing.filter((r: { date: string }) => r.date !== today);
      filtered.push(newResult);

      localStorage.setItem('savedResults', JSON.stringify(filtered));
      setIsSaved(true);
    } catch {
      // localStorage 저장 실패 시 무시
    }
  };

  // ── 초기 로딩 (캐시 읽는 중) ──
  if (step === 'init') {
    return <div className="flex flex-1 bg-zinc-50 dark:bg-black min-h-screen" />;
  }

  // ── 에러 화면 ──
  if (step === 'error') {
    return (
      <div className="flex flex-col flex-1 items-center bg-zinc-50 dark:bg-black min-h-screen">
        <main className="flex flex-col w-full max-w-md px-6">
          <GNB title="오늘의 운세" />
          <div className="flex flex-col items-center gap-6 pt-20 text-center">
            <div className="size-16 rounded-full bg-muted flex items-center justify-center">
              <svg className="size-8 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="m15 9-6 6" />
                <path d="m9 9 6 6" />
              </svg>
            </div>
            <div className="space-y-2">
              <p className="text-lg font-semibold text-foreground">운세를 불러오지 못했어요</p>
              <p className="text-sm text-muted-foreground">{errorMessage}</p>
            </div>
            <Button
              onClick={() => router.push('/input')}
              className="h-12 rounded-xl text-base font-semibold px-8"
            >
              다시 해보기
            </Button>
          </div>
        </main>
      </div>
    );
  }

  // ── 결과 화면 ──
  if (!sajuData) return null;

  const { daily } = sajuData;

  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 dark:bg-black">
      <main className="flex flex-col w-full max-w-md px-6 pb-8 gap-6">

        <GNB title="오늘의 운세" />        

        {/* ── AI 생성 이미지 ── */}
        {aiImage && (
          <section className="rounded-2xl overflow-hidden">
            <img src={aiImage} alt="오늘의 운세" className="w-full aspect-square object-cover" />
          </section>
        )}

        {/* ── 저장 버튼 ── */}
        <div className="flex items-center justify-end">
          {/* 결과 저장 버튼 (AI 해석 완료 시만 표시) */}
          {interpretation && (
            <button
              onClick={handleSaveResult}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              aria-label={isSaved ? '저장됨' : '결과 저장'}
            >
              {isSaved ? (
                <>
                  {/* 채워진 북마크 아이콘 */}
                  <svg className="size-5 text-foreground" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                  </svg>
                  <span className="text-foreground font-medium">저장됨</span>
                </>
              ) : (
                <>
                  {/* 빈 북마크 아이콘 */}
                  <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                  </svg>
                  <span>결과 저장</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* ── 오늘의 무드 ── */}
        {interpretation ? (
          <section className="rounded-2xl bg-foreground text-background p-5">
            <p className="text-xs text-background/60 mb-1">오늘의 무드</p>
            <p className="text-xl font-bold">{interpretation.coreMood.mode}</p>
            <p className="text-sm mt-2 leading-relaxed text-background/80">
              {interpretation.coreMood.summary}
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              {interpretation.coreMood.keywords.map((kw) => (
                <span key={kw} className="text-xs px-2 py-0.5 rounded-full bg-background/20">
                  {kw}
                </span>
              ))}
            </div>
          </section>
        ) : null}

        {/* ── 3축 운세 카드 ── */}
        <section className="flex flex-col gap-3">
          <EnergyCard
            icon="heart"
            label="연애"
            score={daily.reading.love.score}
            status={interpretation?.love.status}
            tip={interpretation?.love.tip}
            interpretation={interpretation?.love.interpretation}
            engineSummary={daily.reading.love.summary}
          />
          <EnergyCard
            icon="briefcase"
            label="일/직장"
            score={daily.reading.work.score}
            status={interpretation?.work.status}
            tip={interpretation?.work.tip}
            interpretation={interpretation?.work.interpretation}
            engineSummary={daily.reading.work.summary}
          />
          <EnergyCard
            icon="coin"
            label="재물"
            score={daily.reading.money.score}
            status={interpretation?.money.status}
            tip={interpretation?.money.tip}
            interpretation={interpretation?.money.interpretation}
            engineSummary={daily.reading.money.summary}
          />
        </section>

        {/* ── 오늘의 전략 ── */}
        {interpretation?.strategy && (
          <section className="rounded-2xl bg-foreground text-background p-5 text-center">
            <p className="text-xs text-background/60 mb-2">오늘의 전략</p>
            <p className="text-lg font-bold">{interpretation.strategy.korean}</p>
            <p className="text-sm text-background/50 mt-1">{interpretation.strategy.english}</p>
          </section>
        )}

        {/* ── 행운 부스터 ── */}
        {interpretation?.luckBoosters && (
          <section className="rounded-2xl bg-background border border-border p-5">
            <h2 className="text-base font-semibold text-foreground mb-4">행운 부스터</h2>
            <div className="space-y-4">
              <BoosterItem title="스타일 코드" value={interpretation.luckBoosters.styleCode} />
              <BoosterItem title="행운 숫자" value={interpretation.luckBoosters.luckyNumber} />
              <BoosterItem title="에너지 방향" value={interpretation.luckBoosters.energyDirection} />
              <BoosterItem title="골든 타임" value={interpretation.luckBoosters.goldenTime} />
            </div>
          </section>
        )}

        {/* ── 사주 해석 (접이식) ── */}
        {interpretation?.kOracle && (
          <details className="rounded-2xl bg-background border border-border p-5 group">
            <summary className="text-xs font-medium text-muted-foreground cursor-pointer list-none flex items-center justify-between">
              사주 해석 보기
              <svg className="size-4 transition-transform group-open:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="m6 9 6 6 6-6" /></svg>
            </summary>
            <div className="mt-3">
              <p className="text-sm font-medium text-foreground">{interpretation.kOracle.energyDay}</p>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {interpretation.kOracle.interpretation}
              </p>
            </div>
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
            onClick={() => {
              const cached = sessionStorage.getItem('sajuReport');
              router.push(cached ? '/report' : '/loading-screen?type=report');
            }}
            variant="secondary"
            className="h-11 w-full rounded-xl"
          >
            심층 리포트 보기
          </Button>
          {interpretation && (
            <Button
              onClick={() => setShowShareModal(true)}
              variant="outline"
              className="h-11 w-full rounded-xl"
            >
              공유하기
            </Button>
          )}
          <Button
            onClick={() => router.push('/input')}
            variant="outline"
            className="h-11 w-full rounded-xl"
          >
            다른 사주로 보기
          </Button>
        </div>

        {/* 공유 모달 */}
        {showShareModal && interpretation && (
          <ShareModal
            data={{
              type: 'saju',
              typeLabel: '오늘의 운세',
              image: aiImage,
              content: {
                type: 'saju',
                strategy: interpretation.strategy.korean,
                love: { status: interpretation.love.status, score: daily.reading.love.score },
                work: { status: interpretation.work.status, score: daily.reading.work.score },
                money: { status: interpretation.money.status, score: daily.reading.money.score },
              },
            }}
            onClose={() => setShowShareModal(false)}
          />
        )}
      </main>
    </div>
  );
}

// ──────────────────────────────────────────
// 3축 Energy 카드 컴포넌트
// ──────────────────────────────────────────

function EnergyCard({
  icon,
  label,
  score,
  status,
  interpretation,
  tip,
  engineSummary,
}: {
  icon: 'heart' | 'briefcase' | 'coin';
  label: string;
  score: number;
  status?: string;
  interpretation?: string;
  tip?: string;
  engineSummary: string;
}) {
  const icons = {
    heart: <HeartIcon />,
    briefcase: <BriefcaseIcon />,
    coin: <CoinIcon />,
  };

  const barColor = score >= 7 ? 'bg-green-500' : score >= 4 ? 'bg-yellow-500' : 'bg-red-400';

  return (
    <div className="rounded-2xl bg-background border border-border p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-muted-foreground">{icons[icon]}</span>
        <span className="text-sm font-medium text-foreground">{label}</span>
        {status && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground ml-auto">
            {status}
          </span>
        )}
      </div>

      <div className="w-full h-1.5 rounded-full bg-muted mb-3">
        <div
          className={`h-full rounded-full ${barColor} transition-all`}
          style={{ width: `${score * 10}%` }}
        />
      </div>

      {/* tip이 메인 안내 */}
      {tip ? (
        <p className="text-sm font-medium text-foreground">
          {tip}
        </p>
      ) : null}

      {/* interpretation이 서브 해설 */}
      <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
        {interpretation || engineSummary}
      </p>
    </div>
  );
}

// ──────────────────────────────────────────
// 행운 부스터 항목 컴포넌트
// ──────────────────────────────────────────

function BoosterItem({ title, value }: { title: string; value: string }) {
  const parts = value.split(/\s*[—\-]\s*/);
  const main = parts[0];
  const sub = parts.length > 1 ? parts.slice(1).join(' ') : null;

  return (
    <div className="flex gap-4">
      <p className="text-sm text-muted-foreground shrink-0 w-20 whitespace-nowrap">{title}</p>
      <div className="flex-1">
        <p className="text-sm font-semibold text-foreground">{main}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────
// 아이콘 컴포넌트들
// ──────────────────────────────────────────

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
