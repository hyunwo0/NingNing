// ==========================================
// 이용약관 (/terms)
// ==========================================
//
// NingNing AI 운세 서비스의 이용약관 페이지입니다.
// 서버 컴포넌트로 렌더링됩니다.

import Link from 'next/link';

export default function TermsPage() {
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
          이용약관
        </h1>
        <p className="text-sm text-muted-foreground mb-8">
          시행일: 2026년 4월 4일
        </p>

        <div className="text-sm text-foreground leading-relaxed space-y-1">

          {/* 1. 목적 */}
          <h2 className="text-base font-semibold mt-6 mb-2">1. 목적</h2>
          <p>
            본 약관은 NingNing AI 운세 서비스(이하 &quot;서비스&quot;)의
            이용 조건 및 절차, 이용자와 서비스 제공자 간의 권리와 의무를
            규정하는 것을 목적으로 합니다.
          </p>
          <p className="mt-2">
            운영자: [운영자 정보 추후 기재]
          </p>

          {/* 2. 서비스 내용 */}
          <h2 className="text-base font-semibold mt-6 mb-2">2. 서비스 내용</h2>
          <p>
            서비스는 사주명리학에 기반한 AI 오늘의 운세 해석을 제공합니다.
            이용자가 입력한 생년월일시와 성별 정보를 바탕으로
            사주 팔자를 계산하고, AI가 오늘의 운세를 해석하여 제공합니다.
          </p>

          {/* 3. 면책 조항 */}
          <h2 className="text-base font-semibold mt-6 mb-2">3. 면책 조항</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>
              본 서비스의 운세 결과는 사주명리학에 기반한 참고용 해석이며,
              의료, 법률, 투자 등 전문 분야의 조언을 대체하지 않습니다.
            </li>
            <li>
              운세 결과를 근거로 한 의사결정에 대해 서비스 제공자는
              책임을 지지 않습니다.
            </li>
            <li>
              AI 해석은 매번 다소 다를 수 있으며, 이는 AI 기반 서비스의
              특성입니다.
            </li>
          </ul>

          {/* 4. 이용자 의무 및 금지 행위 */}
          <h2 className="text-base font-semibold mt-6 mb-2">4. 이용자 의무 및 금지 행위</h2>
          <p>이용자는 다음 행위를 하여서는 안 됩니다.</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>서비스를 본래 목적 외로 악용하는 행위</li>
            <li>자동화된 수단을 이용한 대량 요청</li>
            <li>API에 대한 무단 접근 또는 역공학 시도</li>
            <li>서비스 운영을 방해하는 일체의 행위</li>
          </ul>

          {/* 5. 유료 서비스 */}
          <h2 className="text-base font-semibold mt-6 mb-2">5. 유료 서비스</h2>
          <p>
            향후 유료 서비스가 도입될 경우, 결제 및 환불 정책은
            별도로 고지합니다. 유료 서비스 이용 시 해당 정책에
            동의한 것으로 간주합니다.
          </p>

          {/* 6. 서비스 변경 및 중단 */}
          <h2 className="text-base font-semibold mt-6 mb-2">6. 서비스 변경 및 중단</h2>
          <p>
            서비스 제공자는 운영상, 기술상의 필요에 따라
            서비스의 전부 또는 일부를 변경하거나 중단할 수 있습니다.
            서비스 변경 또는 중단 시 사전에 고지합니다.
          </p>

          {/* 7. 지적 재산권 */}
          <h2 className="text-base font-semibold mt-6 mb-2">7. 지적 재산권</h2>
          <p>
            서비스에 포함된 디자인, 텍스트, 코드 등 모든 콘텐츠에 대한
            지적 재산권은 서비스 제공자에게 귀속됩니다.
            이용자가 서비스를 통해 제공받은 운세 결과는
            개인적 용도로만 사용할 수 있습니다.
          </p>

          {/* 8. 분쟁 해결 */}
          <h2 className="text-base font-semibold mt-6 mb-2">8. 분쟁 해결</h2>
          <p>
            본 약관과 관련한 분쟁은 대한민국 법률에 따라 해결하며,
            관할 법원은 서비스 제공자의 소재지를 관할하는 법원으로 합니다.
          </p>

          {/* 9. 문의 */}
          <h2 className="text-base font-semibold mt-6 mb-2">9. 문의</h2>
          <p>
            이용약관에 대한 문의 사항은 아래로 연락해 주시기 바랍니다.
          </p>
          <p className="mt-2">
            [운영자 정보 추후 기재]
          </p>

        </div>
      </main>
    </div>
  );
}
