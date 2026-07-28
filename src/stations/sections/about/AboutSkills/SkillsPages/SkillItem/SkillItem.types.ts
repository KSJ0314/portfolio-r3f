import type { SkillsLevelPlacement } from '../../../../../../state/useSkillsPageStore'
import type { SkillDoc } from '../SkillsPages.types'

export interface SkillItemProps {
  skill: SkillDoc
  /** 항목이 놓일 자리(눕힌 그룹 안의 화면 좌표). 왼쪽 위 모서리 기준이다. */
  x: number
  y: number
  /** 설명이 접히는 폭. */
  width: number
  /** 이름 글자 크기. */
  nameSize: number
  /** 이름과 설명 사이 간격. */
  nameGap: number
  /** 설명 글자 크기. */
  bodySize: number
  /** 설명 줄 간격(글자 크기 배수). */
  bodyLineHeight: number
  /** 이름 오른쪽 레벨 별의 배치. */
  level: SkillsLevelPlacement
  /** 배치가 끝나 실제 높이를 알게 되면 알린다. 부모가 다음 항목을 그만큼 내려 놓는다. */
  onHeight: (id: string, height: number) => void
}
