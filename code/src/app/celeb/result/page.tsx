// ==========================================
// 나와 맞는 연예인 결과 페이지 (/celeb/result)
// ==========================================

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface CelebResult {
  matches: {
    rank: number;
    name: string;
    group: string;
    reason: string;
    compatibility: string;
  }[];
  summary: string;
}

const RANK_BADGES = ['🥇', '🥈', '🥉'];

export default function CelebResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<CelebResult | null>(null);

  useEffect(() => {
    const cached = sessionStorage.getItem('celebResult');
    if (cached) {
      setResult(JSON.parse(cached));
    } else {
      router.replace('/');
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
          <p className="text-xl font-bold">나와 맞는 연예인 TOP 3</p>
          <p className="text-sm text-background/60 mt-1">{result.summary}</p>
        </section>

        {/* 매칭 결과 */}
        {result.matches.map((match, index) => (
          <section key={match.rank} className="rounded-2xl bg-background border border-border p-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{RANK_BADGES[index]}</span>
              <div>
                <p className="text-base font-bold text-foreground">{match.name}</p>
                <p className="text-xs text-muted-foreground">{match.group}</p>
              </div>
            </div>
            <p className="text-sm text-foreground leading-relaxed mt-2">{match.reason}</p>
            <p className="text-xs text-muted-foreground mt-2">{match.compatibility}</p>
          </section>
        ))}

        {/* 하단 버튼 */}
        <div className="flex flex-col gap-2 mt-2">
          <Button
            onClick={() => {
              sessionStorage.removeItem('celebResult');
              router.push('/celeb');
            }}
            className="h-12 w-full rounded-xl text-base font-semibold"
            size="lg"
          >
            다시 해보기
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
