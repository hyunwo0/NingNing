// ==========================================
// 타로 입력 페이지 (/tarot)
// ==========================================
//
// 질문 유형 선택 + 카드 3장 중 1장 뽑기

'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getRandomCards, type TarotCard } from '@/lib/tarot/cards';
import GNB from '@/components/layout/GNB';

const QUESTION_TYPES = [
  { id: 'love', label: '연애', description: '사랑과 관계' },
  { id: 'career', label: '진로', description: '일과 커리어' },
  { id: 'today', label: '오늘', description: '오늘 하루' },
] as const;

type QuestionType = (typeof QUESTION_TYPES)[number]['id'];

export default function TarotPage() {
  const router = useRouter();
  const [questionType, setQuestionType] = useState<QuestionType | null>(null);
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);

  // 페이지 진입 시 랜덤 카드 3장 배정
  const cards = useMemo(() => getRandomCards(3), []);

  const selectedCard: TarotCard | null = selectedCardIndex !== null ? cards[selectedCardIndex] : null;

  const handleSubmit = () => {
    if (!questionType || !selectedCard) return;

    sessionStorage.setItem('tarotInput', JSON.stringify({
      questionType,
      card: selectedCard,
    }));
    sessionStorage.removeItem('tarotResult');

    router.push('/loading-screen?type=tarot');
  };

  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 dark:bg-black min-h-screen">
      <main className="flex flex-col w-full max-w-md px-6">

        {/* ── GNB 헤더 ── */}
        <GNB title="타로" />

        <div className="flex flex-col gap-8 py-8">
          {/* ── 타이틀 ── */}
          <div>
            <h1 className="text-2xl font-bold text-foreground">타로 한 장</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              궁금한 주제를 고르고 카드를 한 장 뽑아보세요
            </p>
          </div>

          {/* ── 질문 유형 선택 ── */}
          <section className="space-y-2">
            <label className="text-sm font-medium text-foreground">어떤 게 궁금해요?</label>
            <div className="grid grid-cols-3 gap-2">
              {QUESTION_TYPES.map((q) => (
                <button
                  key={q.id}
                  onClick={() => setQuestionType(q.id)}
                  className={`py-3 rounded-xl border text-sm font-medium transition-colors ${
                    questionType === q.id
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border bg-background text-foreground hover:bg-muted'
                  }`}
                >
                  {q.label}
                </button>
              ))}
            </div>
          </section>

          {/* ── 카드 뽑기 ── */}
          <section className="space-y-3">
            <label className="text-sm font-medium text-foreground">카드를 한 장 선택하세요</label>
            <div className="flex justify-center gap-4">
              {cards.map((card, index) => (
                <button
                  key={card.id}
                  onClick={() => setSelectedCardIndex(index)}
                  className={`relative w-24 h-36 rounded-xl border-2 transition-all duration-300 ${
                    selectedCardIndex === index
                      ? 'border-foreground bg-foreground text-background scale-105 shadow-lg'
                      : selectedCardIndex !== null && selectedCardIndex !== index
                        ? 'border-border bg-muted/50 opacity-50'
                        : 'border-border bg-background hover:border-foreground/50 hover:-translate-y-1'
                  }`}
                >
                  {selectedCardIndex === index ? (
                    // 선택된 카드: 앞면
                    <div className="flex flex-col items-center justify-center h-full p-2">
                      <span className="text-2xl mb-1">✨</span>
                      <span className="text-[10px] font-bold text-center leading-tight">
                        {card.nameKo}
                      </span>
                    </div>
                  ) : (
                    // 뒷면
                    <div className="flex flex-col items-center justify-center h-full">
                      <span className="text-3xl">🃏</span>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* 선택된 카드 정보 */}
            {selectedCard && (
              <div className="text-center mt-2">
                <p className="text-sm font-semibold text-foreground">
                  {selectedCard.nameKo} ({selectedCard.name})
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedCard.keywords.join(' · ')}
                </p>
              </div>
            )}
          </section>

          {/* ── CTA ── */}
          <Button
            onClick={handleSubmit}
            disabled={!questionType || !selectedCard}
            className="h-12 w-full rounded-xl text-base font-semibold"
            size="lg"
          >
            타로 해석 보기
          </Button>
        </div>
      </main>
    </div>
  );
}
