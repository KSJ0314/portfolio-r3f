import type { GalleryProject } from '../GalleryNameplates'

export interface GalleryJumpProps {
  /** 칸 순서대로의 프로젝트. 문서 id로 칸 번호를 찾는다. */
  projects: readonly GalleryProject[]
}
