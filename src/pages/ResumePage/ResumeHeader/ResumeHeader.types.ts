import type { DocBase } from '../../../lib/firebase'

/** 이력서 머리가 쓰는 profile 필드. 포트폴리오 Intro와 쓰는 것이 달라 타입을 나눠 둔다. */
export interface ResumeProfileDoc extends DocBase {
  name?: string
  tagline?: string
  intro?: string
  email?: string
  phone?: string
  links?: { label: string; url: string }[]
}

export interface ResumeHeaderProps {
  profile: ResumeProfileDoc | null
}
