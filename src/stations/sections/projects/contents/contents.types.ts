import type { ComponentType } from 'react'
import type { GalleryProject } from '../ProjectsGallery/GalleryNameplates'

/**
 * 페이지 한 장이 받는 것.
 *
 * **자리와 크기는 컨테이너가 잡고, 페이지는 그 안만 채운다.** 좌표는 월드가 아니라
 * **가로 1 기준 정규화**라 가로는 늘 1이고 원점은 판 한가운데다. 글자 크기·여백도 전부
 * 가로 대비 비율로 적는다. 칸 크기나 방 배율이 바뀌어도 구도가 그대로이고,
 * 나중에 2D로 옮길 때도 배율만 갈아 끼우면 된다.
 */
export interface ProjectPageProps {
  /** 이 칸의 프로젝트. Firestore에서 읽은 것 그대로다. */
  project: GalleryProject
  /** 페이지 세로(가로 1 기준). 가로는 1이다. */
  height: number
  /** 몇 번째 장인지(0부터). 페이지가 스스로 번호를 적을 때 쓴다. */
  index: number
  /** 이 프로젝트의 전체 장수. */
  total: number
}

/** 페이지 한 장. 프로젝트마다 이것을 순서대로 늘어놓은 것이 그 프로젝트의 상세다. */
export type ProjectPage = ComponentType<ProjectPageProps>
