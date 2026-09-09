import { Item, Label, Names } from './ResumeSkill.styled'
import type { ResumeSkillProps } from './ResumeSkill.types'

/**
 * 이력서의 기술 한 줄 — 왼쪽에 분류, 오른쪽에 그 분류의 기술 이름들.
 *
 * 기간이 없어 기간/내용 틀은 쓰지 않되, 왼쪽 칸 폭은 같게 둬 세로줄이 맞는다.
 * 이력서는 한 장짜리 문서라 숙련도와 설명은 싣지 않고 이름만 늘어놓는다.
 */
export function ResumeSkill({ row }: ResumeSkillProps) {
  return (
    <Item>
      <Label>{row.label}</Label>
      <Names>{row.names.join(', ')}</Names>
    </Item>
  )
}
