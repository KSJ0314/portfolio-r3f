import type { GalleryProject } from '../GalleryNameplates'

/** 칸 순서대로의 프로젝트. 확대한 칸의 것만 쓴다. */
export interface GalleryPagesProps {
  projects: readonly GalleryProject[]
}
