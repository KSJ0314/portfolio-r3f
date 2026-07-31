import type { DocBase } from '../../../../lib/firebase'

/** Intro가 쓰는 profile 필드. 나머지 필드(name·email 등)는 이 페이지에 싣지 않는다. */
export interface ProfileDoc extends DocBase {
  tagline?: string
  intro?: string
}
