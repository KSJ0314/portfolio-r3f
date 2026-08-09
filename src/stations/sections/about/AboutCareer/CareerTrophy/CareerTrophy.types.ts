import type { CareerLogoTarget } from '../AboutCareer.types'

export interface CareerTrophyProps {
  /** 로고가 될 때 들어갈 칸 번호. 잰 가로를 이 번호로 올린다. */
  column: number
  /** 로고가 될 때의 자리·크기. */
  logo: CareerLogoTarget
}
