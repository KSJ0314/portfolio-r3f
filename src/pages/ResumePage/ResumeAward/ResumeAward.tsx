import { ResumePeriodEntry } from '../ResumePeriodEntry'
import { withLineBreaks } from './ResumeAward.data'
import { Award, Detail, Details, Organization, Title } from './ResumeAward.styled'
import type { ResumeAwardProps } from './ResumeAward.types'

/**
 * 이력서의 수상 항목 하나. 기간/내용 틀의 오른쪽 칸을 수상 내용으로 채운다.
 *
 * 받은 시점 하나뿐이라 왼쪽 칸은 한 줄이다.
 * 수상명 오른쪽에 수여 기관을 붙이고 그 아래에 수상 내용을 쌓는다.
 */
export function ResumeAward({ doc }: ResumeAwardProps) {
  return (
    <ResumePeriodEntry period={{ date: doc.date }}>
      <Title>
        <Award>{doc.title}</Award>
        <Organization>{doc.organization}</Organization>
      </Title>
      <Details>
        {doc.description.map((line, index) => (
          <Detail key={index}>{withLineBreaks(line)}</Detail>
        ))}
      </Details>
    </ResumePeriodEntry>
  )
}
