import { ResumePeriodEntry } from '../ResumePeriodEntry'
import { Organization, Spec, Title } from './ResumeSpec.styled'
import type { ResumeSpecProps } from './ResumeSpec.types'

/**
 * 이력서의 자격증 항목 하나. 기간/내용 틀의 오른쪽 칸을 자격증 이름과 발급 기관으로 채운다.
 *
 * 취득한 시점 하나뿐이라 왼쪽 칸은 한 줄이고, 담을 설명이 없어 제목 줄로 끝난다.
 */
export function ResumeSpec({ doc }: ResumeSpecProps) {
  return (
    <ResumePeriodEntry period={{ date: doc.date }}>
      <Title>
        <Spec>{doc.name}</Spec>
        <Organization>{doc.organization}</Organization>
      </Title>
    </ResumePeriodEntry>
  )
}
