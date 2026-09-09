import { PROJECT_CONTENTS } from '../../../content/projects'
import type { ProjectDoc, ResumeProjectItem } from './ResumeProject.types'

/** 문서를 `order`순으로 세우고 각 `key`의 글을 찾는다. 순서는 Firestore가 정하고 글은 코드가 갖는다. */
export function toProjectItems(docs: ProjectDoc[]): ResumeProjectItem[] {
  return [...docs]
    .sort((a, b) => a.order - b.order)
    .map((doc) => ({ projectKey: doc.key, content: PROJECT_CONTENTS[doc.key] }))
}
