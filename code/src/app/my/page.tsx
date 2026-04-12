// ==========================================
// 마이 페이지 (/my)
// ==========================================
//
// [역할]
// 로그인한 사용자의 정보와 저장된 운세 결과를 보여주는 페이지입니다.
//
// [화면 구성]
// - 사용자 이메일/이름 표시
// - 저장된 운세 결과 목록 (localStorage에서 로드)
// - 로그아웃 버튼
// - 계정 삭제 링크

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/auth/AuthProvider';
import GNB from '@/components/layout/GNB';

// ── 저장된 결과 타입 ──
interface SavedResult {
  id: string;                // 저장 시점의 고유 ID
  date: string;              // 저장 날짜
  dailySummary: string;      // 한 줄 총평
  keywords: string[];        // 키워드 배열
  scores: {                  // 3축 점수
    love: number;
    work: number;
    money: number;
  };
}

export default function MyPage() {
  const router = useRouter();
  const { user, loading, signOut } = useAuth();
  const [savedResults, setSavedResults] = useState<SavedResult[]>([]);
  const [showDeleteNotice, setShowDeleteNotice] = useState(false);

  // 로그인 확인 — 미로그인 시 로그인 페이지로 이동
  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [loading, user, router]);

  // localStorage에서 저장된 결과 로드
  useEffect(() => {
    try {
      const raw = localStorage.getItem('savedResults');
      if (raw) {
        const parsed: SavedResult[] = JSON.parse(raw);
        // 최신 순으로 정렬
        parsed.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setSavedResults(parsed);
      }
    } catch {
      // localStorage 읽기 실패 시 무시
    }
  }, []);

  // 저장된 결과 삭제 핸들러
  const handleDeleteResult = (id: string) => {
    const updated = savedResults.filter((r) => r.id !== id);
    setSavedResults(updated);
    localStorage.setItem('savedResults', JSON.stringify(updated));
  };

  // 로그아웃 핸들러
  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  // 로딩 중 또는 미로그인 상태면 로딩 표시
  if (loading || !user) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 dark:bg-black min-h-screen">
        <div className="size-8 animate-spin text-muted-foreground">
          <svg viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 dark:bg-black min-h-screen">
      <main className="flex flex-col w-full max-w-md px-6 py-8 gap-6">

        <GNB title="마이페이지" />

        {/* ── 사용자 정보 영역 ── */}
        <section className="rounded-2xl bg-background border border-border p-5">
          <div className="flex items-center gap-3">
            {/* 사용자 아바타 */}
            <div className="size-12 rounded-full bg-foreground/10 flex items-center justify-center">
              <svg className="size-6 text-foreground/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="4" />
                <path d="M20 21a8 8 0 0 0-16 0" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">
                {user.user_metadata?.full_name || user.user_metadata?.name || '회원'}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user.email}
              </p>
            </div>
          </div>
        </section>

        {/* ── 저장된 결과 목록 ── */}
        <section>
          <h2 className="text-sm font-medium text-muted-foreground mb-3">
            저장된 운세 ({savedResults.length})
          </h2>

          {savedResults.length === 0 ? (
            <div className="rounded-2xl bg-background border border-border p-8 text-center">
              {/* 빈 상태 아이콘 */}
              <div className="size-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                <svg className="size-6 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <p className="text-sm text-muted-foreground">
                저장된 운세가 없습니다
              </p>
              <Link
                href="/input"
                className="inline-flex mt-3 text-sm text-foreground font-medium hover:underline"
              >
                운세 보러 가기 →
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {savedResults.map((result) => (
                <div
                  key={result.id}
                  className="rounded-2xl bg-background border border-border p-4 group"
                >
                  {/* 날짜와 삭제 버튼 */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">{result.date}</span>
                    <button
                      onClick={() => handleDeleteResult(result.id)}
                      className="text-xs text-muted-foreground hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      aria-label="삭제"
                    >
                      <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      </svg>
                    </button>
                  </div>

                  {/* 총평 */}
                  <p className="text-sm font-medium text-foreground mb-2">
                    {result.dailySummary}
                  </p>

                  {/* 키워드 */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {result.keywords.map((kw) => (
                      <span key={kw} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        {kw}
                      </span>
                    ))}
                  </div>

                  {/* 3축 점수 바 */}
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    <ScoreBadge label="연애" score={result.scores.love} />
                    <ScoreBadge label="일" score={result.scores.work} />
                    <ScoreBadge label="재물" score={result.scores.money} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── 하단 버튼들 ── */}
        <div className="flex flex-col gap-2 mt-4">
          <button
            onClick={handleSignOut}
            className="h-11 rounded-xl border border-border bg-background text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            로그아웃
          </button>

          <button
            onClick={() => setShowDeleteNotice(true)}
            className="text-xs text-muted-foreground hover:text-red-500 transition-colors py-2"
          >
            계정 삭제
          </button>
        </div>

        {/* ── 계정 삭제 안내 모달 ── */}
        {showDeleteNotice && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
            <div className="bg-background rounded-2xl p-6 w-full max-w-sm space-y-4">
              <h3 className="text-base font-semibold text-foreground">계정 삭제 안내</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                계정 삭제를 원하시면 아래 이메일로 문의해주세요.<br />
                확인 후 처리해드리겠습니다.
              </p>
              <p className="text-sm font-medium text-foreground">
                support@ningning.app
              </p>
              <button
                onClick={() => setShowDeleteNotice(false)}
                className="w-full h-10 rounded-xl bg-foreground text-background text-sm font-medium"
              >
                확인
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

// ── 점수 뱃지 컴포넌트 ──
function ScoreBadge({ label, score }: { label: string; score: number }) {
  const color = score >= 7 ? 'text-green-600 dark:text-green-400' : score >= 4 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-500 dark:text-red-400';
  return (
    <span className="flex items-center gap-1">
      <span>{label}</span>
      <span className={`font-medium ${color}`}>{score}</span>
    </span>
  );
}
