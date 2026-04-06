// ==========================================
// 공유 모달 컴포넌트 (ShareModal)
// ==========================================
//
// [역할]
// 운세 결과를 이미지로 저장하거나 링크를 복사할 수 있는 모달입니다.
//
// [기능]
// 1) ShareCard 미리보기 표시
// 2) "이미지 저장" — Canvas API로 PNG 생성 후 다운로드
// 3) "링크 복사" — 현재 URL을 클립보드에 복사
// 4) "닫기" — 모달 닫기

'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import ShareCard, { type ShareCardData } from './ShareCard';

interface ShareModalProps {
  data: ShareCardData;
  onClose: () => void;
}

// ── 오늘 날짜 포맷 (캔버스 드로잉용) ──
function formatKoreanDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  const weekday = weekdays[now.getDay()];
  return `${year}년 ${month}월 ${day}일 (${weekday})`;
}

// ── 점수에 따른 바 색상 (Canvas용 hex) ──
function getBarColor(score: number): string {
  if (score >= 7) return '#22c55e'; // green-500
  if (score >= 4) return '#eab308'; // yellow-500
  return '#f87171'; // red-400
}

// ── 텍스트 줄바꿈 처리 (Canvas에서 자동 줄바꿈 미지원) ──
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const lines: string[] = [];
  let currentLine = '';

  for (const char of text) {
    const testLine = currentLine + char;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine.length > 0) {
      lines.push(currentLine);
      currentLine = char;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

// ── Canvas API로 공유 이미지 생성 ──
function generateShareImage(data: ShareCardData): Promise<Blob> {
  const canvas = document.createElement('canvas');
  const W = 720;
  const H = 1080;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  // 배경 (zinc-900)
  ctx.fillStyle = '#18181b';
  // roundRect 폴리필: 지원하지 않는 브라우저를 위해 일반 rect도 fallback
  if (ctx.roundRect) {
    ctx.beginPath();
    ctx.roundRect(0, 0, W, H, 24);
    ctx.fill();
  } else {
    ctx.fillRect(0, 0, W, H);
  }

  const PADDING = 48;
  let y = 60;

  // 타이틀: "NingNing"
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('NingNing', W / 2, y);
  y += 32;

  // 날짜
  ctx.fillStyle = '#a1a1aa'; // zinc-400
  ctx.font = '18px sans-serif';
  ctx.fillText(formatKoreanDate(), W / 2, y);
  y += 50;

  // 한 줄 총평 배경
  ctx.textAlign = 'left';
  const summaryBoxX = PADDING;
  const summaryBoxW = W - PADDING * 2;

  // 총평 텍스트 줄바꿈 계산
  ctx.font = 'bold 26px sans-serif';
  const summaryLines = wrapText(ctx, data.dailySummary, summaryBoxW - 40);
  const summaryBoxH = Math.max(80, summaryLines.length * 36 + 40);

  // 총평 배경 박스 (zinc-800)
  ctx.fillStyle = '#27272a';
  if (ctx.roundRect) {
    ctx.beginPath();
    ctx.roundRect(summaryBoxX, y, summaryBoxW, summaryBoxH, 16);
    ctx.fill();
  } else {
    ctx.fillRect(summaryBoxX, y, summaryBoxW, summaryBoxH);
  }

  // 총평 텍스트
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 26px sans-serif';
  let textY = y + 36;
  for (const line of summaryLines) {
    ctx.fillText(line, summaryBoxX + 20, textY);
    textY += 36;
  }

  y += summaryBoxH + 40;

  // 3축 키워드 + 점수 바
  const axes = [
    { label: '💕 연애', score: data.love.score, keyword: data.love.keyword },
    { label: '💼 일/직장', score: data.work.score, keyword: data.work.keyword },
    { label: '💰 재물', score: data.money.score, keyword: data.money.keyword },
  ];

  for (const axis of axes) {
    // 축 레이블
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(axis.label, PADDING, y);

    // 키워드 태그
    ctx.fillStyle = '#a1a1aa';
    ctx.font = '18px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(axis.keyword, W - PADDING, y);

    y += 16;

    // 점수 바 배경 (zinc-700)
    const barX = PADDING;
    const barW = W - PADDING * 2;
    const barH = 12;
    ctx.fillStyle = '#3f3f46';
    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(barX, y, barW, barH, 6);
      ctx.fill();
    } else {
      ctx.fillRect(barX, y, barW, barH);
    }

    // 점수 바 채우기
    const fillW = barW * (axis.score / 10);
    ctx.fillStyle = getBarColor(axis.score);
    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(barX, y, fillW, barH, 6);
      ctx.fill();
    } else {
      ctx.fillRect(barX, y, fillW, barH);
    }

    y += barH + 28;
  }

  y += 10;

  // 행운 단서
  if (data.luckyHints.length > 0) {
    ctx.fillStyle = '#a1a1aa';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('행운 단서', PADDING, y);
    y += 28;

    // 행운 힌트를 가로로 배치
    let hintX = PADDING;
    ctx.font = '18px sans-serif';
    for (const hint of data.luckyHints) {
      const textWidth = ctx.measureText(hint).width;
      const chipW = textWidth + 28;
      const chipH = 34;

      // 줄바꿈 처리
      if (hintX + chipW > W - PADDING) {
        hintX = PADDING;
        y += chipH + 8;
      }

      // 힌트 배경 (zinc-800)
      ctx.fillStyle = '#27272a';
      if (ctx.roundRect) {
        ctx.beginPath();
        ctx.roundRect(hintX, y - 22, chipW, chipH, 17);
        ctx.fill();
      } else {
        ctx.fillRect(hintX, y - 22, chipW, chipH);
      }

      // 힌트 텍스트
      ctx.fillStyle = '#e4e4e7'; // zinc-200
      ctx.textAlign = 'left';
      ctx.fillText(hint, hintX + 14, y);

      hintX += chipW + 8;
    }
    y += 40;
  }

  // 하단 구분선
  const lineY = H - 70;
  ctx.strokeStyle = '#3f3f46'; // zinc-700
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(PADDING, lineY);
  ctx.lineTo(W - PADDING, lineY);
  ctx.stroke();

  // 워터마크
  ctx.fillStyle = '#71717a'; // zinc-500
  ctx.font = '14px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('NingNing AI 운세 · ningning.kr', W / 2, H - 36);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('이미지 생성 실패'));
      },
      'image/png',
    );
  });
}

export default function ShareModal({ data, onClose }: ShareModalProps) {
  const [copySuccess, setCopySuccess] = useState(false);
  const [imageGenerating, setImageGenerating] = useState(false);

  // 모달 열릴 때 body 스크롤 잠금
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // 이미지 저장 핸들러
  const handleSaveImage = useCallback(async () => {
    setImageGenerating(true);
    try {
      const blob = await generateShareImage(data);

      // Web Share API 지원 시 공유 시도 (모바일)
      if (navigator.share && navigator.canShare) {
        const file = new File([blob], 'ningning-fortune.png', { type: 'image/png' });
        const shareData = { files: [file] };
        if (navigator.canShare(shareData)) {
          await navigator.share(shareData);
          return;
        }
      }

      // 미지원 시 다운로드 fallback
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ningning-fortune.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      // 사용자가 공유를 취소한 경우 무시
      if (error instanceof Error && error.name === 'AbortError') return;
      console.error('이미지 저장 오류:', error);
    } finally {
      setImageGenerating(false);
    }
  }, [data]);

  // 링크 복사 핸들러
  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {
      console.error('클립보드 복사 실패');
    }
  }, []);

  // 배경 클릭 시 닫기
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose],
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
    >
      <div className="flex flex-col items-center gap-4 max-h-[90vh] overflow-y-auto">
        {/* 공유 카드 미리보기 */}
        <ShareCard data={data} />

        {/* 액션 버튼들 */}
        <div className="flex flex-col gap-2 w-[360px]">
          <Button
            onClick={handleSaveImage}
            disabled={imageGenerating}
            className="h-11 w-full rounded-xl text-base font-semibold"
            size="lg"
          >
            {imageGenerating ? '생성 중...' : '이미지 저장'}
          </Button>

          <Button
            onClick={handleCopyLink}
            variant="secondary"
            className="h-11 w-full rounded-xl"
          >
            {copySuccess ? '복사 완료!' : '링크 복사'}
          </Button>

          <Button
            onClick={onClose}
            variant="outline"
            className="h-11 w-full rounded-xl"
          >
            닫기
          </Button>
        </div>
      </div>
    </div>
  );
}
