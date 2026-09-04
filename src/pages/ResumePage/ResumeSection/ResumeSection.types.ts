import type { ReactNode } from 'react'

export interface ResumeSectionProps {
  /** 영역 제목. 주지 않으면 본문만 그린다(앞 블록에서 이어지는 항목). */
  title?: string
  children: ReactNode
}
