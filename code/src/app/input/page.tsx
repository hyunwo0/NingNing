// ==========================================
// 사주 입력 페이지 (/input)
// ==========================================
//
// 사용자가 생년월일시와 성별을 입력하는 폼 페이지입니다.
//
// [사용자 흐름]
// 1) 양력/음력 선택
// 2) 생년월일 선택 (연/월/일 드롭다운)
// 3) 태어난 시간 선택 (12시진 또는 "모름")
// 4) 성별 선택
// 5) "운세 보기" 버튼 클릭
// → 로딩 화면 (재미있는 문구 순환) → API 호출 → 결과 캐싱 → /result로 이동

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { TWELVE_HOURS } from '@/lib/saju/types';

// ──────────────────────────────────────────
// 상수 정의
// ──────────────────────────────────────────

const YEARS = Array.from({ length: 71 }, (_, i) => 2010 - i);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

function getDaysInMonth(year: number, month: number, isLunar: boolean): number {
  if (isLunar) return 30;
  return new Date(year, month, 0).getDate();
}

const TIME_OPTIONS = [
  { value: 'unknown', label: '모름' },
  ...TWELVE_HOURS.map(h => ({
    value: h.name,
    label: `${h.name} (${h.range})`,
  })),
];

// ──────────────────────────────────────────
// 메인 컴포넌트
// ──────────────────────────────────────────

export default function InputPage() {
  const router = useRouter();

  // 폼 상태 관리
  const [calendarType, setCalendarType] = useState<'solar' | 'lunar'>('solar');
  const [isLeapMonth, setIsLeapMonth] = useState(false);
  const [birthYear, setBirthYear] = useState<number>(1995);
  const [birthMonth, setBirthMonth] = useState<number>(1);
  const [birthDay, setBirthDay] = useState<number>(1);
  const [birthTime, setBirthTime] = useState<string>('unknown');
  const [gender, setGender] = useState<'male' | 'female' | null>(null);

  // 제출 중 상태
  const [isSubmitting, setIsSubmitting] = useState(false);

  const maxDay = getDaysInMonth(birthYear, birthMonth, calendarType === 'lunar');
  const adjustedDay = Math.min(birthDay, maxDay);

  useEffect(() => {
    if (adjustedDay !== birthDay) {
      setBirthDay(adjustedDay);
    }
  }, [adjustedDay, birthDay]);

  const days = Array.from({ length: maxDay }, (_, i) => i + 1);

  // 폼 제출 → sessionStorage 저장 → 로딩 페이지로 이동
  const handleSubmit = () => {
    if (!gender) return;

    setIsSubmitting(true);

    const inputData = {
      calendarType,
      isLeapMonth: calendarType === 'lunar' ? isLeapMonth : false,
      birthYear,
      birthMonth,
      birthDay: adjustedDay,
      birthTime,
      gender,
    };

    // 입력 저장 + 기존 캐시 초기화
    sessionStorage.setItem('sajuInput', JSON.stringify(inputData));
    sessionStorage.removeItem('sajuResult');
    sessionStorage.removeItem('sajuInterpretation');
    sessionStorage.removeItem('sajuReport');
    sessionStorage.removeItem('sajuQAHistory');

    // 로딩 페이지로 이동 (API 호출은 로딩 페이지에서 수행)
    router.push('/loading-screen?type=saju');
  };

  // ── 입력 폼 ──
  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 dark:bg-black">
      <main className="flex flex-col w-full max-w-md px-6 py-10 gap-8">
        {/* 페이지 헤더 */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">
            생년월일시 입력
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            정확한 사주 분석을 위해 출생 정보를 입력해주세요
          </p>
        </div>

        {/* ── 1. 양력/음력 선택 ── */}
        <section className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            달력 유형
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => { setCalendarType('solar'); setIsLeapMonth(false); }}
              className={`h-11 rounded-lg border text-sm font-medium transition-colors ${
                calendarType === 'solar'
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border bg-background text-foreground hover:bg-muted'
              }`}
            >
              양력
            </button>
            <button
              type="button"
              onClick={() => setCalendarType('lunar')}
              className={`h-11 rounded-lg border text-sm font-medium transition-colors ${
                calendarType === 'lunar'
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border bg-background text-foreground hover:bg-muted'
              }`}
            >
              음력
            </button>
          </div>

          {calendarType === 'lunar' && (
            <label className="flex items-center gap-2 text-sm text-muted-foreground pt-1 cursor-pointer">
              <input
                type="checkbox"
                checked={isLeapMonth}
                onChange={(e) => setIsLeapMonth(e.target.checked)}
                className="size-4 rounded border-border accent-foreground"
              />
              윤달
            </label>
          )}
        </section>

        {/* ── 2. 생년월일 선택 ── */}
        <section className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            생년월일
          </label>
          <div className="grid grid-cols-3 gap-2">
            <div className="relative">
              <select
                value={birthYear}
                onChange={(e) => setBirthYear(Number(e.target.value))}
                className="h-11 w-full appearance-none rounded-lg border border-border bg-background px-3 pr-8 text-sm text-foreground transition-colors hover:bg-muted focus:border-ring focus:ring-2 focus:ring-ring/50 focus:outline-none"
              >
                {YEARS.map(y => (
                  <option key={y} value={y}>{y}년</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            </div>

            <div className="relative">
              <select
                value={birthMonth}
                onChange={(e) => setBirthMonth(Number(e.target.value))}
                className="h-11 w-full appearance-none rounded-lg border border-border bg-background px-3 pr-8 text-sm text-foreground transition-colors hover:bg-muted focus:border-ring focus:ring-2 focus:ring-ring/50 focus:outline-none"
              >
                {MONTHS.map(m => (
                  <option key={m} value={m}>{m}월</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            </div>

            <div className="relative">
              <select
                value={adjustedDay}
                onChange={(e) => setBirthDay(Number(e.target.value))}
                className="h-11 w-full appearance-none rounded-lg border border-border bg-background px-3 pr-8 text-sm text-foreground transition-colors hover:bg-muted focus:border-ring focus:ring-2 focus:ring-ring/50 focus:outline-none"
              >
                {days.map(d => (
                  <option key={d} value={d}>{d}일</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            </div>
          </div>
        </section>

        {/* ── 3. 태어난 시간 선택 ── */}
        <section className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            태어난 시간
          </label>
          <div className="relative">
            <select
              value={birthTime}
              onChange={(e) => setBirthTime(e.target.value)}
              className="h-11 w-full appearance-none rounded-lg border border-border bg-background px-3 pr-8 text-sm text-foreground transition-colors hover:bg-muted focus:border-ring focus:ring-2 focus:ring-ring/50 focus:outline-none"
            >
              {TIME_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          </div>
          <p className="text-xs text-muted-foreground">
            정확한 시간을 모르면 &quot;모름&quot;을 선택하세요. 시주 없이 분석합니다.
          </p>
        </section>

        {/* ── 4. 성별 선택 ── */}
        <section className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            성별
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setGender('male')}
              className={`h-11 rounded-lg border text-sm font-medium transition-colors ${
                gender === 'male'
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border bg-background text-foreground hover:bg-muted'
              }`}
            >
              남성
            </button>
            <button
              type="button"
              onClick={() => setGender('female')}
              className={`h-11 rounded-lg border text-sm font-medium transition-colors ${
                gender === 'female'
                  ? 'border-foreground bg-foreground text-background'
                  : 'border-border bg-background text-foreground hover:bg-muted'
              }`}
            >
              여성
            </button>
          </div>
        </section>

        {/* ── 5. 제출 버튼 ── */}
        <Button
          onClick={handleSubmit}
          disabled={!gender || isSubmitting}
          className="h-12 w-full rounded-xl text-base font-semibold mt-2"
          size="lg"
        >
          오늘의 운세 보기
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          입력하신 정보는 사주 분석에만 사용되며,<br />
          별도 동의 없이 저장되지 않습니다.
        </p>
      </main>
    </div>
  );
}

// ──────────────────────────────────────────
// 하위 컴포넌트
// ──────────────────────────────────────────

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
