// ==========================================
// 궁합 보기 입력 페이지 (/compatibility)
// ==========================================

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import GNB from '@/components/layout/GNB';

const YEARS = Array.from({ length: 71 }, (_, i) => 2010 - i);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

interface PersonInfo {
  name: string;
  birthYear: number;
  birthMonth: number;
  birthDay: number;
  gender: 'male' | 'female' | null;
}

const defaultPerson = (): PersonInfo => ({
  name: '',
  birthYear: 1995,
  birthMonth: 1,
  birthDay: 1,
  gender: null,
});

export default function CompatibilityPage() {
  const router = useRouter();
  const [person1, setPerson1] = useState<PersonInfo>(defaultPerson());
  const [person2, setPerson2] = useState<PersonInfo>(defaultPerson());

  const canSubmit =
    person1.name.trim() && person1.gender &&
    person2.name.trim() && person2.gender;

  const handleSubmit = () => {
    if (!canSubmit) return;

    sessionStorage.setItem('compatibilityInput', JSON.stringify({
      person1,
      person2,
    }));
    sessionStorage.removeItem('compatibilityResult');
    router.push('/loading-screen?type=compatibility');
  };

  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 dark:bg-black min-h-screen">
      <main className="flex flex-col w-full max-w-md px-6">

        <GNB title="궁합" />

        <div className="flex flex-col gap-6 py-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">궁합 보기</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              두 사람의 생년월일로 궁합을 분석해드려요
            </p>
          </div>

          {/* 나의 정보 */}
          <PersonForm
            label="나의 정보"
            person={person1}
            onChange={setPerson1}
          />

          {/* 구분 */}
          <div className="flex items-center justify-center">
            <span className="text-xl text-muted-foreground">♥</span>
          </div>

          {/* 상대 정보 */}
          <PersonForm
            label="상대 정보"
            person={person2}
            onChange={setPerson2}
          />

          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="h-12 w-full rounded-xl text-base font-semibold mt-2"
            size="lg"
          >
            궁합 보기
          </Button>
        </div>
      </main>
    </div>
  );
}

// ──────────────────────────────────────────
// 인물 입력 폼 컴포넌트
// ──────────────────────────────────────────

function PersonForm({
  label,
  person,
  onChange,
}: {
  label: string;
  person: PersonInfo;
  onChange: (p: PersonInfo) => void;
}) {
  return (
    <section className="space-y-3">
      <label className="text-sm font-medium text-foreground">{label}</label>

      {/* 이름 */}
      <input
        type="text"
        value={person.name}
        onChange={(e) => onChange({ ...person, name: e.target.value })}
        placeholder="이름"
        maxLength={20}
        className="w-full h-11 rounded-xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
      />

      {/* 생년월일 */}
      <div className="grid grid-cols-3 gap-2">
        <div className="relative">
          <select
            value={person.birthYear}
            onChange={(e) => onChange({ ...person, birthYear: Number(e.target.value) })}
            className="h-11 w-full appearance-none rounded-lg border border-border bg-background px-3 pr-8 text-sm text-foreground focus:outline-none"
          >
            {YEARS.map(y => <option key={y} value={y}>{y}년</option>)}
          </select>
          <ChevronDown />
        </div>
        <div className="relative">
          <select
            value={person.birthMonth}
            onChange={(e) => onChange({ ...person, birthMonth: Number(e.target.value) })}
            className="h-11 w-full appearance-none rounded-lg border border-border bg-background px-3 pr-8 text-sm text-foreground focus:outline-none"
          >
            {MONTHS.map(m => <option key={m} value={m}>{m}월</option>)}
          </select>
          <ChevronDown />
        </div>
        <div className="relative">
          <select
            value={person.birthDay}
            onChange={(e) => onChange({ ...person, birthDay: Number(e.target.value) })}
            className="h-11 w-full appearance-none rounded-lg border border-border bg-background px-3 pr-8 text-sm text-foreground focus:outline-none"
          >
            {DAYS.map(d => <option key={d} value={d}>{d}일</option>)}
          </select>
          <ChevronDown />
        </div>
      </div>

      {/* 성별 */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onChange({ ...person, gender: 'male' })}
          className={`h-11 rounded-lg border text-sm font-medium transition-colors ${
            person.gender === 'male'
              ? 'border-foreground bg-foreground text-background'
              : 'border-border bg-background text-foreground hover:bg-muted'
          }`}
        >
          남성
        </button>
        <button
          type="button"
          onClick={() => onChange({ ...person, gender: 'female' })}
          className={`h-11 rounded-lg border text-sm font-medium transition-colors ${
            person.gender === 'female'
              ? 'border-foreground bg-foreground text-background'
              : 'border-border bg-background text-foreground hover:bg-muted'
          }`}
        >
          여성
        </button>
      </div>
    </section>
  );
}

function ChevronDown() {
  return (
    <svg
      className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
