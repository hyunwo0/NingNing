// ==========================================
// 타로 결과 페이지 (/tarot/result)
// ==========================================

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import GNB from '@/components/layout/GNB';

interface TarotResult {
  card: { name: string; nameKo: string; keywords: string[] };
  questionType: string;
  cardMeaning: string;
  interpretation: string;
  advice: string;
  oneLiner: string;
}

export default function TarotResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<TarotResult | null>(null);

  useEffect(() => {
    const cached = sessionStorage.getItem('tarotResult');
    if (cached) {
      setResult(JSON.parse(cached));
    } else {
      router.replace('/tarot');
    }
  }, [router]);

  if (!result) {
    return <div className="flex flex-1 bg-zinc-50 dark:bg-black min-h-screen" />;
  }

  const questionLabels: Record<string, string> = { love: '연애', career: '진로', today: '오늘' };

  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 dark:bg-black">
      <main className="flex flex-col w-full max-w-md px-6 py-8 gap-6">

        <GNB />

        {/* ── 선택한 카드 ── */}
        <section className="rounded-2xl bg-foreground text-background p-5 text-center">
          <p className="text-xs text-background/60 mb-1">
            {questionLabels[result.questionType]} 타로
          </p>
          <p className="text-2xl font-bold">{result.card.nameKo}</p>
          <p className="text-sm text-background/60 mt-1">{result.card.name}</p>
          <div className="flex justify-center gap-2 mt-3">
            {result.card.keywords.map((kw) => (
              <span key={kw} className="text-xs px-2 py-0.5 rounded-full bg-background/20">
                {kw}
              </span>
            ))}
          </div>
        </section>

        {/* ── 카드 의미 ── */}
        <section className="rounded-2xl bg-background border border-border p-5">
          <p className="text-sm font-semibold text-foreground">{result.cardMeaning}</p>
        </section>

        {/* ── 카드 해석 ── */}
        <section className="rounded-2xl bg-background border border-border p-5">
          <h2 className="text-xs font-medium text-muted-foreground mb-2">카드 해석</h2>
          <p className="text-sm text-foreground leading-relaxed">{result.interpretation}</p>
        </section>

        {/* ── 오늘의 조언 ── */}
        <section className="rounded-2xl bg-background border border-border p-5">
          <h2 className="text-xs font-medium text-muted-foreground mb-2">오늘의 조언</h2>
          <p className="text-sm font-medium text-foreground">{result.advice}</p>
        </section>

        {/* ── 한 줄 정리 ── */}
        <section className="rounded-2xl bg-foreground text-background p-5 text-center">
          <p className="text-xs text-background/60 mb-1">한 줄 정리</p>
          <p className="text-base font-bold">{result.oneLiner}</p>
        </section>

        {/* ── 하단 버튼들 ── */}
        <div className="flex flex-col gap-2 mt-2">
          <Button
            onClick={() => {
              sessionStorage.removeItem('tarotResult');
              router.push('/tarot');
            }}
            className="h-12 w-full rounded-xl text-base font-semibold"
            size="lg"
          >
            다시 뽑기
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
