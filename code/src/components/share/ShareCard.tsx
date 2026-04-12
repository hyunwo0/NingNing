// ==========================================
// 범용 공유 카드 컴포넌트 (ShareCard)
// ==========================================
//
// 모든 운세 타입(사주/타로/MBTI/궁합/관상)의
// 공유 카드를 하나의 컴포넌트로 처리합니다.

'use client';

import { forwardRef } from 'react';

// ── 공통 공유 데이터 ──
export interface ShareCardData {
  type: 'saju' | 'tarot' | 'mbti' | 'compatibility' | 'face';
  typeLabel: string;        // "오늘의 운세", "타로", "MBTI", "궁합", "관상"
  image?: string | null;    // AI 생성 이미지 (base64)
  content: SajuShareContent | TarotShareContent | MbtiShareContent | CompatibilityShareContent | FaceShareContent;
}

export interface SajuShareContent {
  type: 'saju';
  strategy: string;
  love: { status: string; score: number };
  work: { status: string; score: number };
  money: { status: string; score: number };
}

export interface TarotShareContent {
  type: 'tarot';
  questionType: string;
  cardName: string;
  keywords: string[];
  advice: string;
}

export interface MbtiShareContent {
  type: 'mbti';
  mbtiType: string;
  title: string;
}

export interface CompatibilityShareContent {
  type: 'compatibility';
  person1Name: string;
  person2Name: string;
  totalScore: number;
  summary: string;
  love: number;
  friendship: number;
  work: number;
}

export interface FaceShareContent {
  type: 'face';
  title: string;
  firstImpression: string;
  personality: string;
  charm: string;
}

// 첫 문장만 추출
function firstSentence(text: string): string {
  const idx = text.indexOf('.');
  return idx >= 0 ? text.slice(0, idx + 1) : text;
}

function formatKoreanDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  return `${year}년 ${month}월 ${day}일 (${weekdays[now.getDay()]})`;
}

const ShareCard = forwardRef<HTMLDivElement, { data: ShareCardData }>(  
  function ShareCard({ data }, ref) {
    return (
      <div
        ref={ref}
        className="w-[360px] bg-zinc-900 text-white rounded-2xl overflow-hidden flex flex-col"
      >
        {/* AI 이미지 */}
        {data.image && (
          <img src={data.image} alt="" className="w-full aspect-square object-cover" />
        )}

        <div className="p-5 flex flex-col gap-4">
          {/* 타입 + 날짜 */}
          <div className="text-center">
            <p className="text-xs text-zinc-400">{data.typeLabel}</p>            
          </div>

          {/* 타입별 콘텐츠 */}
          <ShareContent content={data.content} />

          {/* 워터마크 */}
          <div className="text-center pt-2 border-t border-zinc-700">
            <p className="text-[10px] text-zinc-500">NingNing</p>
          </div>
        </div>
      </div>
    );
  },
);

export default ShareCard;

// ──────────────────────────────────────────
// 타입별 콘텐츠 렌더링
// ──────────────────────────────────────────

function ShareContent({ content }: { content: ShareCardData['content'] }) {
  switch (content.type) {
    case 'saju':
      return <SajuContent content={content} />;
    case 'tarot':
      return <TarotContent content={content} />;
    case 'mbti':
      return <MbtiContent content={content} />;
    case 'compatibility':
      return <CompatibilityContent content={content} />;
    case 'face':
      return <FaceContent content={content} />;
  }
}

function SajuContent({ content }: { content: SajuShareContent }) {
  const axes = [
    { label: '연애', status: content.love.status, score: content.love.score },
    { label: '일/직장', status: content.work.status, score: content.work.score },
    { label: '재물', status: content.money.status, score: content.money.score },
  ];
  const barColor = (score: number) => score >= 7 ? 'bg-green-500' : score >= 4 ? 'bg-yellow-500' : 'bg-red-400';
  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-center">{content.strategy}</p>
      <div className="space-y-2.5">
        {axes.map(axis => (
          <div key={axis.label} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400">{axis.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-zinc-500">{axis.score}/10</span>
                <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 text-[10px]">{axis.status}</span>
              </div>
            </div>
            <div className="w-full h-1.5 rounded-full bg-zinc-700">
              <div className={`h-full rounded-full ${barColor(axis.score)}`} style={{ width: `${axis.score * 10}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TarotContent({ content }: { content: TarotShareContent }) {
  const typeLabels: Record<string, string> = { love: '연애', career: '진로', today: '오늘' };
  return (
    <div className="text-center space-y-2">
      <p className="text-xs text-zinc-400">{typeLabels[content.questionType] || content.questionType} 타로</p>
      <p className="text-lg font-bold">{content.cardName}</p>
      <div className="flex justify-center gap-2">
        {content.keywords.map(kw => (
          <span key={kw} className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">{kw}</span>
        ))}
      </div>
      <p className="text-sm text-white mt-3">{content.advice}</p>
    </div>
  );
}

function MbtiContent({ content }: { content: MbtiShareContent }) {
  return (
    <div className="text-center space-y-2">
      <p className="text-3xl font-bold">{content.mbtiType}</p>
      <p className="text-sm text-zinc-300">{content.title}</p>
    </div>
  );
}

function CompatibilityContent({ content }: { content: CompatibilityShareContent }) {
  const axes = [
    { label: '연애', score: content.love },
    { label: '친구', score: content.friendship },
    { label: '일', score: content.work },
  ];
  const barColor = (score: number) => score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-400';
  return (
    <div className="space-y-3">
      <div className="text-center">
        <p className="text-sm font-semibold">{content.person1Name} ♥ {content.person2Name}</p>
        <p className="text-2xl font-bold mt-1">{content.totalScore}<span className="text-sm text-zinc-400">점</span></p>
        <p className="text-xs text-zinc-400 mt-1">{content.summary}</p>
      </div>
      <div className="space-y-2">
        {axes.map(axis => (
          <div key={axis.label} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400">{axis.label}</span>
              <span className="text-zinc-500">{axis.score}점</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-zinc-700">
              <div className={`h-full rounded-full ${barColor(axis.score)}`} style={{ width: `${axis.score}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FaceContent({ content }: { content: FaceShareContent }) {
  return (
    <div className="space-y-2 text-xs">
      <p className="text-sm font-semibold text-center text-white mb-2">{content.title}</p>
      <div>
        <p className="text-zinc-400">첫인상</p>
        <p className="text-zinc-200">{firstSentence(content.firstImpression)}</p>
      </div>
      <div>
        <p className="text-zinc-400">성격</p>
        <p className="text-zinc-200">{firstSentence(content.personality)}</p>
      </div>
      <div>
        <p className="text-zinc-400">매력</p>
        <p className="text-zinc-200">{firstSentence(content.charm)}</p>
      </div>
    </div>
  );
}
