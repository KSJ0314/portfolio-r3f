import type { ReactNode } from 'react'

/**
 * 페이지를 나누는 단위. 머리와 영역 하나가 각각 블록 하나다.
 * `tight`는 앞 블록과 같은 영역에서 이어지는 항목이라 좁게 붙는다는 뜻이다.
 */
export interface ResumeBlock {
  key: string
  tight?: boolean
  /** 앞 장에 자리가 남아도 새 장에서 시작할지. 프로젝트처럼 장을 나눠 읽는 항목이 쓴다. */
  breakBefore?: boolean
  node: ReactNode
}

export interface ResumeSheetsProps {
  blocks: ResumeBlock[]
}
