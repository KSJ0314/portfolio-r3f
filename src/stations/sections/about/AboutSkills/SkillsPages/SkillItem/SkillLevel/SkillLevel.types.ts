import type { SkillsLevelPlacement } from '../../../../../../../state/useSkillsPageStore'

export interface SkillLevelProps {
  /** 그릴 별 개수(숙련도). */
  count: number
  /** 첫 별이 시작하는 자리(눕힌 그룹 안의 화면 좌표). 별은 세로 가운데가 이 높이에 온다. */
  x: number
  y: number
  /** 별의 크기·간격과 스티커 모양. */
  level: SkillsLevelPlacement
}
