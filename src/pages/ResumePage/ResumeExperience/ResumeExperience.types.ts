import type { DocBase } from '../../../lib/firebase'

/** Firestore `experiences` 문서. 재직 중이면 `endDate`가 null이다. */
export interface ExperienceDoc extends DocBase {
  company: string
  location: string
  department: string
  role: string
  employmentType: string
  startDate: string
  endDate: string | null
  description: string[]
}

export interface ResumeExperienceProps {
  doc: ExperienceDoc
}
