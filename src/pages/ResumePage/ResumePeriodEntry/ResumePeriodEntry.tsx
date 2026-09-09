import { toPeriodLines } from './ResumePeriodEntry.data'
import { Body, Item, Period } from './ResumePeriodEntry.styled'
import type { ResumePeriodEntryProps } from './ResumePeriodEntry.types'

/**
 * 기간과 내용을 두 칸으로 두는 항목 틀.
 *
 * 왼쪽 칸에 기간을 찍고 오른쪽 칸은 그대로 내준다 — 무엇을 그릴지는 영역마다 다르므로
 * 이 틀은 칸의 폭과 기간 표기만 갖는다. 경력·교육·수상·자격증이 함께 쓴다.
 */
export function ResumePeriodEntry({ period, children }: ResumePeriodEntryProps) {
  return (
    <Item>
      <Period>
        {toPeriodLines(period).map((line) => (
          <span key={line}>{line}</span>
        ))}
      </Period>
      <Body>{children}</Body>
    </Item>
  )
}
