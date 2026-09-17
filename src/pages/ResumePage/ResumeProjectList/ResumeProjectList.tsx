import { Fragment } from 'react'
import { ResumeDivider } from '../ResumeDivider'
import { ResumePeriodEntry } from '../ResumePeriodEntry'
import { PROJECT_LIST_ENTRIES } from './ResumeProjectList.constants'
import { Detail, Details, Name, Team, Title } from './ResumeProjectList.styled'
import type { ResumeProjectListProps } from './ResumeProjectList.types'

/**
 * 프로젝트 영역 머리에 두는 전체 목록. 교육 항목과 같은 기간/내용 두 칸 틀이다.
 *
 * 프로젝트명을 누르면 그 프로젝트가 시작하는 장으로 옮겨 간다. 항목이 저마다 새 장에서
 * 시작하므로 처음부터 넘겨 찾지 않도록 여기서 짚어 간다.
 * 인쇄에도 그대로 나가 종이에서는 목차로 읽힌다.
 */
export function ResumeProjectList({ items, anchorOf }: ResumeProjectListProps) {
  return (
    <>
      {items.map(({ projectKey, content }, index) => {
        const entry = PROJECT_LIST_ENTRIES[projectKey]
        if (!entry) return null

        return (
          // 항목이 여럿이면 사이에 선을 그어 경계를 보인다. 다른 영역과 같은 규칙이다.
          <Fragment key={projectKey}>
            {index > 0 && <ResumeDivider />}
            <ResumePeriodEntry period={{ start: entry.start, end: entry.end }}>
              <Title>
                <Name
                  type="button"
                  onClick={() =>
                    document
                      .getElementById(anchorOf(projectKey))
                      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }
                >
                  {content.title}
                </Name>
                <Team>{entry.team}</Team>
              </Title>
              <Details>
                <Detail>{entry.summary}</Detail>
              </Details>
            </ResumePeriodEntry>
          </Fragment>
        )
      })}
    </>
  )
}
