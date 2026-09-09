import type { ProjectContent } from '../../../../../../content/projects'

/** 첫 장이 받는 것. 프로젝트마다 이 내용만 다르고 배치는 같다. */
export interface IntroPageProps {
  /** 페이지 세로(가로 1 기준). 판에서 받은 값을 그대로 넘긴다. */
  height: number
  /** 그 프로젝트의 글과 링크. */
  content: ProjectContent
}
