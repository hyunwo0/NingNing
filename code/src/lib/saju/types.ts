// ==========================================
// 사주 계산 엔진 — 타입 및 상수 정의
// ==========================================
//
// [사주명리학 기본 개념]
// 사주(四柱)란 사람이 태어난 연/월/일/시를 4개의 기둥(柱)으로 표현한 것입니다.
// 각 기둥은 "천간(天干) + 지지(地支)" 한 쌍으로 이루어져 있어서
// 총 8글자 → "팔자(八字)"라고 부릅니다.
//
// 예시: 1995년 3월 15일 오시(11:30~13:30) 출생
//   년주: 을해  |  월주: 기묘  |  일주: 경오  |  시주: 임오
//   ↑ 천간+지지   ↑ 천간+지지   ↑ 천간+지지   ↑ 천간+지지
//
// 이 파일은 사주 계산에 필요한 모든 기초 상수와 타입을 정의합니다.

// ──────────────────────────────────────────
// 1) 천간 (天干) — 하늘의 기운, 10개
// ──────────────────────────────────────────
// 갑을병정무기경신임계 순서로 반복되며,
// 각각 오행(목화토금수)과 음양이 정해져 있습니다.
// 예: 갑 = 양목(陽木), 을 = 음목(陰木)
export const HEAVENLY_STEMS = ['갑', '을', '병', '정', '무', '기', '경', '신', '임', '계'] as const;
export type HeavenlyStem = typeof HEAVENLY_STEMS[number]; // '갑' | '을' | ... | '계' 유니온 타입

// ──────────────────────────────────────────
// 2) 지지 (地支) — 땅의 기운, 12개
// ──────────────────────────────────────────
// 자축인묘진사오미신유술해 순서 (12지신과 동일: 쥐소호토끼용뱀말양원숭이닭개돼지)
// 각각 오행과 음양이 정해져 있습니다.
export const EARTHLY_BRANCHES = ['자', '축', '인', '묘', '진', '사', '오', '미', '신', '유', '술', '해'] as const;
export type EarthlyBranch = typeof EARTHLY_BRANCHES[number]; // '자' | '축' | ... | '해' 유니온 타입

// ──────────────────────────────────────────
// 3) 오행 (五行) — 만물의 5가지 기운
// ──────────────────────────────────────────
// 목(木/나무) → 화(火/불) → 토(土/흙) → 금(金/쇠) → 수(水/물)
// 이 5가지가 서로 돕고(상생), 억제하는(상극) 관계를 이룹니다.
export const FIVE_ELEMENTS = ['목', '화', '토', '금', '수'] as const;
export type FiveElement = typeof FIVE_ELEMENTS[number];

// ──────────────────────────────────────────
// 4) 음양 (陰陽) — 모든 기운의 양면성
// ──────────────────────────────────────────
// 양(陽) = 적극적/외향적, 음(陰) = 수용적/내향적
export type YinYang = '양' | '음';

// ──────────────────────────────────────────
// 5) 매핑 테이블들 — 천간/지지 → 오행/음양 변환
// ──────────────────────────────────────────

// 천간이 어떤 오행에 속하는지 매핑
// 예: '갑'은 '목'(나무), '병'은 '화'(불)
export const STEM_ELEMENT: Record<HeavenlyStem, FiveElement> = {
  '갑': '목', '을': '목',   // 갑을 = 목(나무)
  '병': '화', '정': '화',   // 병정 = 화(불)
  '무': '토', '기': '토',   // 무기 = 토(흙)
  '경': '금', '신': '금',   // 경신 = 금(쇠)
  '임': '수', '계': '수',   // 임계 = 수(물)
};

// 천간이 양인지 음인지 매핑
// 홀수번째(갑병무경임) = 양, 짝수번째(을정기신계) = 음
export const STEM_YINYANG: Record<HeavenlyStem, YinYang> = {
  '갑': '양', '을': '음',
  '병': '양', '정': '음',
  '무': '양', '기': '음',
  '경': '양', '신': '음',
  '임': '양', '계': '음',
};

// 지지(12지신)가 어떤 오행에 속하는지 매핑
// 예: '자'(쥐) = 수(물), '인'(호랑이) = 목(나무)
export const BRANCH_ELEMENT: Record<EarthlyBranch, FiveElement> = {
  '자': '수', '축': '토',   // 자(쥐)=수, 축(소)=토
  '인': '목', '묘': '목',   // 인(호랑이)=목, 묘(토끼)=목
  '진': '토', '사': '화',   // 진(용)=토, 사(뱀)=화
  '오': '화', '미': '토',   // 오(말)=화, 미(양)=토
  '신': '금', '유': '금',   // 신(원숭이)=금, 유(닭)=금
  '술': '토', '해': '수',   // 술(개)=토, 해(돼지)=수
};

// 지지가 양인지 음인지 매핑
export const BRANCH_YINYANG: Record<EarthlyBranch, YinYang> = {
  '자': '양', '축': '음',
  '인': '양', '묘': '음',
  '진': '양', '사': '음',
  '오': '양', '미': '음',
  '신': '양', '유': '음',
  '술': '양', '해': '음',
};

// ──────────────────────────────────────────
// 6) 12시진 — 하루를 12개 시간대로 나눈 것
// ──────────────────────────────────────────
// 옛날에는 시계 대신 12지지로 시간을 표현했습니다.
// 하루 24시간 ÷ 12 = 2시간 단위
// 자시(23:30~01:30), 축시(01:30~03:30), ... 해시(21:30~23:30)
// 사용자가 출생 시간을 "오시" 같이 선택하면 이 배열에서 찾습니다.
export const TWELVE_HOURS = [
  { name: '자시', branch: '자' as EarthlyBranch, range: '23:30~01:30' },
  { name: '축시', branch: '축' as EarthlyBranch, range: '01:30~03:30' },
  { name: '인시', branch: '인' as EarthlyBranch, range: '03:30~05:30' },
  { name: '묘시', branch: '묘' as EarthlyBranch, range: '05:30~07:30' },
  { name: '진시', branch: '진' as EarthlyBranch, range: '07:30~09:30' },
  { name: '사시', branch: '사' as EarthlyBranch, range: '09:30~11:30' },
  { name: '오시', branch: '오' as EarthlyBranch, range: '11:30~13:30' },
  { name: '미시', branch: '미' as EarthlyBranch, range: '13:30~15:30' },
  { name: '신시', branch: '신' as EarthlyBranch, range: '15:30~17:30' },
  { name: '유시', branch: '유' as EarthlyBranch, range: '17:30~19:30' },
  { name: '술시', branch: '술' as EarthlyBranch, range: '19:30~21:30' },
  { name: '해시', branch: '해' as EarthlyBranch, range: '21:30~23:30' },
] as const;

// ──────────────────────────────────────────
// 7) 60갑자 (六十甲子) — 천간×지지 조합 60개
// ──────────────────────────────────────────
// 천간 10개 × 지지 12개이지만, 실제로는 60개 조합만 존재합니다.
// (양천간+양지지, 음천간+음지지만 짝이 됨)
// 갑자 → 을축 → 병인 → ... → 계해 (60번째) → 다시 갑자로 순환
// 이 60개 조합이 날짜/연도/월/시간에 순서대로 배정됩니다.
export function getSixtyJiazi(): Array<{ stem: HeavenlyStem; branch: EarthlyBranch }> {
  const result: Array<{ stem: HeavenlyStem; branch: EarthlyBranch }> = [];
  for (let i = 0; i < 60; i++) {
    result.push({
      stem: HEAVENLY_STEMS[i % 10],     // 10개 천간이 순환
      branch: EARTHLY_BRANCHES[i % 12], // 12개 지지가 순환
    });
  }
  return result;
}

// ──────────────────────────────────────────
// 8) 오행 상생/상극 관계
// ──────────────────────────────────────────
//
// [상생 (서로 도움)] 시계방향 순환:
//   목 → 화 → 토 → 금 → 수 → 목...
//   "나무가 타서 불이 되고, 불이 재(흙)가 되고, 흙에서 금속이 나오고,
//    금속 표면에 물방울이 맺히고, 물이 나무를 키운다"
//
// [상극 (서로 억제)] 별 모양 순환:
//   목 → 토, 토 → 수, 수 → 화, 화 → 금, 금 → 목
//   "나무가 흙의 양분을 빼앗고, 흙이 물을 막고, 물이 불을 끄고,
//    불이 금속을 녹이고, 금속(도끼)이 나무를 자른다"

// key가 생(生)해주는 대상 (상생)
export const ELEMENT_GENERATES: Record<FiveElement, FiveElement> = {
  '목': '화', // 목생화: 나무 → 불 (나무가 타서 불이 됨)
  '화': '토', // 화생토: 불 → 흙 (불이 재가 되어 흙이 됨)
  '토': '금', // 토생금: 흙 → 금속 (흙에서 금속이 나옴)
  '금': '수', // 금생수: 금속 → 물 (금속에 물방울이 맺힘)
  '수': '목', // 수생목: 물 → 나무 (물이 나무를 키움)
};

// key가 극(克)하는 대상 (상극)
export const ELEMENT_OVERCOMES: Record<FiveElement, FiveElement> = {
  '목': '토', // 목극토: 나무가 흙의 양분을 뺏음
  '토': '수', // 토극수: 흙이 물을 막음 (둑)
  '수': '화', // 수극화: 물이 불을 끔
  '화': '금', // 화극금: 불이 금속을 녹임
  '금': '목', // 금극목: 금속(도끼)이 나무를 자름
};

// ──────────────────────────────────────────
// 9) 인터페이스 (데이터 구조 정의)
// ──────────────────────────────────────────

// 사주의 기둥(柱) 하나를 표현
// 예: 년주가 "갑자"이면 → { stem: '갑', branch: '자' }
export interface Pillar {
  stem: HeavenlyStem;    // 천간 (위쪽 글자)
  branch: EarthlyBranch; // 지지 (아래쪽 글자)
}

// 사주 팔자 전체 — 4개의 기둥
// hour가 null이면 출생 시간을 모르는 경우
export interface FourPillars {
  year: Pillar;          // 년주: 태어난 연도의 간지 (조상, 사회적 환경)
  month: Pillar;         // 월주: 태어난 월의 간지 (부모, 성장 환경)
  day: Pillar;           // 일주: 태어난 날의 간지 (본인, 배우자) ← 가장 중요!
  hour: Pillar | null;   // 시주: 태어난 시간의 간지 (자녀, 말년) | null = 시간 모름
}

// 오행 분포 분석 결과
// 사주 8글자에서 각 오행이 몇 개씩 있는지 세고,
// 가장 많은(강세) 오행과 하나도 없는(부족) 오행을 파악
export interface FiveElementProfile {
  counts: Record<FiveElement, number>;   // 각 오행 개수 (예: 목2, 화3, 토1, 금1, 수1)
  ratios: Record<FiveElement, number>;   // 각 오행 비율 (0~1 사이 소수)
  dominant: FiveElement;                 // 가장 많은 오행
  lacking: FiveElement | null;           // 0개인 오행 (없으면 null)
}

// 일간(日干)의 강약 — 사주 해석의 핵심 판단
// - strong(신강): 일간의 힘이 강함 → 자기주장이 강하고 독립적
// - weak(신약): 일간의 힘이 약함 → 도움이 필요하고 협력적
// - balanced(중화): 균형잡힘 → 안정적
export type DayMasterStrength = 'strong' | 'weak' | 'balanced';

// 사주 분석 결과 전체를 담는 인터페이스
// analyzeSaju() 함수의 반환값
export interface SajuAnalysis {
  fourPillars: FourPillars;              // 사주 팔자 4기둥
  fiveElements: FiveElementProfile;      // 오행 분석 결과
  dayMaster: HeavenlyStem;               // 일간 = 일주의 천간 (사주의 "나" 자신을 대표)
  dayMasterElement: FiveElement;         // 일간의 오행 (예: 경 → 금)
  dayMasterStrength: DayMasterStrength;  // 일간 강약
}

// 사용자가 입력하는 생년월일시 정보
export interface SajuInput {
  calendarType: 'solar' | 'lunar';  // 양력(solar) 또는 음력(lunar)
  isLeapMonth: boolean;              // 윤달 여부 (음력일 때만 의미있음)
  birthYear: number;                 // 출생 연도 (예: 1995)
  birthMonth: number;                // 출생 월 (1~12)
  birthDay: number;                  // 출생 일 (1~31)
  birthTime: string | 'unknown';     // 12시진 이름(예: '오시') 또는 'unknown'(모름)
  gender: 'male' | 'female';        // 성별 (대운 계산 방향에 영향)
}

// 오늘의 운세 3축(연애/일/재물) 각각의 결과
export interface DailyReading {
  love: { score: number; keyword: string; summary: string };  // 연애운 (1~10점)
  work: { score: number; keyword: string; summary: string };  // 직장/일운
  money: { score: number; keyword: string; summary: string }; // 재물운
}

// 오늘의 일진(日辰)과 사주 원국의 관계 분석 결과
// 일진 = 오늘 날짜에 해당하는 간지 (매일 바뀜)
export interface DailyRelation {
  todayPillar: Pillar;  // 오늘의 일주 (예: 병오)
  dominantInteraction: 'support' | 'clash' | 'neutral';
  // support = 오늘 기운이 나를 도와줌 (상생)
  // clash   = 오늘 기운이 나와 부딪힘 (상극)
  // neutral = 특별한 관계 없음
  reading: DailyReading; // 3축 운세 결과
}
