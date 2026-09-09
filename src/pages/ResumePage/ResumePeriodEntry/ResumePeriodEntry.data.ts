import type { ResumePeriod } from './ResumePeriodEntry.types'

/** 끝나지 않은 기간의 종료 자리에 대신 쓰는 말. */
const ONGOING = '현재'

/** "YYYY-MM" → "YYYY.MM". */
const formatMonth = (value: string) => value.replace('-', '.')

/**
 * 기간 칸에 세로로 쌓을 줄들.
 *
 * 시작과 종료가 있으면 두 줄이고, 종료 줄은 물결을 앞에 붙여 이어지는 값임을 보인다.
 * 시점이 하나뿐이면 한 줄이다.
 */
export function toPeriodLines(period: ResumePeriod): string[] {
  if ('date' in period) return [formatMonth(period.date)]
  const end = period.end ? formatMonth(period.end) : ONGOING
  return [formatMonth(period.start), `~ ${end}`]
}
