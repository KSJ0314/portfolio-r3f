import type { DocBase } from '../../../lib/firebase'

/** Firestore `education` 문서. 수강 중이면 `endDate`가 null이다. */
export interface EducationDoc extends DocBase {
  institution: string
  program: string
  startDate: string
  endDate: string | null
  description: string[]
}

export interface ResumeEducationProps {
  doc: EducationDoc
}
