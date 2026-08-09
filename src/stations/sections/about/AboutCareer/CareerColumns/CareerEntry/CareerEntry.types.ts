import type { CareerListLayout } from '../../../../../../state/useCareerPageStore'
import type { CareerEntryData } from '../CareerColumns.types'

export interface CareerEntryProps {
  entry: CareerEntryData
  /** 항목이 놓일 자리(눕힌 그룹 안의 화면 좌표). 왼쪽 위 모서리 기준이다. */
  x: number
  y: number
  /** 본문이 접히는 폭이자 오른쪽 값이 붙는 자리. */
  width: number
  /** 글자 크기·간격. */
  layout: CareerListLayout
  /** 접힌 본문의 높이. 부모가 재 놓은 값이라 메타 줄을 그 아래에 놓는 데 쓴다. */
  bodyHeight: number
  /** 본문 배치가 끝나 높이를 알게 되면 알린다. 본문이 없는 항목은 부르지 않는다. */
  onBodyHeight: (id: string, height: number) => void
}
