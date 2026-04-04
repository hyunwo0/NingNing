// ==========================================
// Supabase DB 타입 정의 (스키마)
// ==========================================
//
// [이 파일이 하는 일]
// 데이터베이스의 테이블 구조를 TypeScript 타입으로 정의합니다.
// 이렇게 하면 DB 쿼리를 작성할 때 자동완성과 타입 체크를 받을 수 있어서
// 오타나 잘못된 컬럼 참조를 컴파일 시점에 잡아낼 수 있습니다.
//
// [각 테이블의 3가지 타입]
// - Row: DB에서 읽어온 데이터의 타입 (SELECT 결과)
// - Insert: DB에 새로 넣을 때의 타입 (INSERT 시 필수/선택 필드 구분)
// - Update: 기존 데이터를 수정할 때의 타입 (UPDATE 시 모든 필드가 선택적)
//
// 참고: 실제 프로젝트에서는 `supabase gen types` 명령으로 자동 생성할 수 있지만,
// 현재는 수동으로 정의되어 있습니다.

export interface Database {
  public: {
    Tables: {
      // ──────────────────────────────────────
      // users — 사용자 계정 테이블
      // ──────────────────────────────────────
      // Supabase Auth와 연동되는 기본 사용자 정보
      users: {
        Row: {
          id: string;          // Supabase Auth에서 발급한 고유 ID (UUID)
          created_at: string;  // 가입 일시
          updated_at: string;  // 마지막 수정 일시
        };
        Insert: {
          id: string;          // Auth UID를 그대로 사용 (필수)
          created_at?: string; // 자동 생성 가능 (선택)
          updated_at?: string;
        };
        Update: {
          updated_at?: string; // 수정 시 updated_at만 변경
        };
      };

      // ──────────────────────────────────────
      // saju_profiles — 사주 프로필 테이블
      // ──────────────────────────────────────
      // 사용자가 입력한 생년월일시 + 계산된 사주 결과를 저장합니다.
      // 한 사용자가 여러 프로필을 가질 수 있습니다 (본인, 연인, 가족 등).
      // 비회원도 세션 ID로 프로필을 저장할 수 있습니다.
      saju_profiles: {
        Row: {
          id: string;                  // 프로필 고유 ID
          user_id: string | null;      // 회원의 경우 users.id와 연결 (비회원이면 null)
          session_id: string | null;   // 비회원의 경우 브라우저 세션 ID
          calendar_type: 'solar' | 'lunar'; // 양력 / 음력
          is_leap_month: boolean;      // 윤달 여부
          birth_year: number;          // 출생 연도
          birth_month: number;         // 출생 월
          birth_day: number;           // 출생 일
          birth_time: string;          // 출생 시진 (예: '오시') 또는 'unknown'
          gender: 'male' | 'female';   // 성별
          four_pillars: Record<string, unknown> | null;  // 계산된 사주 팔자 (JSON)
          five_elements: Record<string, unknown> | null; // 오행 분석 결과 (JSON)
          day_master: string | null;                      // 일간 (예: '경')
          day_master_strength: 'strong' | 'weak' | 'balanced' | null; // 일간 강약
          created_at: string;
        };
        Insert: {
          id?: string;                 // 자동 생성 (선택)
          user_id?: string | null;
          session_id?: string | null;
          calendar_type: 'solar' | 'lunar'; // 필수
          is_leap_month?: boolean;
          birth_year: number;          // 필수
          birth_month: number;         // 필수
          birth_day: number;           // 필수
          birth_time?: string;
          gender: 'male' | 'female';   // 필수
          four_pillars?: Record<string, unknown> | null;
          five_elements?: Record<string, unknown> | null;
          day_master?: string | null;
          day_master_strength?: 'strong' | 'weak' | 'balanced' | null;
        };
        Update: Partial<Database['public']['Tables']['saju_profiles']['Insert']>;
      };

      // ──────────────────────────────────────
      // results — 운세 결과 테이블
      // ──────────────────────────────────────
      // 특정 사주 프로필 + 특정 날짜의 운세 결과를 저장합니다.
      // 같은 프로필이라도 날짜가 다르면 다른 결과가 생성됩니다.
      results: {
        Row: {
          id: string;                  // 결과 고유 ID
          profile_id: string;          // 어떤 사주 프로필의 결과인지 (saju_profiles.id)
          result_date: string;         // 결과 날짜 (예: '2024-04-04')
          daily_summary: string | null;   // 한 줄 총평 (예: "정리하고 좁히는 날")
          daily_keywords: string[] | null; // 키워드 배열 (예: ['정리', '집중'])
          love_reading: Record<string, unknown> | null;  // 연애 해석 (JSON)
          work_reading: Record<string, unknown> | null;  // 일/직장 해석 (JSON)
          money_reading: Record<string, unknown> | null; // 재물 해석 (JSON)
          do_today: string | null;        // 오늘 하면 좋은 것
          avoid_today: string | null;     // 오늘 피하면 좋은 것
          lucky_hints: string[] | null;   // 행운 단서 배열
          background: string | null;      // 사주 근거 설명
          is_saved: boolean;              // 사용자가 결과를 저장했는지 여부
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;          // 필수: 어떤 프로필의 결과인지
          result_date?: string;
          daily_summary?: string | null;
          daily_keywords?: string[] | null;
          love_reading?: Record<string, unknown> | null;
          work_reading?: Record<string, unknown> | null;
          money_reading?: Record<string, unknown> | null;
          do_today?: string | null;
          avoid_today?: string | null;
          lucky_hints?: string[] | null;
          background?: string | null;
          is_saved?: boolean;
        };
        Update: Partial<Database['public']['Tables']['results']['Insert']>;
      };

      // ──────────────────────────────────────
      // questions — AI 추가질문 테이블
      // ──────────────────────────────────────
      // 사용자가 운세 결과를 보고 추가로 한 질문과 AI 답변을 저장합니다.
      // 무료 2회 → 이후 유료 결제 필요
      questions: {
        Row: {
          id: string;                  // 질문 고유 ID
          result_id: string;           // 어떤 운세 결과에 대한 질문인지 (results.id)
          question_text: string;       // 사용자가 입력한 질문 텍스트
          answer_text: string;         // AI가 생성한 답변 텍스트
          question_order: number;      // 질문 순서 (1번째, 2번째, ...)
          is_paid: boolean;            // 유료 질문 여부 (무료 2회 소진 후 true)
          created_at: string;
        };
        Insert: {
          id?: string;
          result_id: string;           // 필수
          question_text: string;       // 필수
          answer_text: string;         // 필수
          question_order?: number;
          is_paid?: boolean;
        };
        Update: Partial<Database['public']['Tables']['questions']['Insert']>;
      };

      // ──────────────────────────────────────
      // payments — 결제 내역 테이블
      // ──────────────────────────────────────
      // 토스페이먼츠를 통한 결제 내역을 관리합니다.
      // 심층 리포트(5,900원) 또는 추가 질문팩 구매 시 생성됩니다.
      payments: {
        Row: {
          id: string;                  // 결제 고유 ID
          user_id: string | null;      // 회원 ID (비회원이면 null)
          session_id: string | null;   // 비회원 세션 ID
          product_type: 'report' | 'question_pack'; // 상품 종류
          amount: number;              // 결제 금액 (원)
          status: 'pending' | 'success' | 'failed' | 'refunded'; // 결제 상태
          pg_payment_key: string | null; // PG사(토스)가 발급한 결제 키
          pg_order_id: string | null;    // PG사 주문 ID
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          session_id?: string | null;
          product_type: 'report' | 'question_pack'; // 필수
          amount: number;              // 필수
          status?: 'pending' | 'success' | 'failed' | 'refunded';
          pg_payment_key?: string | null;
          pg_order_id?: string | null;
        };
        Update: Partial<Database['public']['Tables']['payments']['Insert']>;
      };

      // ──────────────────────────────────────
      // reports — 심층 리포트 테이블
      // ──────────────────────────────────────
      // 유료 결제 후 생성되는 상세 리포트를 저장합니다.
      // 결제 후 1년간 열람 가능 (expires_at)
      reports: {
        Row: {
          id: string;                  // 리포트 고유 ID
          result_id: string;           // 어떤 운세 결과에 대한 리포트인지 (results.id)
          payment_id: string | null;   // 결제 내역 (payments.id)
          content: Record<string, unknown>; // 리포트 전체 내용 (JSON, Claude가 생성)
          is_read: boolean;            // 사용자가 열람했는지 여부
          created_at: string;
          expires_at: string;          // 만료일 (결제 후 1년)
        };
        Insert: {
          id?: string;
          result_id: string;           // 필수
          payment_id?: string | null;
          content: Record<string, unknown>; // 필수
          is_read?: boolean;
          expires_at?: string;
        };
        Update: Partial<Database['public']['Tables']['reports']['Insert']>;
      };
    };
  };
}
