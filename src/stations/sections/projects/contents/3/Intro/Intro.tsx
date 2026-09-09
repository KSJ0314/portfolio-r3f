import { PROJECT_CONTENTS } from '../../../../../../content/projects'
import type { ProjectPageProps } from '../../contents.types'
import { IntroPage } from '../../shared/IntroPage'

/** 첫 장. 배치는 공용 컴포넌트가 담당하고 여기서는 이 프로젝트의 내용만 넘긴다. */
export function Intro({ height }: ProjectPageProps) {
  return <IntroPage height={height} content={PROJECT_CONTENTS[3]} />
}
