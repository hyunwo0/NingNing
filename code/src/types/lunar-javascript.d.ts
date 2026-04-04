// ==========================================
// lunar-javascript 라이브러리 타입 선언
// ==========================================
//
// [이 파일이 하는 일]
// lunar-javascript 라이브러리는 TypeScript 타입을 기본 제공하지 않습니다.
// 이 파일에서 우리가 사용하는 함수들의 타입을 수동으로 선언하여
// TypeScript 컴파일러가 에러를 내지 않도록 합니다.
//
// [.d.ts 파일이란?]
// "선언 파일"이라고 하며, 실제 코드는 없고 타입 정보만 담고 있습니다.
// JavaScript로만 작성된 라이브러리에 TypeScript 타입을 입혀주는 역할입니다.

declare module 'lunar-javascript' {
  /**
   * Solar — 양력 날짜를 다루는 클래스
   *
   * 양력 날짜를 생성하고, 음력으로 변환하거나 절기 정보를 가져올 수 있습니다.
   */
  export class Solar {
    /** 양력 연/월/일로 Solar 객체를 생성합니다 */
    static fromYmd(year: number, month: number, day: number): Solar;

    getYear(): number;   // 양력 연도
    getMonth(): number;  // 양력 월 (1~12)
    getDay(): number;    // 양력 일 (1~31)

    /** 이 양력 날짜에 대응하는 음력(Lunar) 객체를 반환합니다 */
    getLunar(): Lunar;
  }

  /**
   * Lunar — 음력 날짜를 다루는 클래스
   *
   * 음력 날짜를 생성하고, 양력으로 변환하거나 간지/절기 정보를 가져올 수 있습니다.
   * 사주 계산에서 가장 핵심적으로 사용되는 클래스입니다.
   */
  export class Lunar {
    /** 음력 연/월/일로 Lunar 객체를 생성합니다 (윤달은 음수 월로 전달) */
    static fromYmd(year: number, month: number, day: number): Lunar;

    getYear(): number;            // 음력 연도
    getMonth(): number;           // 음력 월
    getDay(): number;             // 음력 일
    getMonthInChinese(): string;  // 음력 월을 한자로 반환 (예: '正')

    /** 이 음력 날짜에 대응하는 양력(Solar) 객체를 반환합니다 */
    getSolar(): Solar;

    /** 이 날짜의 절기 이름을 반환합니다 (절기가 아닌 날이면 null) */
    getJieQi(): string | null;

    // ──── 간지 관련 메서드 ────
    // "Exact" 없는 메서드: 음력 월 기준 (사주에는 부정확)
    // "Exact" 있는 메서드: 절기/입춘 기준 (사주에 정확)

    getYearGan(): string;         // 년간 (음력 기준, 한자)
    getYearZhi(): string;         // 년지 (음력 기준, 한자)
    getYearGanExact(): string;    // 년간 (입춘 기준, 한자) ← 사주용!
    getYearZhiExact(): string;    // 년지 (입춘 기준, 한자) ← 사주용!

    getMonthGan(): string;        // 월간 (음력 기준, 한자)
    getMonthZhi(): string;        // 월지 (음력 기준, 한자)
    getMonthGanExact(): string;   // 월간 (절기 기준, 한자) ← 사주용!
    getMonthZhiExact(): string;   // 월지 (절기 기준, 한자) ← 사주용!

    getDayGan(): string;          // 일간 (한자) — "나 자신"을 대표하는 글자
    getDayZhi(): string;          // 일지 (한자)

    getTimeGan(): string;         // 시간 (한자, 현재 시각 기준)
    getTimeZhi(): string;         // 시지 (한자, 현재 시각 기준)
  }
}
