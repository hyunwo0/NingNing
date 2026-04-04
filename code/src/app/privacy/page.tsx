// ==========================================
// 개인정보 처리방침 (/privacy)
// ==========================================
//
// NingNing 서비스의 개인정보 처리방침 페이지입니다.
// 서버 컴포넌트로 렌더링됩니다.

import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 dark:bg-black">
      <main className="flex flex-col w-full max-w-md px-6 py-10">

        {/* 뒤로가기 링크 */}
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          &larr; 홈으로 돌아가기
        </Link>

        <h1 className="text-xl font-bold text-foreground mb-2">
          개인정보 처리방침
        </h1>
        <p className="text-sm text-muted-foreground mb-8">
          시행일: 2026년 4월 4일
        </p>

        <div className="text-sm text-foreground leading-relaxed space-y-1">

          {/* 1. 총칙 */}
          <h2 className="text-base font-semibold mt-6 mb-2">1. 총칙</h2>
          <p>
            NingNing(이하 &quot;서비스&quot;)은 이용자의 개인정보를 중요시하며,
            개인정보 보호법 등 관련 법령을 준수합니다.
            본 방침을 통해 이용자의 개인정보가 어떤 목적과 방식으로
            이용되고 있으며, 어떠한 보호 조치가 취해지고 있는지 알려드립니다.
          </p>

          <p className="mt-2">
            운영자: [운영자 정보 추후 기재]
          </p>

          {/* 2. 수집하는 개인정보 */}
          <h2 className="text-base font-semibold mt-6 mb-2">2. 수집하는 개인정보</h2>
          <p>서비스는 사주 분석 목적으로 다음 정보를 수집합니다.</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>생년월일</li>
            <li>출생시간</li>
            <li>성별</li>
          </ul>

          {/* 3. 수집 방법 */}
          <h2 className="text-base font-semibold mt-6 mb-2">3. 수집 방법</h2>
          <p>
            이용자가 사주 입력 폼을 통해 직접 입력하는 방식으로 수집합니다.
          </p>

          {/* 4. 이용 목적 */}
          <h2 className="text-base font-semibold mt-6 mb-2">4. 이용 목적</h2>
          <p>수집된 정보는 다음 목적으로만 이용됩니다.</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>사주 팔자 계산</li>
            <li>AI 기반 오늘의 운세 해석 제공</li>
          </ul>

          {/* 5. 보유 기간 */}
          <h2 className="text-base font-semibold mt-6 mb-2">5. 보유 기간</h2>
          <p>
            현재 서비스는 세션 기반으로 데이터를 처리합니다.
            이용자가 입력한 정보는 브라우저의 sessionStorage에 임시 저장되며,
            서버에는 별도로 저장하지 않습니다(현재 MVP 단계).
            브라우저 탭을 닫으면 데이터가 자동으로 삭제됩니다.
          </p>

          {/* 6. 제3자 제공 */}
          <h2 className="text-base font-semibold mt-6 mb-2">6. 제3자 제공</h2>
          <p>
            사주 데이터는 AI 해석을 위해 Anthropic Claude API에 전달됩니다.
            전달 시 개인을 식별할 수 없는 형태(생년월일시, 성별만 포함)로
            처리되며, Anthropic의 개인정보 처리방침에 따라 관리됩니다.
          </p>

          {/* 7. 이용자 권리 */}
          <h2 className="text-base font-semibold mt-6 mb-2">7. 이용자 권리</h2>
          <p>
            이용자는 브라우저의 데이터(sessionStorage, 쿠키 등)를
            직접 삭제하여 저장된 정보를 즉시 제거할 수 있습니다.
            서버에 저장되는 정보가 없으므로 별도의 삭제 요청이 필요하지 않습니다.
          </p>

          {/* 8. 쿠키 */}
          <h2 className="text-base font-semibold mt-6 mb-2">8. 쿠키 사용</h2>
          <p>
            서비스는 서비스 운영 목적의 필수 쿠키만 사용합니다.
            마케팅 또는 분석 목적의 쿠키는 사용하지 않습니다.
          </p>

          {/* 9. 문의 */}
          <h2 className="text-base font-semibold mt-6 mb-2">9. 문의</h2>
          <p>
            개인정보 처리방침에 대한 문의 사항은 아래로 연락해 주시기 바랍니다.
          </p>
          <p className="mt-2">
            [운영자 정보 추후 기재]
          </p>

        </div>
      </main>
    </div>
  );
}
