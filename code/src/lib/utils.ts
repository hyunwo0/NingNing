// ==========================================
// 공통 유틸리티 함수
// ==========================================
//
// [이 파일이 하는 일]
// 프로젝트 전체에서 공통으로 사용하는 유틸 함수를 정의합니다.
// 현재는 Tailwind CSS 클래스 병합 유틸 하나만 있습니다.

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Tailwind CSS 클래스를 안전하게 병합하는 유틸 함수
 *
 * [왜 필요한가?]
 * Tailwind에서 조건부로 클래스를 적용할 때, 같은 속성의 클래스가
 * 충돌할 수 있습니다. 예: "bg-red-500" + "bg-blue-500" → 둘 다 배경색
 *
 * cn()은 이런 충돌을 자동으로 해결합니다:
 * - clsx: 조건부 클래스를 하나로 합침
 *   예: clsx('a', false && 'b', 'c') → 'a c'
 * - twMerge: 충돌하는 Tailwind 클래스를 마지막 것으로 통합
 *   예: twMerge('bg-red-500 bg-blue-500') → 'bg-blue-500'
 *
 * 사용 예:
 *   <div className={cn('px-4 py-2', isActive && 'bg-blue-500', className)} />
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
