import { ResumePeriodEntry } from '../ResumePeriodEntry'
import { withLineBreaks } from './ResumeExperience.data'
import { Company, Meta, Task, Tasks, Title } from './ResumeExperience.styled'
import type { ResumeExperienceProps } from './ResumeExperience.types'

/**
 * 이력서의 경력 항목 하나. 기간/내용 틀의 오른쪽 칸을 경력 내용으로 채운다.
 *
 * 회사명 오른쪽에 곁글씨를 붙이고 그 아래에 업무 내용을 쌓는다.
 * 곁글씨는 값이 비면 그 자리를 건너뛰어 구분자만 남지 않게 한다.
 */
export function ResumeExperience({ doc }: ResumeExperienceProps) {
  const meta = [doc.department, doc.employmentType, doc.role].filter((value) => value).join(' · ')

  return (
    <ResumePeriodEntry period={{ start: doc.startDate, end: doc.endDate }}>
      <Title>
        <Company>{doc.company}</Company>
        {meta && <Meta>{meta}</Meta>}
      </Title>
      {doc.description.length > 0 && (
        <Tasks>
          {doc.description.map((line, index) => (
            <Task key={index}>{withLineBreaks(line)}</Task>
          ))}
        </Tasks>
      )}
    </ResumePeriodEntry>
  )
}
