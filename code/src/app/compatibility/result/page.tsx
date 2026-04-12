// ==========================================
// 궁합 결과 페이지 (/compatibility/result)
// ==========================================

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import GNB from '@/components/layout/GNB';

interface CompatibilityResult {
  person1Name: string;
  person2Name: string;
  totalScore: number;
  summary: string;
  love: { score: number; interpretation: string };
  friendship: { score: number; interpretation: string };
  work: { score: number; interpretation: string };
  advice: string;
  oneLiner: string;
}

export default function CompatibilityResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<CompatibilityResult | null>(null);

  useEffect(() => {
    const cached = sessionStorage.getItem('compatibilityResult');
    if (cached) {
      setResult(JSON.parse(cached));
    } else {
      router.replace('/compatibility');
    }
  }, [router]);

  if (!result) {
    return <div className="flex flex-1 bg-zinc-50 dark:bg-black min-h-screen" />;
  }

  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 dark:bg-black">
      <main className="flex flex-col w-full max-w-md px-6 pb-8 gap-6">

        <GNB title="궁합" />

        {/* 궁합 타이틀 */}
        <section className="rounded-2xl bg-foreground text-background p-5 text-center">
          <p className="text-lg font-bold">{result.person1Name} ♥ {result.person2Name}</p>
          <p className="text-3xl font-bold mt-2">{result.totalScore}<span className="text-base font-normal text-background/60">점</span></p>
          <p className="text-sm text-background/70 mt-1">{result.summary}</p>
        </section>

        {/* 3축 궁합 카드 */}
        <CompatibilityCard emoji="💕" label="연애 궁합" score={result.love.score} interpretation={result.love.interpretation} />
        <CompatibilityCard emoji="🤝" label="친구 궁합" score={result.friendship.score} interpretation={result.friendship.interpretation} />
        <CompatibilityCard emoji="💼" label="일 궁합" score={result.work.score} interpretation={result.work.interpretation} />

        {/* 조언 */}
        <section className="rounded-2xl bg-background border border-border p-5">
          <h2 className="text-xs font-medium text-muted-foreground mb-2">이 관계를 위한 조언</h2>
          <p className="text-sm font-medium text-foreground">{result.advice}</p>
        </section>

        {/* 한 줄 정리 */}
        <section className="rounded-2xl bg-foreground text-background p-5 text-center">
          <p className="text-xs text-background/60 mb-1">한 줄 정리</p>
          <p className="text-base font-bold">{result.oneLiner}</p>
        </section>

        {/* 하단 버튼 */}
        <div className="flex flex-col gap-2 mt-2">
          <Button
            onClick={() => {
              sessionStorage.removeItem('compatibilityResult');
              router.push('/compatibility');
            }}
            className="h-12 w-full rounded-xl text-base font-semibold"
            size="lg"
          >
            다른 궁합 보기
          </Button>
          <Button
            onClick={() => router.push('/')}
            variant="outline"
            className="h-11 w-full rounded-xl"
          >
            홈으로
          </Button>
        </div>
      </main>
    </div>
  );
}

// ──────────────────────────────────────────
// 궁합 카드 컴포넌트
// ──────────────────────────────────────────

function CompatibilityCard({
  emoji,
  label,
  score,
  interpretation,
}: {
  emoji: string;
  label: string;
  score: number;
  interpretation: string;
}) {
  const barColor = score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-400';

  return (
    <section className="rounded-2xl bg-background border border-border p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-foreground">{emoji} {label}</span>
        <span className="text-sm font-bold text-foreground">{score}점</span>
      </div>
      <div className="w-full h-1.5 rounded-full bg-muted mb-3">
        <div
          className={`h-full rounded-full ${barColor} transition-all`}
          style={{ width: `${score}%` }}
        />
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{interpretation}</p>
    </section>
  );
}
