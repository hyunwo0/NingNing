// ==========================================
// 공유용 카드 컴포넌트 (ShareCard)
// ==========================================
//
// [역할]
// 운세 결과를 시각적으로 정리한 카드 UI를 렌더링합니다.
// ShareModal에서 미리보기용으로 사용되며,
// Canvas API로 이미지를 생성할 때 데이터를 전달하는 역할도 합니다.

'use client';

import { forwardRef } from 'react';

// ── 공유 카드에 필요한 데이터 타입 ──
export interface ShareCardData {
  dailySummary: string;
  love: { score: number; keyword: string };
  work: { score: number; keyword: string };
  money: { score: number; keyword: string };
  luckyHints: string[];
}

interface ShareCardProps {
  data: ShareCardData;
}

// 오늘 날짜를 한국어 형식으로 포맷
function formatKoreanDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  const weekday = weekdays[now.getDay()];
  return `${year}년 ${month}월 ${day}일 (${weekday})`;
}

// 점수에 따른 바 색상 클래스
function getBarColorClass(score: number): string {
  if (score >= 7) return 'bg-green-500';
  if (score >= 4) return 'bg-yellow-500';
  return 'bg-red-400';
}

const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(
  function ShareCard({ data }, ref) {
    const axes = [
      { label: '연애', emoji: '💕', score: data.love.score, keyword: data.love.keyword },
      { label: '일/직장', emoji: '💼', score: data.work.score, keyword: data.work.keyword },
      { label: '재물', emoji: '💰', score: data.money.score, keyword: data.money.keyword },
    ];

    return (
      <div
        ref={ref}
        className="w-[360px] bg-zinc-900 text-white rounded-2xl p-6 flex flex-col gap-5"
      >
        {/* 상단: 로고 + 날짜 */}
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">NingNing</h1>
          <p className="text-xs text-zinc-400 mt-1">{formatKoreanDate()}</p>
        </div>

        {/* 한 줄 총평 */}
        <div className="bg-zinc-800 rounded-xl p-4">
          <p className="text-base font-semibold leading-relaxed">
            {data.dailySummary}
          </p>
        </div>

        {/* 3축 키워드 + 점수 바 */}
        <div className="flex flex-col gap-3">
          {axes.map((axis) => (
            <div key={axis.label} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {axis.emoji} {axis.label}
                </span>
                <span className="text-xs text-zinc-400 px-2 py-0.5 rounded-full bg-zinc-800">
                  {axis.keyword}
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-zinc-700">
                <div
                  className={`h-full rounded-full ${getBarColorClass(axis.score)} transition-all`}
                  style={{ width: `${axis.score * 10}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* 행운 단서 */}
        {data.luckyHints.length > 0 && (
          <div>
            <p className="text-xs text-zinc-400 mb-2">행운 단서</p>
            <div className="flex flex-wrap gap-1.5">
              {data.luckyHints.map((hint) => (
                <span
                  key={hint}
                  className="text-xs px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-200"
                >
                  {hint}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 하단 워터마크 */}
        <div className="text-center pt-2 border-t border-zinc-700">
          <p className="text-[10px] text-zinc-500">NingNing AI 운세</p>
        </div>
      </div>
    );
  },
);

export default ShareCard;
