// ==========================================
// 나와 맞는 연예인 입력 페이지 (/celeb)
// ==========================================
//
// 사주 입력이 이미 있으면 바로 로딩으로, 없으면 /input으로 안내

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CelebPage() {
  const router = useRouter();

  useEffect(() => {
    const sajuResult = sessionStorage.getItem('sajuResult');
    if (sajuResult) {
      // 사주 결과가 있으면 바로 로딩 페이지로
      sessionStorage.removeItem('celebResult');
      router.replace('/loading-screen?type=celeb');
    } else {
      // 없으면 사주 입력부터
      router.replace('/input');
    }
  }, [router]);

  return <div className="flex flex-1 bg-zinc-50 dark:bg-black min-h-screen" />;
}
