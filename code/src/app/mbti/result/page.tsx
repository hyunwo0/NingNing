// ==========================================
// MBTI 운세 결과 페이지 (/mbti/result)
// ==========================================

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface MbtiResult {
  mbtiType: string;
  title: string;
  mood: string;
  advice: string;
  caution: string;
  oneLiner: string;
}

export default function MbtiResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<MbtiResult | null>(null);

  useEffect(() => {
    const cached = sessionStorage.getItem('mbtiResult');
    if (cached) {
      setResult(JSON.parse(cached));
    } else {
      router.replace('/mbti');
    }
  }, [router]);

  if (!result) {
    return <div className="flex flex-1 bg-zinc-50 dark:bg-black min-h-screen" />;
  }

  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 dark:bg-black">
      <main className="flex flex-col w-full max-w-md px-6 py-8 gap-6">

        <div className="flex items-center">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            홈으로
          </Link>
        </div>

        {/* 타이틀 */}
        <section className="rounded-2xl bg-foreground text-background p-5 text-center">
          <p className="text-xs text-background/60 mb-1">{result.mbtiType}의 오늘</p>
          <p className="text-xl font-bold">{result.title}</p>
        </section>

        {/* 오늘의 무드 */}
        <section className="rounded-2xl bg-background border border-border p-5">
          <h2 className="text-xs font-medium text-muted-foreground mb-2">오늘의 무드</h2>
          <p className="text-sm text-foreground leading-relaxed">{result.mood}</p>
        </section>

        {/* 오늘의 조언 */}
        <section className="rounded-2xl bg-background border border-border p-5">
          <h2 className="text-xs font-medium text-muted-foreground mb-2">오늘의 조언</h2>
          <p className="text-sm font-medium text-foreground">{result.advice}</p>
        </section>

        {/* 주의할 점 */}
        <section className="rounded-2xl bg-background border border-border p-5">
          <h2 className="text-xs font-medium text-muted-foreground mb-2">주의할 점</h2>
          <p className="text-sm text-foreground">{result.caution}</p>
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
              sessionStorage.removeItem('mbtiResult');
              router.push('/mbti');
            }}
            className="h-12 w-full rounded-xl text-base font-semibold"
            size="lg"
          >
            다시 선택하기
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
