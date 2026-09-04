import type { DocBase } from '../../../lib/firebase'

/** Firestore `spec` 문서. 기간이 아니라 취득한 시점 하나를 갖는다. */
export interface SpecDoc extends DocBase {
  name: string
  organization: string
  date: string
}

export interface ResumeSpecProps {
  doc: SpecDoc
}
