// ==========================================
// 사주 팔자 (四柱八字) 계산
// ==========================================
//
// [이 파일이 하는 일]
// 생년월일시를 받아서 4개의 기둥(년주/월주/일주/시주)을 계산합니다.
// 각 기둥은 "천간 + 지지" 한 쌍으로 이루어져 있습니다.
//
// [핵심 원리]
// - 년주: "입춘" 기준으로 바뀜 (1월 1일이 아님!)
// - 월주: "절기" 기준으로 바뀜 (달력 월이 아님!)
// - 일주: 매일 하나씩 60갑자가 순환
// - 시주: 일간(일주의 천간)에 따라 결정됨
//
// [사용하는 라이브러리]
// lunar-javascript의 "Exact" 메서드들을 사용합니다.
// Exact = 절기/입춘 기준으로 정확하게 계산한다는 의미
// (Exact가 아닌 메서드는 음력 월 기준이라 사주에는 부정확)

import { Solar } from 'lunar-javascript';
import { normalizeBirthDate } from './calendar';
import {
  HEAVENLY_STEMS,
  EARTHLY_BRANCHES,
  TWELVE_HOURS,
  type HeavenlyStem,
  type EarthlyBranch,
  type Pillar,
  type FourPillars,
  type SajuInput,
} from './types';

// ──────────────────────────────────────────
// 한자 → 한글 변환 테이블
// ──────────────────────────────────────────
// lunar-javascript는 간지를 한자(甲乙丙...)로 반환하므로
// 우리 서비스에서 사용하는 한글(갑을병...)로 변환합니다.

const HANJA_TO_STEM: Record<string, HeavenlyStem> = {
  '甲': '갑', '乙': '을', '丙': '병', '丁': '정', '戊': '무',
  '己': '기', '庚': '경', '辛': '신', '壬': '임', '癸': '계',
};

const HANJA_TO_BRANCH: Record<string, EarthlyBranch> = {
  '子': '자', '丑': '축', '寅': '인', '卯': '묘', '辰': '진', '巳': '사',
  '午': '오', '未': '미', '申': '신', '酉': '유', '戌': '술', '亥': '해',
};

// ──────────────────────────────────────────
// 각 기둥(柱) 계산 함수들
// ──────────────────────────────────────────

/**
 * 년주 (年柱) 계산
 *
 * 핵심: getYearGanExact() / getYearZhiExact()를 사용합니다.
 * "Exact"가 붙으면 "입춘"을 기준으로 연도가 바뀝니다.
 *
 * 예: 1995년 1월 20일 → 아직 입춘 전이므로 → 1994년의 간지(갑술)
 *     1995년 2월 5일  → 입춘 이후이므로   → 1995년의 간지(을해)
 */
function getYearPillar(solarYear: number, solarMonth: number, solarDay: number): Pillar {
  const solar = Solar.fromYmd(solarYear, solarMonth, solarDay);
  const lunar = solar.getLunar();

  // 한자 간지를 한글로 변환
  const stem = HANJA_TO_STEM[lunar.getYearGanExact()];   // 년간 (천간)
  const branch = HANJA_TO_BRANCH[lunar.getYearZhiExact()]; // 년지 (지지)

  return { stem, branch };
}

/**
 * 월주 (月柱) 계산
 *
 * 핵심: getMonthGanExact() / getMonthZhiExact()를 사용합니다.
 * "Exact"가 붙으면 "절기"를 기준으로 월이 바뀝니다.
 *
 * 예: 양력 3월 5일 (경칩 이전) → 아직 인월(1월)
 *     양력 3월 6일 (경칩 이후) → 묘월(2월) 시작
 */
function getMonthPillar(solarYear: number, solarMonth: number, solarDay: number): Pillar {
  const solar = Solar.fromYmd(solarYear, solarMonth, solarDay);
  const lunar = solar.getLunar();

  const stem = HANJA_TO_STEM[lunar.getMonthGanExact()];
  const branch = HANJA_TO_BRANCH[lunar.getMonthZhiExact()];

  return { stem, branch };
}

/**
 * 일주 (日柱) 계산
 *
 * 매일 60갑자가 순서대로 순환합니다.
 * 예: 오늘이 갑자일이면 내일은 을축일, 모레는 병인일...
 *     60일 후에 다시 갑자일로 돌아옵니다.
 *
 * [일주가 중요한 이유]
 * 일주의 천간(일간)은 사주에서 "나 자신"을 대표합니다.
 * 모든 사주 해석의 중심이 됩니다.
 */
function getDayPillar(solarYear: number, solarMonth: number, solarDay: number): Pillar {
  const solar = Solar.fromYmd(solarYear, solarMonth, solarDay);
  const lunar = solar.getLunar();

  const stem = HANJA_TO_STEM[lunar.getDayGan()];   // 일간 (나 자신)
  const branch = HANJA_TO_BRANCH[lunar.getDayZhi()]; // 일지

  return { stem, branch };
}

/**
 * 시주 (時柱) 계산
 *
 * [핵심 규칙: 일간기시법(日干起時法)]
 * 시주의 지지(地支)는 태어난 시간으로 고정되지만,
 * 시주의 천간(天干)은 "그 날의 일간"에 따라 달라집니다.
 *
 * 규칙표:
 *   갑일·기일 → 자시가 "갑자"시부터 시작
 *   을일·경일 → 자시가 "병자"시부터 시작
 *   병일·신일 → 자시가 "무자"시부터 시작
 *   정일·임일 → 자시가 "경자"시부터 시작
 *   무일·계일 → 자시가 "임자"시부터 시작
 *
 * 그리고 자시(0번)부터 해시(11번)까지 순서대로 천간이 +1씩 증가합니다.
 *
 * @param dayStem - 일간 (일주의 천간). 예: '갑'
 * @param birthTime - 사용자가 선택한 시진 이름. 예: '오시', 'unknown'
 * @returns 시주 Pillar 또는 null (시간을 모르는 경우)
 */
function getHourPillar(dayStem: HeavenlyStem, birthTime: string): Pillar | null {
  // 출생 시간을 모르면 시주는 null
  if (birthTime === 'unknown') return null;

  // 입력된 시진 이름(예: '오시')으로 시진 정보를 찾음
  const hourInfo = TWELVE_HOURS.find(h => h.name === birthTime);
  if (!hourInfo) return null;

  const branch = hourInfo.branch; // 시주의 지지 (시간에 의해 고정)
  const branchIndex = EARTHLY_BRANCHES.indexOf(branch); // 0(자)~11(해)

  // 일간기시법: 일간에 따라 자시의 천간 시작점이 결정됨
  const dayStemIndex = HEAVENLY_STEMS.indexOf(dayStem);
  const startStemMap: Record<number, number> = {
    0: 0, // 갑(0) → 갑자시 시작 (갑=0)
    1: 2, // 을(1) → 병자시 시작 (병=2)
    2: 4, // 병(2) → 무자시 시작 (무=4)
    3: 6, // 정(3) → 경자시 시작 (경=6)
    4: 8, // 무(4) → 임자시 시작 (임=8)
    5: 0, // 기(5) → 갑자시 시작 (갑일·기일은 같은 규칙)
    6: 2, // 경(6) → 병자시 시작
    7: 4, // 신(7) → 무자시 시작
    8: 6, // 임(8) → 경자시 시작
    9: 8, // 계(9) → 임자시 시작
  };

  const startStemIndex = startStemMap[dayStemIndex]; // 자시의 천간 인덱스
  // 자시(0)부터 해시(11)까지 천간이 순서대로 +1씩 증가하며, 10개를 순환
  const stemIndex = (startStemIndex + branchIndex) % 10;

  return {
    stem: HEAVENLY_STEMS[stemIndex],
    branch,
  };
}

// ──────────────────────────────────────────
// 외부에서 호출하는 메인 함수들
// ──────────────────────────────────────────

/**
 * 사주 팔자 전체를 계산하는 메인 함수
 *
 * 흐름:
 * 1) 사용자 입력(SajuInput)의 날짜를 양력으로 정규화
 * 2) 양력 날짜로 년주/월주/일주 계산
 * 3) 일주의 천간(일간) + 출생시간으로 시주 계산
 * 4) 4개 기둥을 합쳐서 반환
 */
export function calculateFourPillars(input: SajuInput): FourPillars {
  // 1) 음력 입력이면 양력으로 변환, 양력이면 그대로
  const { solarYear, solarMonth, solarDay } = normalizeBirthDate(
    input.calendarType,
    input.birthYear,
    input.birthMonth,
    input.birthDay,
    input.isLeapMonth,
  );

  // 2) 각 기둥 계산 (모두 양력 날짜 기준)
  const yearPillar = getYearPillar(solarYear, solarMonth, solarDay);
  const monthPillar = getMonthPillar(solarYear, solarMonth, solarDay);
  const dayPillar = getDayPillar(solarYear, solarMonth, solarDay);

  // 3) 시주는 일간(dayPillar.stem)이 필요하므로 일주 계산 후에 수행
  const hourPillar = getHourPillar(dayPillar.stem, input.birthTime);

  return {
    year: yearPillar,
    month: monthPillar,
    day: dayPillar,
    hour: hourPillar,
  };
}

/**
 * 특정 양력 날짜의 일주(日柱)를 계산합니다.
 * 주로 "오늘의 일진"을 구할 때 사용합니다.
 * (daily-fortune.ts에서 호출)
 */
export function getDayPillarForDate(year: number, month: number, day: number): Pillar {
  return getDayPillar(year, month, day);
}

/**
 * 사주 팔자를 사람이 읽기 쉬운 문자열로 변환합니다.
 * 예: "년주: 을해 | 월주: 기묘 | 일주: 경오 | 시주: 임오"
 * 디버깅이나 로깅에 유용합니다.
 */
export function fourPillarsToString(fp: FourPillars): string {
  const parts = [
    `년주: ${fp.year.stem}${fp.year.branch}`,
    `월주: ${fp.month.stem}${fp.month.branch}`,
    `일주: ${fp.day.stem}${fp.day.branch}`,
  ];
  if (fp.hour) {
    parts.push(`시주: ${fp.hour.stem}${fp.hour.branch}`);
  } else {
    parts.push(`시주: 미상`);
  }
  return parts.join(' | ');
}
