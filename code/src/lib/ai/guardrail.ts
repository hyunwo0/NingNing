// ==========================================
// AI 출력 가드레일 (안전성 필터)
// ==========================================
//
// [이 파일이 하는 일]
// Claude AI가 생성한 운세 텍스트에 부적절한 표현이 없는지 검사합니다.
// 운세 서비스에서 공포를 조장하거나, 의료/법률 조언을 하거나,
// 불안을 이용해 결제를 유도하는 표현은 절대 안 됩니다.
//
// [동작 흐름]
// 1) Claude가 응답 생성
// 2) checkGuardrail()로 위반 사항 검사
// 3-a) 통과하면 → 그대로 사용자에게 표시
// 3-b) 위반이 있으면 → sanitizeContent()로 자동 순화 시도
//                      또는 Claude에게 재생성 요청
//
// [가드레일 vs 프롬프트]
// 프롬프트에서도 "이런 말 하지 마"라고 지시하지만,
// AI는 가끔 프롬프트를 어길 수 있으므로 이중 안전장치로 가드레일을 사용합니다.

// ──────────────────────────────────────────
// 금지 패턴 목록 (정규표현식)
// ──────────────────────────────────────────
// 이 패턴들이 응답에 포함되면 "위반"으로 판정합니다.
const FORBIDDEN_PATTERNS = [
  // === 공포 조장 표현 ===
  /큰일\s*납니다/,    // "큰일 납니다" (띄어쓰기 무관)
  /최악/,             // "최악"
  /위험합니다/,       // "위험합니다"
  /파멸/,             // "파멸"
  /재앙/,             // "재앙"
  /죽/,               // "죽" 관련 표현
  /사망/,             // "사망"

  // === 확정적 미래 단정 ===
  /반드시.*됩니다/,        // "반드시 ~됩니다" (확정적 예언)
  /절대로.*안\s*됩니다/,   // "절대로 ~안 됩니다" (강한 금지)
  /100%/,                  // "100%" (확률 단정)
  /확실히.*될\s*것/,       // "확실히 ~될 것" (미래 단정)

  // === 의료/법률/투자 조언 ===
  /주식.*사세요/,          // 주식 투자 권유
  /투자.*하세요/,          // 투자 권유
  /병원.*가지\s*마/,       // 병원 방문 만류
  /약을.*먹/,              // 의약품 관련 조언
  /소송/,                  // 법률 관련
  /변호사/,                // 법률 관련

  // === 불안 유도 결제 유도 ===
  /지금\s*결제.*안\s*하면/, // "지금 결제 안 하면" (불안 이용 결제 유도)
  /늦기\s*전에.*구매/,      // "늦기 전에 구매" (긴급성 이용)

];

// ──────────────────────────────────────────
// 과도한 부정 표현 목록
// ──────────────────────────────────────────
// 이 단어들이 2개 이상 포함되면 "지나치게 부정적"으로 판정합니다.
// (1개는 맥락에 따라 괜찮을 수 있지만, 2개 이상이면 문제)
const NEGATIVE_INTENSITY_WORDS = [
  '최악', '파멸', '재앙', '불행', '비극', '절망',
  '파괴', '몰락', '파산', '고통',
];

// 검증 결과 인터페이스
export interface GuardrailResult {
  passed: boolean;       // true = 안전, false = 위반 발견
  violations: string[];  // 발견된 위반 사항 목록 (디버깅/로깅용)
}

/**
 * AI 출력 텍스트에 대해 가드레일 검증을 수행합니다.
 *
 * @param content - Claude가 생성한 응답 텍스트
 * @returns { passed: true/false, violations: ['위반 내용1', ...] }
 *
 * 사용 예:
 *   const result = checkGuardrail(aiResponse);
 *   if (!result.passed) {
 *     console.warn('가드레일 위반:', result.violations);
 *     // 재생성 또는 순화 처리
 *   }
 */
export function checkGuardrail(content: string): GuardrailResult {
  const violations: string[] = [];

  // 1) 금지 패턴 검사 — 정규식 하나라도 매칭되면 위반
  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.test(content)) {
      violations.push(`금지 패턴 발견: ${pattern.source}`);
    }
  }

  // 2) 과도한 부정 표현 검사 — 부정 단어가 2개 이상이면 위반
  let negativeCount = 0;
  for (const word of NEGATIVE_INTENSITY_WORDS) {
    if (content.includes(word)) {
      negativeCount++;
    }
  }
  if (negativeCount >= 2) {
    violations.push(`과도한 부정 표현 (${negativeCount}개)`);
  }

  // 3) 응답 길이 검증
  if (content.length < 50) {
    violations.push('응답이 너무 짧습니다'); // 너무 짧으면 제대로 생성 안 된 것
  }
  if (content.length > 5000) {
    violations.push('응답이 너무 깁니다');   // 너무 길면 비용 낭비 + 사용자 경험 저하
  }

  // 4) v2 개선: 3축(연애/일/재물) 해석이 지나치게 유사한지 검사
  //    세 축의 해석이 거의 동일하면 사용자에게 가치를 주지 못함
  const axisVaguenessResult = checkAxisSimilarity(content);
  if (axisVaguenessResult) {
    violations.push(axisVaguenessResult);
  }

  return {
    passed: violations.length === 0,
    violations,
  };
}

// ──────────────────────────────────────────
// v2 개선: 3축 해석 유사도 검사 함수
// ──────────────────────────────────────────
// JSON 응답에서 loveReading, workReading, moneyReading의
// interpretation 텍스트가 지나치게 유사하면 위반으로 판정합니다.
// 간단한 문자 겹침 비율(Jaccard-like)로 유사도를 측정합니다.

/**
 * 텍스트를 2-gram 집합으로 변환하여 두 텍스트의 유사도를 계산합니다 (0~1).
 * 1에 가까울수록 두 텍스트가 유사합니다.
 */
function textSimilarity(a: string, b: string): number {
  if (a.length < 4 || b.length < 4) return 0;
  const bigrams = (s: string): Set<string> => {
    const set = new Set<string>();
    for (let i = 0; i < s.length - 1; i++) {
      set.add(s.slice(i, i + 2));
    }
    return set;
  };
  const setA = bigrams(a);
  const setB = bigrams(b);
  let intersection = 0;
  for (const gram of setA) {
    if (setB.has(gram)) intersection++;
  }
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

/**
 * 3축 해석 텍스트가 지나치게 유사한지 검사합니다.
 * JSON 파싱을 시도하고, 세 축의 interpretation 간 유사도가 모두 0.6 이상이면 위반.
 */
function checkAxisSimilarity(content: string): string | null {
  try {
    const parsed = JSON.parse(content);
    const love = parsed?.loveReading?.interpretation;
    const work = parsed?.workReading?.interpretation;
    const money = parsed?.moneyReading?.interpretation;

    // 세 축 해석이 모두 존재할 때만 검사
    if (love && work && money) {
      const loveWork = textSimilarity(love, work);
      const loveMoney = textSimilarity(love, money);
      const workMoney = textSimilarity(work, money);

      // 세 쌍 모두 유사도가 높으면 위반 (하나만 비슷한 건 허용)
      const THRESHOLD = 0.6;
      if (loveWork >= THRESHOLD && loveMoney >= THRESHOLD && workMoney >= THRESHOLD) {
        return `3축 해석이 지나치게 유사합니다 (유사도: 연애-일 ${(loveWork * 100).toFixed(0)}%, 연애-재물 ${(loveMoney * 100).toFixed(0)}%, 일-재물 ${(workMoney * 100).toFixed(0)}%)`;
      }
    }
  } catch {
    // JSON 파싱 실패 시 이 검사는 건너뜀 (다른 검증에서 잡힘)
  }
  return null;
}

/**
 * 가드레일에 걸린 표현을 순화(자동 정정)합니다.
 *
 * 심각한 위반이 아닌 경우, Claude에게 재생성을 요청하는 대신
 * 문제 표현만 부드러운 표현으로 교체하여 시간/비용을 절약합니다.
 *
 * @param content - 위반이 발견된 응답 텍스트
 * @returns 순화된 텍스트
 */
export function sanitizeContent(content: string): string {
  let sanitized = content;

  // 간단한 대체 규칙 (공포 표현 → 부드러운 표현)
  sanitized = sanitized.replace(/최악/g, '주의가 필요한');
  sanitized = sanitized.replace(/위험합니다/g, '신중함이 필요합니다');
  sanitized = sanitized.replace(/큰일\s*납니다/g, '주의가 필요한 흐름입니다');

  // v2 개선: 관계 조종 표현 순화
  sanitized = sanitized.replace(/바로\s*고백하세요/g, '마음의 준비가 되면 표현해보세요');
  sanitized = sanitized.replace(/그\s*사람을?\s*떠나세요/g, '관계를 차분히 돌아볼 시기입니다');
  sanitized = sanitized.replace(/즉시\s*이별/g, '관계에 대해 깊이 생각해볼 시기');

  return sanitized;
}
