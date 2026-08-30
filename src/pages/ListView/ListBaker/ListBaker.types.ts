import type { GalleryProject } from '../../../stations/sections/projects/ProjectsGallery/GalleryNameplates'
import type { ListScreen, ListShot } from '../ListView.types'

export interface ListBakerProps {
  /** 전시 칸을 만드는 그 목록. 프로젝트 화면 수가 여기서 나온다. */
  projects: readonly GalleryProject[]
  /** 몇 장까지 구웠는지. 가림막이 진행을 보여준다. */
  onProgress: (done: number) => void
  onDone: (shots: ListShot[]) => void
}

export interface ListBakerContentProps {
  screens: readonly ListScreen[]
  onReady: () => void
}

export interface SkillsScreenProps {
  /** 그릴 쪽(0부터). */
  page: number
}

export interface ListProjectScreenProps {
  project: GalleryProject
  page: number
}

export interface ListBakerCaptureProps {
  screens: readonly ListScreen[]
  /** 다 그려졌는지. 그 전에 찍으면 빈 화면이 나온다. */
  ready: boolean
  onProgress: (done: number) => void
  onDone: (shots: ListShot[]) => void
}
