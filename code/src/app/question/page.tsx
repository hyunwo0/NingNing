// ==========================================
// AI 추가질문 페이지 (/question)
// ==========================================
//
// [역할]
// 운세 결과를 본 사용자가 개인 상황에 맞는 질문을 할 수 있는 채팅 페이지입니다.
// 사주 맥락을 기반으로 AI가 맞춤 답변을 생성합니다.
//
// [무료/유료 규칙]
// - 무료 질문: 2회
// - 이후 질문: 유료 (결제 기능 추가 전까지는 2회 제한만 적용)
//
// [데이터 흐름]
// sessionStorage에서 사주 분석 결과(sajuResult)를 읽어와서
// 각 질문마다 /api/question에 사주 데이터 + 질문 + 이전 대화를 함께 전송합니다.

'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

// ──────────────────────────────────────────
// 상수
// ──────────────────────────────────────────

const MAX_FREE_QUESTIONS = 2; // 무료 질문 횟수

// 질문 예시 (사용자가 뭘 물어볼지 모를 때 도움)
const EXAMPLE_QUESTIONS = [
  '이직을 준비 중인데 지금 움직여도 될까요?',
  '최근 만난 사람과 잘 될 수 있을까요?',
  '이번 달 큰 지출을 해도 괜찮을까요?',
  '시험을 앞두고 있는데 결과가 어떨까요?',
];

// ──────────────────────────────────────────
// 타입
// ──────────────────────────────────────────

interface QAItem {
  question: string;
  answer: string;
}

// ──────────────────────────────────────────
// 메인 컴포넌트
// ──────────────────────────────────────────

export default function QuestionPage() {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);

  // 사주 분석 데이터 (sessionStorage에서 로드)
  const [sajuData, setSajuData] = useState<{
    analysis: Record<string, unknown>;
    daily: Record<string, unknown>;
    gender: string;
  } | null>(null);

  // 대화 이력
  const [qaHistory, setQaHistory] = useState<QAItem[]>([]);

  // 입력 상태
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // 남은 무료 질문 수
  const remainingFree = MAX_FREE_QUESTIONS - qaHistory.length;
  const isLimitReached = remainingFree <= 0;

  // sessionStorage에서 사주 데이터 + 대화 이력 로드
  useEffect(() => {
    const sajuResult = sessionStorage.getItem('sajuResult');
    const sajuInput = sessionStorage.getItem('sajuInput');

    if (!sajuResult || !sajuInput) {
      router.replace('/input');
      return;
    }

    const result = JSON.parse(sajuResult);
    const input = JSON.parse(sajuInput);

    setSajuData({
      analysis: {
        fourPillars: result.fourPillars,
        fiveElements: result.fiveElements,
        dayMaster: result.dayMaster,
        dayMasterElement: result.dayMasterElement,
        dayMasterStrength: result.dayMasterStrength,
      },
      daily: result.daily,
      gender: input.gender,
    });

    // 캐시된 대화 이력 복원
    const cachedQA = sessionStorage.getItem('sajuQAHistory');
    if (cachedQA) {
      setQaHistory(JSON.parse(cachedQA));
    }
  }, [router]);

  // 새 답변이 오면 스크롤 하단으로
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [qaHistory, isLoading]);

  // 질문 제출
  async function handleSubmit() {
    if (!inputText.trim() || !sajuData || isLoading || isLimitReached) return;

    const question = inputText.trim();
    setInputText('');
    setError('');
    setIsLoading(true);

    try {
      let res: Response;
      try {
        res = await fetch('/api/question', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            analysis: sajuData.analysis,
            daily: sajuData.daily,
            gender: sajuData.gender,
            question,
            previousQA: qaHistory,
          }),
        });
      } catch {
        // 네트워크 오류 (오프라인 등)
        throw new Error('네트워크 연결을 확인해주세요.');
      }

      if (!res.ok) {
        let errMsg = '답변 생성 실패';
        try {
          const err = await res.json();
          errMsg = err.error || errMsg;
        } catch {
          // JSON 파싱 실패 시 기본 메시지 사용
        }
        throw new Error(errMsg);
      }

      const data = await res.json();

      setQaHistory(prev => {
        const updated = [...prev, { question, answer: data.answer }];
        sessionStorage.setItem('sajuQAHistory', JSON.stringify(updated));
        return updated;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다');
      // 실패한 질문은 입력창에 복원
      setInputText(question);
    } finally {
      setIsLoading(false);
    }
  }

  // 예시 질문 클릭
  function handleExampleClick(q: string) {
    setInputText(q);
  }

  // Enter 키로 제출
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  // 데이터 로딩 중
  if (!sajuData) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-screen bg-zinc-50 dark:bg-black">
        <p className="text-sm text-muted-foreground">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-zinc-50 dark:bg-black">
      {/* ── 헤더 ── */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-background">
        <button
          onClick={() => router.back()}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <BackIcon />
        </button>
        <h1 className="text-sm font-semibold text-foreground">AI 추가질문</h1>
        <span className="text-xs text-muted-foreground">
          {isLimitReached ? '무료 소진' : `${remainingFree}회 남음`}
        </span>
      </header>

      {/* ── 대화 영역 ── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="max-w-md mx-auto px-4 py-6 space-y-4">
          {/* 안내 메시지 */}
          {qaHistory.length === 0 && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-background border border-border p-4">
                <p className="text-sm text-foreground leading-relaxed">
                  오늘의 사주 흐름을 바탕으로 궁금한 점을 물어보세요.
                  연애, 직장, 재물 등 구체적인 상황을 말씀해주시면
                  더 정확한 답변을 드릴 수 있습니다.
                </p>
              </div>

              {/* 예시 질문 */}
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">이런 질문을 해보세요</p>
                <div className="flex flex-col gap-2">
                  {EXAMPLE_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => handleExampleClick(q)}
                      className="text-left text-sm px-4 py-3 rounded-xl border border-border bg-background text-foreground hover:bg-muted transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Q&A 이력 */}
          {qaHistory.map((qa, i) => (
            <div key={i} className="space-y-3">
              {/* 사용자 질문 (오른쪽 정렬) */}
              <div className="flex justify-end">
                <div className="max-w-[80%] rounded-2xl rounded-br-md bg-foreground text-background px-4 py-3">
                  <p className="text-sm">{qa.question}</p>
                </div>
              </div>

              {/* AI 답변 (왼쪽 정렬) */}
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-2xl rounded-bl-md bg-background border border-border px-4 py-3">
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                    {qa.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* 로딩 표시 */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-bl-md bg-background border border-border px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="size-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="size-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          {/* 에러 메시지 + 다시 시도 버튼 */}
          {error && (
            <div className="rounded-xl bg-destructive/10 px-4 py-3 flex items-center justify-between gap-3">
              <p className="text-sm text-destructive">{error}</p>
              <button
                onClick={() => {
                  setError('');
                  handleSubmit();
                }}
                disabled={!inputText.trim() || isLoading}
                className="shrink-0 text-xs font-medium text-destructive hover:text-destructive/80 transition-colors disabled:opacity-50"
              >
                다시 시도
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── 입력 영역 ── */}
      <div className="border-t border-border bg-background px-4 py-3">
        <div className="max-w-md mx-auto">
          {isLimitReached ? (
            // 무료 횟수 소진 시
            <div className="text-center space-y-3 py-2">
              <p className="text-sm text-muted-foreground">
                무료 질문 {MAX_FREE_QUESTIONS}회를 모두 사용했습니다
              </p>
              <Button
                onClick={() => router.push('/result')}
                variant="outline"
                className="rounded-xl"
              >
                결과 화면으로 돌아가기
              </Button>
            </div>
          ) : (
            // 질문 입력
            <div className="flex gap-2">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="궁금한 점을 물어보세요..."
                rows={1}
                disabled={isLoading}
                className="flex-1 resize-none rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/50 focus:outline-none disabled:opacity-50"
              />
              <Button
                onClick={handleSubmit}
                disabled={!inputText.trim() || isLoading}
                className="rounded-xl px-4 self-end"
              >
                <SendIcon />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────
// 아이콘
// ──────────────────────────────────────────

function BackIcon() {
  return (
    <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" />
      <path d="m21.854 2.147-10.94 10.939" />
    </svg>
  );
}
