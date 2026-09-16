import type { ResumeProjectItem } from '../ResumeProject'

export interface ResumeProjectListProps {
  items: ResumeProjectItem[]
  /** 프로젝트 번호로 옮겨 갈 자리의 id를 만든다. 자리를 붙이는 쪽과 같은 규칙을 써야 한다. */
  anchorOf: (projectKey: number) => string
}
