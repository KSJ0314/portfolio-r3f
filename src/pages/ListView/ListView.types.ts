import type { GalleryProject } from '../../stations/sections/projects/ProjectsGallery/GalleryNameplates'

/** 한 장에 담을 내용. 무엇을 그릴지는 굽는 씬이, 어디를 찍을지는 카메라가 본다. */
export type ListScreenKind =
  | { type: 'intro' }
  | { type: 'skills'; page: number }
  | { type: 'career' }
  | { type: 'project'; project: GalleryProject; page: number }

/** 한 장 — 무엇을 어디에 세우고 어디서 어떤 배율로 찍는지. */
export interface ListScreen {
  id: string
  kind: ListScreenKind
  /** 내용을 밀어 두는 거리(월드 x). 한 줄로 늘어놓아 옆 화면이 끼어들지 않게 한다. */
  offsetX: number
  /** 카메라가 설 자리(월드 x, z). */
  x: number
  z: number
  /** 직교 배율. 영역이 화면에 최대로 들어가는 값이다. */
  zoom: number
}

/** 그림 위에 얹는 링크 한 자리. 값은 그림 크기 대비 백분율이라 이미지를 줄여도 따라온다. */
export interface ListShotLink {
  url: string
  left: number
  top: number
  width: number
  height: number
}

/** 구운 한 장. `url`은 blob 주소라 페이지를 떠날 때 되돌린다. */
export interface ListShot {
  id: string
  url: string
  /** 이 장에 있는 링크. 그림에는 그림만 남으므로 누를 자리를 따로 들고 있는다. */
  links: ListShotLink[]
}
