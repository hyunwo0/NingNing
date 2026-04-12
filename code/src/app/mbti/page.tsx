// ==========================================
// MBTI 운세 입력 페이지 (/mbti)
// ==========================================

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import GNB from '@/components/layout/GNB';

const MBTI_TYPES = [
  ['INTJ', 'INTP', 'ENTJ', 'ENTP'],
  ['INFJ', 'INFP', 'ENFJ', 'ENFP'],
  ['ISTJ', 'ISFJ', 'ESTJ', 'ESFJ'],
  ['ISTP', 'ISFP', 'ESTP', 'ESFP'],
];

export default function MbtiPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!selected) return;
    sessionStorage.setItem('mbtiInput', JSON.stringify({ mbtiType: selected }));
    sessionStorage.removeItem('mbtiResult');
    router.push('/loading-screen?type=mbti');
  };

  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 dark:bg-black min-h-screen">
      <main className="flex flex-col w-full max-w-md px-6">

        <GNB />

        <div className="flex flex-col gap-8 py-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">MBTI 운세</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              내 유형을 선택하면 오늘의 맞춤 운세를 알려드려요
            </p>
          </div>

          <section className="space-y-2">
            {MBTI_TYPES.map((row, i) => (
              <div key={i} className="grid grid-cols-4 gap-2">
                {row.map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelected(type)}
                    className={`py-3 rounded-xl border text-sm font-medium transition-colors ${
                      selected === type
                        ? 'border-foreground bg-foreground text-background'
                        : 'border-border bg-background text-foreground hover:bg-muted'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            ))}
          </section>

          <Button
            onClick={handleSubmit}
            disabled={!selected}
            className="h-12 w-full rounded-xl text-base font-semibold"
            size="lg"
          >
            MBTI 운세 보기
          </Button>
        </div>
      </main>
    </div>
  );
}
