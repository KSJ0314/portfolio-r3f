import type { ReactNode } from 'react'

/**
 * 기간 칸에 찍을 값.
 *
 * 경력·교육처럼 시작과 종료가 있으면 `start`와 `end`를 주고(재직·수강 중이면 `end`가 null),
 * 수상·자격증처럼 시점이 하나뿐이면 `date`만 준다.
 */
export type ResumePeriod = { start: string; end: string | null } | { date: string }

export interface ResumePeriodEntryProps {
  period: ResumePeriod
  /** 오른쪽 내용 칸. 무엇을 그릴지는 쓰는 쪽이 정한다. */
  children: ReactNode
}
