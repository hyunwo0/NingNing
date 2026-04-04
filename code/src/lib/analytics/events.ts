// ==========================================
// 이벤트 트래킹 헬퍼
// ==========================================
//
// [이 파일이 하는 일]
// 사용자의 행동을 추적(트래킹)하는 유틸리티입니다.
// "몇 명이 랜딩 페이지를 보고, 몇 명이 결과까지 왔고, 몇 명이 결제했는지" 등
// 서비스 퍼널(전환율)을 분석하기 위해 사용합니다.
//
// [연동 서비스]
// - Google Analytics 4 (GA4): 구글의 웹 분석 도구
// - Mixpanel: 이벤트 기반 분석 도구 (추후 연동 예정)
//
// [퍼널 분석 예시]
// landing_view(100명) → onboarding_start(60명) → result_view(40명)
// → paid_cta_click(10명) → payment_success(5명)
// 이렇게 각 단계의 전환율을 측정하여 서비스를 개선합니다.

// ──────────────────────────────────────────
// 트래킹 가능한 이벤트 목록
// ──────────────────────────────────────────
// 이 타입에 정의된 이벤트만 trackEvent()에 전달할 수 있습니다.
// 오타 방지 + 어떤 이벤트들이 있는지 한눈에 파악할 수 있습니다.
type EventName =
  | 'landing_view'          // 랜딩 페이지 조회
  | 'landing_exit'          // 랜딩 페이지 이탈 (사주 입력 안 하고 나감)
  | 'onboarding_start'      // 사주 입력 시작 (입력 폼 진입)
  | 'onboarding_complete'   // 사주 입력 완료 (폼 제출)
  | 'result_view'           // 운세 결과 화면 조회
  | 'ai_question_start'     // AI 추가질문 입력 시작
  | 'ai_question_complete'  // AI 추가질문 답변 수신 완료
  | 'paid_cta_click'        // 유료 결제 CTA 버튼 클릭 (심층 리포트/추가 질문팩)
  | 'payment_success'       // 결제 성공
  | 'payment_fail'          // 결제 실패
  | 'report_save'           // 리포트 저장
  | 'report_revisit'        // 저장된 리포트 재열람
  | 'next_day_return';      // 다음 날 재방문 (리텐션 측정)

// 이벤트에 첨부할 추가 데이터 타입
// 예: { profileId: 'abc123', questionNumber: 2 }
interface EventProperties {
  [key: string]: string | number | boolean | undefined;
}

/**
 * 이벤트를 트래킹합니다.
 *
 * 브라우저(클라이언트)에서 호출하면 → GA4로 전송
 * 서버에서 호출하면 → 콘솔 로그 출력 (추후 Mixpanel 등 연동 예정)
 *
 * @param name - 이벤트 이름 (위의 EventName 타입 중 하나)
 * @param properties - 이벤트 추가 데이터 (선택)
 *
 * 사용 예:
 *   trackEvent('result_view', { profileId: 'abc123' });
 *   trackEvent('payment_success', { amount: 5900, productType: 'report' });
 */
export function trackEvent(name: EventName, properties?: EventProperties) {
  // 브라우저 환경에서 GA4가 로드되어 있으면 → GA4로 이벤트 전송
  if (typeof window !== 'undefined' && 'gtag' in window) {
    (window as unknown as { gtag: (...args: unknown[]) => void }).gtag('event', name, properties);
  }

  // 서버 환경에서는 콘솔에 로그 출력 (추후 Mixpanel 서버 SDK로 교체 예정)
  if (typeof window === 'undefined') {
    console.log(`[EVENT] ${name}`, properties ?? '');
  }
}
