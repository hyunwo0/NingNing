// ==========================================
// MBTI 운세 결과 페이지 (/mbti/result)
// ==========================================

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import GNB from '@/components/layout/GNB';
import ShareModal from '@/components/share/ShareModal';
import type { ShareCardData } from '@/components/share/ShareCard';

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

  const [aiImage, setAiImage] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    const cached = sessionStorage.getItem('mbtiResult');
    if (cached) {
      setResult(JSON.parse(cached));
    } else {
      router.replace('/mbti');
      return;
    }
    const img = sessionStorage.getItem('mbtiImage');
    if (img) setAiImage(img);
  }, [router]);

  if (!result) {
    return <div className="flex flex-1 bg-zinc-50 dark:bg-black min-h-screen" />;
  }

  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 dark:bg-black">
      <main className="flex flex-col w-full max-w-md px-6 pb-8 gap-6">

        <GNB title="MBTI" />

        {aiImage && (
          <section className="rounded-2xl overflow-hidden">
            <img src={aiImage} alt="MBTI 결과" className="w-full aspect-square object-cover" />
          </section>
        )}

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
            onClick={() => setShowShareModal(true)}
            variant="outline"
            className="h-11 w-full rounded-xl"
          >
            공유하기
          </Button>
          <Button
            onClick={() => router.push('/')}
            variant="outline"
            className="h-11 w-full rounded-xl"
          >
            홈으로
          </Button>
        </div>

        {showShareModal && (
          <ShareModal
            data={{ type: 'mbti', typeLabel: 'MBTI', image: aiImage, content: { type: 'mbti', mbtiType: result.mbtiType, title: result.title } } satisfies ShareCardData}
            onClose={() => setShowShareModal(false)}
          />
        )}

      </main>
    </div>
  );
}
