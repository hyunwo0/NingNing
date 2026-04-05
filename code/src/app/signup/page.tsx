// ==========================================
// 회원가입 페이지 (/signup)
// ==========================================
//
// [역할]
// 이메일 인증 코드 기반 회원가입을 처리합니다.
// /login에서 "회원가입" 링크를 통해 진입합니다.
//
// [화면 구성]
// - 뒤로가기 헤더
// - 이메일 입력 + 인증 코드 발송/검증
// - 비밀번호 + 비밀번호 확인
// - 이용약관/개인정보 동의 (모달)
// - 회원가입 버튼

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/auth/supabase';

export default function SignupPage() {
  const router = useRouter();

  // 이메일 & 인증
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const [verifying, setVerifying] = useState(false);

  // 비밀번호
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  // 약관 동의
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);

  // 모달
  const [modalContent, setModalContent] = useState<'terms' | 'privacy' | null>(null);

  // 제출
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 비밀번호 불일치 여부
  const passwordMismatch = passwordConfirm.length > 0 && password !== passwordConfirm;

  // 제출 가능 여부
  const canSubmit =
    emailVerified &&
    password.length >= 8 &&
    password === passwordConfirm &&
    agreeTerms &&
    agreePrivacy &&
    !loading;

  // ── 인증 코드 발송 ──
  const handleSendCode = async () => {
    if (!email) return;
    setEmailSending(true);
    setVerificationError('');

    const supabase = getSupabaseBrowserClient();

    try {
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) {
        setVerificationError(error.message);
        return;
      }
      setEmailSent(true);
    } catch {
      setVerificationError('인증 코드 발송에 실패했습니다.');
    } finally {
      setEmailSending(false);
    }
  };

  // ── 인증 코드 확인 ──
  const handleVerifyCode = async () => {
    if (!verificationCode) return;
    setVerifying(true);
    setVerificationError('');

    const supabase = getSupabaseBrowserClient();

    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: verificationCode,
        type: 'email',
      });
      if (error) {
        setVerificationError(
          error.message === 'Token has expired or is invalid'
            ? '인증 코드가 올바르지 않거나 만료되었습니다'
            : error.message
        );
        return;
      }
      setEmailVerified(true);
    } catch {
      setVerificationError('인증 확인에 실패했습니다.');
    } finally {
      setVerifying(false);
    }
  };

  // ── 회원가입 제출 ──
  const handleSubmit = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError('');

    const supabase = getSupabaseBrowserClient();

    try {
      // OTP 인증 후 비밀번호 설정
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      // 가입 성공 → 홈으로 이동
      router.push('/');
      router.refresh();
    } catch {
      setError('회원가입에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 dark:bg-black min-h-screen">
      <main className="flex flex-col w-full max-w-md px-6 py-8 gap-6">

        {/* ── 뒤로가기 ── */}
        <div className="flex items-center">
          <button
            onClick={() => router.back()}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← 뒤로가기
          </button>
        </div>

        {/* ── 이메일 입력 + 코드 발송 ── */}
        <section className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">이메일</label>
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              disabled={emailVerified}
              className="flex-1 h-11 rounded-xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 disabled:opacity-50"
            />
            <button
              onClick={handleSendCode}
              disabled={!email || emailSending || emailVerified}
              className="h-11 px-4 rounded-xl bg-foreground text-background text-sm font-medium transition-colors hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              {emailSending ? '발송 중...' : emailSent ? '재발송' : '확인'}
            </button>
          </div>
        </section>

        {/* ── 인증 코드 입력 + 검증 ── */}
        {emailSent && (
          <section className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">인증 코드</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="인증 코드 입력"
                disabled={emailVerified}
                className="flex-1 h-11 rounded-xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 disabled:opacity-50"
              />
              <button
                onClick={handleVerifyCode}
                disabled={!verificationCode || verifying || emailVerified}
                className="h-11 px-4 rounded-xl bg-foreground text-background text-sm font-medium transition-colors hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              >
                {verifying ? '확인 중...' : '확인'}
              </button>
            </div>

            {/* 인증 결과 메시지 */}
            {emailVerified && (
              <p className="text-sm text-green-600 dark:text-green-400 px-1">인증되었습니다</p>
            )}
            {verificationError && (
              <p className="text-sm text-red-500 dark:text-red-400 px-1">{verificationError}</p>
            )}
          </section>
        )}

        {/* ── 비밀번호 ── */}
        <section className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="8자 이상 입력하세요"
              minLength={8}
              className="w-full h-11 rounded-xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">비밀번호 확인</label>
            <input
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              placeholder="비밀번호를 다시 입력하세요"
              className="w-full h-11 rounded-xl border border-border bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
            />
            {passwordMismatch && (
              <p className="text-sm text-red-500 dark:text-red-400 px-1">비밀번호가 일치하지 않습니다</p>
            )}
          </div>
        </section>

        {/* ── 이용약관 동의 ── */}
        <section className="space-y-3">
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-0.5 size-4 rounded border-border accent-foreground"
            />
            <span className="text-sm text-foreground">
              <button
                type="button"
                onClick={() => setModalContent('terms')}
                className="underline hover:text-foreground/80"
              >
                이용약관
              </button>
              에 동의합니다 (필수)
            </span>
          </label>
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={agreePrivacy}
              onChange={(e) => setAgreePrivacy(e.target.checked)}
              className="mt-0.5 size-4 rounded border-border accent-foreground"
            />
            <span className="text-sm text-foreground">
              <button
                type="button"
                onClick={() => setModalContent('privacy')}
                className="underline hover:text-foreground/80"
              >
                개인정보 처리방침
              </button>
              에 동의합니다 (필수)
            </span>
          </label>
        </section>

        {/* ── 에러 메시지 ── */}
        {error && (
          <p className="text-sm text-red-500 dark:text-red-400 px-1">{error}</p>
        )}

        {/* ── 회원가입 버튼 ── */}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="h-12 rounded-xl bg-foreground text-background text-sm font-semibold transition-colors hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '처리 중...' : '회원가입'}
        </button>

      </main>

      {/* ── 약관/개인정보 모달 ── */}
      {modalContent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <div className="bg-background rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="text-base font-semibold text-foreground">
                {modalContent === 'terms' ? '이용약관' : '개인정보 처리방침'}
              </h3>
              <button
                onClick={() => setModalContent(null)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto px-6 py-4 text-sm text-foreground leading-relaxed space-y-1">
              {modalContent === 'terms' ? <TermsContent /> : <PrivacyContent />}
            </div>
            <div className="px-6 py-4 border-t border-border">
              <button
                onClick={() => setModalContent(null)}
                className="w-full h-10 rounded-xl bg-foreground text-background text-sm font-medium"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────
// 약관/개인정보 내용 컴포넌트
// ──────────────────────────────────────────

function TermsContent() {
  return (
    <>
      <h2 className="text-base font-semibold mt-4 mb-2">1. 목적</h2>
      <p>본 약관은 NingNing AI 운세 서비스(이하 &quot;서비스&quot;)의 이용 조건 및 절차, 이용자와 서비스 제공자 간의 권리와 의무를 규정하는 것을 목적으로 합니다.</p>

      <h2 className="text-base font-semibold mt-6 mb-2">2. 서비스 내용</h2>
      <p>서비스는 사주명리학에 기반한 AI 오늘의 운세 해석을 제공합니다. 이용자가 입력한 생년월일시와 성별 정보를 바탕으로 사주 팔자를 계산하고, AI가 오늘의 운세를 해석하여 제공합니다.</p>

      <h2 className="text-base font-semibold mt-6 mb-2">3. 면책 조항</h2>
      <ul className="list-disc list-inside space-y-2">
        <li>본 서비스의 운세 결과는 사주명리학에 기반한 참고용 해석이며, 의료, 법률, 투자 등 전문 분야의 조언을 대체하지 않습니다.</li>
        <li>운세 결과를 근거로 한 의사결정에 대해 서비스 제공자는 책임을 지지 않습니다.</li>
        <li>AI 해석은 매번 다소 다를 수 있으며, 이는 AI 기반 서비스의 특성입니다.</li>
      </ul>

      <h2 className="text-base font-semibold mt-6 mb-2">4. 이용자 의무 및 금지 행위</h2>
      <p>이용자는 다음 행위를 하여서는 안 됩니다.</p>
      <ul className="list-disc list-inside mt-2 space-y-1">
        <li>서비스를 본래 목적 외로 악용하는 행위</li>
        <li>자동화된 수단을 이용한 대량 요청</li>
        <li>API에 대한 무단 접근 또는 역공학 시도</li>
        <li>서비스 운영을 방해하는 일체의 행위</li>
      </ul>

      <h2 className="text-base font-semibold mt-6 mb-2">5. 유료 서비스</h2>
      <p>향후 유료 서비스가 도입될 경우, 결제 및 환불 정책은 별도로 고지합니다.</p>

      <h2 className="text-base font-semibold mt-6 mb-2">6. 서비스 변경 및 중단</h2>
      <p>서비스 제공자는 운영상, 기술상의 필요에 따라 서비스의 전부 또는 일부를 변경하거나 중단할 수 있습니다.</p>

      <h2 className="text-base font-semibold mt-6 mb-2">7. 지적 재산권</h2>
      <p>서비스에 포함된 디자인, 텍스트, 코드 등 모든 콘텐츠에 대한 지적 재산권은 서비스 제공자에게 귀속됩니다.</p>

      <h2 className="text-base font-semibold mt-6 mb-2">8. 분쟁 해결</h2>
      <p>본 약관과 관련한 분쟁은 대한민국 법률에 따라 해결합니다.</p>
    </>
  );
}

function PrivacyContent() {
  return (
    <>
      <h2 className="text-base font-semibold mt-4 mb-2">1. 총칙</h2>
      <p>NingNing(이하 &quot;서비스&quot;)은 이용자의 개인정보를 중요시하며, 개인정보 보호법 등 관련 법령을 준수합니다.</p>

      <h2 className="text-base font-semibold mt-6 mb-2">2. 수집하는 개인정보</h2>
      <p>서비스는 사주 분석 목적으로 다음 정보를 수집합니다.</p>
      <ul className="list-disc list-inside mt-2 space-y-1">
        <li>생년월일</li>
        <li>출생시간</li>
        <li>성별</li>
      </ul>

      <h2 className="text-base font-semibold mt-6 mb-2">3. 수집 방법</h2>
      <p>이용자가 사주 입력 폼을 통해 직접 입력하는 방식으로 수집합니다.</p>

      <h2 className="text-base font-semibold mt-6 mb-2">4. 이용 목적</h2>
      <p>수집된 정보는 사주 팔자 계산 및 AI 기반 오늘의 운세 해석 제공에만 이용됩니다.</p>

      <h2 className="text-base font-semibold mt-6 mb-2">5. 보유 기간</h2>
      <p>이용자가 입력한 정보는 브라우저의 sessionStorage에 임시 저장되며, 서버에는 별도로 저장하지 않습니다. 브라우저 탭을 닫으면 데이터가 자동으로 삭제됩니다.</p>

      <h2 className="text-base font-semibold mt-6 mb-2">6. 제3자 제공</h2>
      <p>사주 데이터는 AI 해석을 위해 Anthropic Claude API에 전달됩니다. 전달 시 개인을 식별할 수 없는 형태로 처리됩니다.</p>

      <h2 className="text-base font-semibold mt-6 mb-2">7. 이용자 권리</h2>
      <p>이용자는 브라우저의 데이터를 직접 삭제하여 저장된 정보를 즉시 제거할 수 있습니다.</p>

      <h2 className="text-base font-semibold mt-6 mb-2">8. 쿠키 사용</h2>
      <p>서비스는 서비스 운영 목적의 필수 쿠키만 사용합니다. 마케팅 또는 분석 목적의 쿠키는 사용하지 않습니다.</p>
    </>
  );
}
