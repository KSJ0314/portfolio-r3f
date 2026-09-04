import type { ProjectContent } from '../../../content/projects'
import type { DocBase } from '../../../lib/firebase'

/** Firestore `projects` 문서. 이력서는 순서와 내용을 찾는 데만 쓴다. */
export interface ProjectDoc extends DocBase {
  order: number
  key: number
}

/** 그릴 프로젝트 하나 — 번호와 그 번호의 글. */
export interface ResumeProjectItem {
  projectKey: number
  content: ProjectContent
}

export type ResumeProjectProps = ResumeProjectItem
