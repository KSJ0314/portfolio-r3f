import type { CareerPaperPlacement } from '../../../../../state/useCareerPageStore'
import type { CareerLogoTarget } from '../AboutCareer.types'

export interface CareerPaperProps {
  /** 그림 경로. */
  url: string
  /** 로고가 될 때 들어갈 칸 번호. 잰 가로를 이 번호로 올린다. */
  column: number
  /** 놓이는 높이 — 바닥에서 살짝 띄우는 값이다. */
  y: number
  /** 겹칠 때의 앞뒤 순서. 큰 쪽이 위다. */
  order: number
  /** 배치·테두리 값. */
  placement: CareerPaperPlacement
  /** 로고가 될 때의 자리·크기. */
  logo: CareerLogoTarget
}
