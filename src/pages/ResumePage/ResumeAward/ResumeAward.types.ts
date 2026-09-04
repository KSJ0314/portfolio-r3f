import type { DocBase } from '../../../lib/firebase'

/** Firestore `awards` 문서. 기간이 아니라 받은 시점 하나를 갖는다. */
export interface AwardDoc extends DocBase {
  title: string
  organization: string
  description: string[]
  date: string
}

export interface ResumeAwardProps {
  doc: AwardDoc
}
