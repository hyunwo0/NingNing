// ==========================================
// 음양력 변환 및 절기 계산
// ==========================================
//
// [이 파일이 하는 일]
// 사주를 계산하려면 "양력 날짜"가 필요합니다.
// 사용자가 음력 생일을 입력하면 → 양력으로 변환해야 합니다.
// 또한 사주의 "월주"는 달력 월이 아니라 "절기"를 기준으로 바뀌기 때문에
// 절기 관련 계산도 이 파일에서 담당합니다.
//
// [사용하는 라이브러리: lunar-javascript]
// 중국/한국 음양력 변환, 절기, 간지 계산을 지원하는 라이브러리입니다.
// Solar = 양력 날짜 객체, Lunar = 음력 날짜 객체

import { Solar, Lunar } from 'lunar-javascript';

// ──────────────────────────────────────────
// 양력 ↔ 음력 변환
// ──────────────────────────────────────────

/**
 * 양력 → 음력 변환
 * 예: solarToLunar(2024, 2, 10) → { year: 2024, month: 1, day: 1 } (음력 정월 초하루)
 */
export function solarToLunar(year: number, month: number, day: number) {
  const solar = Solar.fromYmd(year, month, day); // 양력 날짜 객체 생성
  const lunar = solar.getLunar();                 // 해당 양력에 대응하는 음력 가져오기
  return {
    year: lunar.getYear(),
    month: lunar.getMonth(),
    day: lunar.getDay(),
  };
}

/**
 * 음력 → 양력 변환
 * @param isLeapMonth - 윤달 여부. 음력에는 같은 월이 2번 올 수 있는데, 두 번째가 윤달입니다.
 *
 * 예: lunarToSolar(2024, 1, 1) → { year: 2024, month: 2, day: 10 }
 */
export function lunarToSolar(year: number, month: number, day: number, isLeapMonth: boolean = false) {
  const lunar = Lunar.fromYmd(year, month, day);
  // 윤달인 경우: lunar-javascript에서 월을 음수로 전달하면 윤달로 인식합니다
  if (isLeapMonth) {
    const leapLunar = Lunar.fromYmd(year, -month, day); // -month = 윤달
    const solar = leapLunar.getSolar();
    return { year: solar.getYear(), month: solar.getMonth(), day: solar.getDay() };
  }
  const solar = lunar.getSolar();
  return { year: solar.getYear(), month: solar.getMonth(), day: solar.getDay() };
}

// ──────────────────────────────────────────
// 절기 (節氣) 관련
// ──────────────────────────────────────────
//
// [절기란?]
// 1년을 24등분한 계절의 기준점입니다. 양력 기준으로 대략 고정된 날짜에 옵니다.
// 사주에서는 24절기 중 "12절기"(節氣)만 사용하여 월의 경계를 정합니다.
//
// 중요: 사주의 "월"은 달력의 1월~12월이 아닙니다!
// 예: 양력 2월 3일 입춘 이전 출생 → 사주상 아직 전년도 12월(축월)
//     양력 2월 4일 입춘 이후 출생 → 사주상 1월(인월) 시작

// 사주에서 월의 시작을 알려주는 12절기 목록
// (참고: 24절기 중 "절"만 사용, "기"는 사용하지 않음)
const MONTH_JIEQI = [
  '입춘', // 인월(1월) 시작 — 보통 양력 2월 4일경
  '경칩', // 묘월(2월) 시작 — 보통 양력 3월 6일경
  '청명', // 진월(3월) 시작 — 보통 양력 4월 5일경
  '입하', // 사월(4월) 시작 — 보통 양력 5월 6일경
  '망종', // 오월(5월) 시작 — 보통 양력 6월 6일경
  '소서', // 미월(6월) 시작 — 보통 양력 7월 7일경
  '입추', // 신월(7월) 시작 — 보통 양력 8월 7일경
  '백로', // 유월(8월) 시작 — 보통 양력 9월 8일경
  '한로', // 술월(9월) 시작 — 보통 양력 10월 8일경
  '입동', // 해월(10월) 시작 — 보통 양력 11월 7일경
  '대설', // 자월(11월) 시작 — 보통 양력 12월 7일경
  '소한', // 축월(12월) 시작 — 보통 양력 1월 6일경
] as const;

/**
 * 특정 연도의 각 절기 날짜를 양력으로 가져옵니다.
 * 사주의 월 경계를 정하는 데 사용됩니다.
 *
 * 방식: 1월 1일부터 12월 31일까지 매일 순회하면서
 *       lunar-javascript에게 "이 날이 절기인가?" 물어봅니다.
 *       12절기에 해당하면 결과 배열에 추가합니다.
 */
export function getJieqiDates(year: number): Array<{ name: string; solar: { year: number; month: number; day: number } }> {
  const results: Array<{ name: string; solar: { year: number; month: number; day: number } }> = [];

  const solar = Solar.fromYmd(year, 1, 1);
  const lunar = solar.getLunar();
  const jieqiMap = lunar.getYear();

  // 1월~12월, 각 월의 1일~31일을 순회
  for (let month = 1; month <= 12; month++) {
    for (let day = 1; day <= 31; day++) {
      try {
        const s = Solar.fromYmd(year, month, day);
        const l = s.getLunar();
        const jieqi = l.getJieQi(); // 이 날의 절기 이름 (없으면 null)
        // 12절기 목록에 있는 절기만 수집
        if (jieqi && MONTH_JIEQI.includes(jieqi as typeof MONTH_JIEQI[number])) {
          results.push({
            name: jieqi,
            solar: { year, month, day },
          });
        }
      } catch {
        break; // 해당 월의 마지막 날을 넘으면 다음 월로 이동
      }
    }
  }

  return results;
}

/**
 * 특정 양력 날짜가 절기 기준으로 사주의 몇 월에 해당하는지 반환합니다.
 *
 * [반환값]
 * 1~12 → 인월(1)=양력2월경, 묘월(2)=양력3월경, ..., 축월(12)=양력1월경
 *
 * 주의: 양력 "월"과 사주 "월"은 다릅니다!
 * 양력 1월 10일 → 사주상으로는 보통 축월(12월) 입니다.
 *
 * lunar-javascript의 getMonthZhiExact()가 절기를 고려해서
 * 정확한 지지(한자)를 반환하므로, 이를 월 번호로 변환합니다.
 */
export function getMonthByJieqi(solarYear: number, solarMonth: number, solarDay: number): number {
  const solar = Solar.fromYmd(solarYear, solarMonth, solarDay);
  const lunar = solar.getLunar();

  // 절기 기준 정확한 월의 지지(한자)를 가져옴
  const monthZhi = lunar.getMonthZhiExact();

  // 한자 지지 → 사주 월 번호 매핑
  // 인(寅)=1월, 묘(卯)=2월, ..., 축(丑)=12월
  const zhiToMonth: Record<string, number> = {
    '寅': 1, '卯': 2, '辰': 3, '巳': 4, '午': 5, '未': 6,
    '申': 7, '酉': 8, '戌': 9, '亥': 10, '子': 11, '丑': 12,
  };

  return zhiToMonth[monthZhi] ?? 1;
}

/**
 * 입춘 기준으로 사주의 연도를 판단합니다.
 *
 * [핵심 규칙]
 * 사주에서 "년"은 1월 1일이 아니라 "입춘"(보통 2/4경)에 바뀝니다.
 * 예: 1995년 1월 생 → 사주상으로는 아직 1994년(갑술년)
 *     1995년 2월 4일 입춘 이후 → 사주상 1995년(을해년) 시작
 *
 * 실제 간지 계산은 pillars.ts에서 lunar-javascript의
 * getYearGanExact()를 사용하여 더 정확하게 처리합니다.
 */
export function getSajuYear(solarYear: number, solarMonth: number, solarDay: number): number {
  const solar = Solar.fromYmd(solarYear, solarMonth, solarDay);
  const lunar = solar.getLunar();
  const yearGan = lunar.getYearGanExact();

  const ganIndex = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'].indexOf(yearGan);
  return solarYear; // 기본값 반환, 정확한 간지는 pillars.ts에서 계산
}

/**
 * 양력 날짜로부터 Lunar(음력) 객체를 반환하는 유틸 함수
 * 다른 모듈에서 음력 정보가 필요할 때 사용합니다.
 */
export function getLunarFromSolar(solarYear: number, solarMonth: number, solarDay: number) {
  const solar = Solar.fromYmd(solarYear, solarMonth, solarDay);
  return solar.getLunar();
}

/**
 * 사용자가 입력한 생년월일을 양력으로 정규화(통일)합니다.
 *
 * - 양력으로 입력한 경우 → 그대로 반환
 * - 음력으로 입력한 경우 → 양력으로 변환하여 반환
 *
 * 모든 사주 계산은 양력 기준으로 수행되므로,
 * 이 함수를 거쳐서 양력으로 통일한 뒤 계산을 시작합니다.
 */
export function normalizeBirthDate(
  calendarType: 'solar' | 'lunar',
  year: number,
  month: number,
  day: number,
  isLeapMonth: boolean = false,
): { solarYear: number; solarMonth: number; solarDay: number } {
  if (calendarType === 'solar') {
    // 양력이면 변환 불필요
    return { solarYear: year, solarMonth: month, solarDay: day };
  }
  // 음력이면 양력으로 변환
  const solar = lunarToSolar(year, month, day, isLeapMonth);
  return { solarYear: solar.year, solarMonth: solar.month, solarDay: solar.day };
}
