// ==========================================
// 공유 모달 컴포넌트 (ShareModal)
// ==========================================
//
// 모든 운세 타입의 공유를 처리하는 범용 모달입니다.
// ShareCard 미리보기 + 이미지 저장/공유

'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import ShareCard, { type ShareCardData } from './ShareCard';

interface ShareModalProps {
  data: ShareCardData;
  onClose: () => void;
}

export default function ShareModal({ data, onClose }: ShareModalProps) {
  const [imageGenerating, setImageGenerating] = useState(false);

  const isMobile = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const hasShare = typeof navigator.share === 'function';
    return hasTouch && hasShare;
  }, []);

  // body 스크롤 잠금
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, []);

  // 공유/저장 핸들러
  const handleShare = useCallback(async () => {
    setImageGenerating(true);
    try {
      // html2canvas 없이 간단하게: AI 이미지가 있으면 그걸 공유, 없으면 스크린샷 불가 안내
      let blob: Blob;

      if (data.image) {
        const res = await fetch(data.image);
        blob = await res.blob();
      } else {
        // AI 이미지 없을 때 - 간단한 텍스트 공유로 폴백
        if (isMobile) {
          await navigator.share({
            text: `NingNing ${data.typeLabel} 결과를 확인해보세요!`,
            url: window.location.origin,
          });
          return;
        }
        // PC에서 이미지 없으면 안내
        alert('공유할 이미지가 없습니다. 다시 시도해주세요.');
        return;
      }

      if (isMobile) {
        const file = new File([blob], 'ningning-result.png', { type: 'image/png' });
        await navigator.share({
          files: [file],
          text: '나도 운세 보기 👉',
          url: window.location.origin,
        });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'ningning-result.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return;
      console.error('공유/저장 오류:', error);
    } finally {
      setImageGenerating(false);
    }
  }, [data, isMobile]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose],
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-hidden"
      onClick={handleBackdropClick}
    >
      <div className="flex flex-col items-center gap-4 max-h-[90vh] overflow-y-auto overflow-x-hidden">
        {/* 공유 카드 미리보기 */}
        <ShareCard data={data} />

        {/* 버튼 */}
        <div className="flex flex-col gap-2 w-[360px]">
          <Button
            onClick={handleShare}
            disabled={imageGenerating}
            className="h-11 w-full rounded-xl text-base font-semibold"
            size="lg"
          >
            {imageGenerating ? '생성 중...' : isMobile ? '결과 공유' : '결과 저장'}
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
