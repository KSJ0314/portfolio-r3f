import { ResumePeriodEntry } from '../ResumePeriodEntry'
import { withLineBreaks } from './ResumeEducation.data'
import { Detail, Details, Institution, Program, Title } from './ResumeEducation.styled'
import type { ResumeEducationProps } from './ResumeEducation.types'

/**
 * 이력서의 교육 항목 하나. 기간/내용 틀의 오른쪽 칸을 교육 내용으로 채운다.
 *
 * 과정명 오른쪽에 기관명을 붙이고 그 아래에 교육 내용을 쌓는다.
 */
export function ResumeEducation({ doc }: ResumeEducationProps) {
  return (
    <ResumePeriodEntry period={{ start: doc.startDate, end: doc.endDate }}>
      <Title>
        <Program>{doc.program}</Program>
        <Institution>{doc.institution}</Institution>
      </Title>
      <Details>
        {doc.description.map((line, index) => (
          <Detail key={index}>{withLineBreaks(line)}</Detail>
        ))}
      </Details>
    </ResumePeriodEntry>
  )
}
