// ==========================================
// AI 관상 결과 페이지 (/face/result)
// ==========================================

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import GNB from '@/components/layout/GNB';

interface FaceResult {
  title: string;
  firstImpression: string;
  personality: string;
  charm: string;
  oneLiner: string;
}

export default function FaceResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<FaceResult | null>(null);

  const [aiImage, setAiImage] = useState<string | null>(null);

  useEffect(() => {
    const cached = sessionStorage.getItem('faceResult');
    if (cached) {
      setResult(JSON.parse(cached));
    } else {
      router.replace('/face');
      return;
    }
    const img = sessionStorage.getItem('faceImage');
    if (img) setAiImage(img);
  }, [router]);

  if (!result) {
    return <div className="flex flex-1 bg-zinc-50 dark:bg-black min-h-screen" />;
  }

  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 dark:bg-black">
      <main className="flex flex-col w-full max-w-md px-6 pb-8 gap-6">

        <GNB title="관상" />

        {aiImage && (
          <section className="rounded-2xl overflow-hidden">
            <img src={aiImage} alt="관상 결과" className="w-full aspect-square object-cover" />
          </section>
        )}

        {/* 타이틀 */}
        <section className="rounded-2xl bg-foreground text-background p-5 text-center">
          <p className="text-xs text-background/60 mb-1">AI가 읽은 내 얼굴</p>
          <p className="text-xl font-bold">{result.title}</p>
        </section>

        {/* 첫인상 */}
        <section className="rounded-2xl bg-background border border-border p-5">
          <h2 className="text-xs font-medium text-muted-foreground mb-2">첫인상</h2>
          <p className="text-sm text-foreground leading-relaxed">{result.firstImpression}</p>
        </section>

        {/* 성격 & 성향 */}
        <section className="rounded-2xl bg-background border border-border p-5">
          <h2 className="text-xs font-medium text-muted-foreground mb-2">성격 &amp; 성향</h2>
          <p className="text-sm text-foreground leading-relaxed">{result.personality}</p>
        </section>

        {/* 숨겨진 매력 포인트 */}
        <section className="rounded-2xl bg-background border border-border p-5">
          <h2 className="text-xs font-medium text-muted-foreground mb-2">숨겨진 매력 포인트</h2>
          <p className="text-sm text-foreground leading-relaxed">{result.charm}</p>
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
              sessionStorage.removeItem('faceResult');
              sessionStorage.removeItem('faceInput');
              router.push('/face');
            }}
            className="h-12 w-full rounded-xl text-base font-semibold"
            size="lg"
          >
            다시 분석하기
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
