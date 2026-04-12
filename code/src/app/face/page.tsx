// ==========================================
// AI 관상 입력 페이지 (/face)
// ==========================================

'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import GNB from '@/components/layout/GNB';

export default function FacePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB (sessionStorage 여유 확보)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');

    // 파일 크기 체크
    if (file.size > MAX_FILE_SIZE) {
      setError('사진이 너무 커요. 4MB 이하의 사진을 사용해주세요.');
      return;
    }

    // 파일 타입 체크
    if (!file.type.startsWith('image/')) {
      setError('이미지 파일만 업로드할 수 있어요.');
      return;
    }

    setPreview(URL.createObjectURL(file));

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!imageBase64 || isSubmitting) return;

    setIsSubmitting(true);
    setError('');

    try {
      sessionStorage.setItem('faceInput', JSON.stringify({ image: imageBase64 }));
      sessionStorage.removeItem('faceResult');
      router.push('/loading-screen?type=face');
    } catch {
      setError('사진 용량이 너무 커서 처리할 수 없어요. 더 작은 사진을 사용해주세요.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 dark:bg-black min-h-screen">
      <main className="flex flex-col w-full max-w-md px-6">

        <GNB />

        <div className="flex flex-col gap-8 py-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">AI 관상</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              셀카 한 장으로 AI가 읽어주는 내 얼굴 이야기
            </p>
          </div>

          {/* 사진 업로드 영역 */}
          <section>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="user"
              onChange={handleFileChange}
              className="hidden"
            />

            {preview ? (
              // 미리보기
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-square rounded-2xl border border-border overflow-hidden relative group"
              >
                <img
                  src={preview}
                  alt="업로드한 사진"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <p className="text-white text-sm font-medium">다른 사진 선택</p>
                </div>
              </button>
            ) : (
              // 업로드 버튼
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-[4/3] rounded-2xl border-2 border-dashed border-border bg-background hover:bg-muted transition-colors flex flex-col items-center justify-center gap-3"
              >
                <svg className="size-10 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">사진 업로드</p>
                  <p className="text-xs text-muted-foreground mt-1">또는 카메라로 촬영</p>
                </div>
              </button>
            )}
          </section>

          {/* 에러 메시지 */}
          {error && (
            <p className="text-sm text-red-500 dark:text-red-400 text-center">{error}</p>
          )}

          {/* CTA */}
          <Button
            onClick={handleSubmit}
            disabled={!imageBase64 || isSubmitting}
            className="h-12 w-full rounded-xl text-base font-semibold"
            size="lg"
          >
            관상 분석 시작
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            사진은 분석에만 사용되며 서버에 저장되지 않습니다
          </p>
        </div>
      </main>
    </div>
  );
}
