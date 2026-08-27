import { create } from 'zustand'
import { INTRO_PAGE_LAYOUT } from '../stations/sections/projects/contents/shared/IntroPage'
import { GALLERY_PAGER } from '../stations/sections/projects/ProjectsGallery/GalleryPages/GalleryPager'
import {
  GALLERY_CAMERA_ANCHOR,
  GALLERY_CAMERA_FOV,
  GALLERY_CAMERA_OFFSET,
  GALLERY_CAMERA_SHIFT,
} from '../stations/sections/projects/ProjectsGallery/ProjectsGallery.constants'

/** 전시 공간 카메라 — 바라보는 점과 그것과의 고정 오프셋. */
export interface GalleryCameraPlacement {
  /** 바라보는 점의 높이. 바닥이 평평해 캐릭터를 따라 오르내리지 않는다. */
  anchorY: number
  /** 바라보는 점의 깊이. 벽(z 0)과 열린 면 사이 어디를 볼지 정한다. */
  anchorZ: number
  /** 팔로우 오프셋(카메라 − 바라보는 점). 길이가 곧 크기다. */
  x: number
  y: number
  z: number
  /** 세로 화각(도). */
  fov: number
  /** 바라보는 점을 화면 한가운데에서 비켜 놓는 정도(화면 반크기 대비, -1~1). */
  shiftX: number
  shiftY: number
}

/** 확대한 칸의 페이지 넘김 UI 배치(가로 1 기준 정규화). */
export interface GalleryPagerPlacement {
  /** 점 반지름. */
  dotRadius: number
  /** 점 사이 간격(중심에서 중심). */
  dotGap: number
  /** 점을 아래 끝에서 올리는 거리. */
  dotBottom: number
  /** 꺾쇠 한 변. */
  arrowSize: number
  /** 꺾쇠를 좌우 끝에서 들이는 거리. */
  arrowInset: number
}

/** 프로젝트 첫 장의 크기·간격(가로 1 기준 정규화). 자리는 값이 아니라 잰 글에서 나온다. */
export type IntroPagePlacement = typeof INTRO_PAGE_LAYOUT

interface GalleryPageState {
  camera: GalleryCameraPlacement
  setCamera: (camera: GalleryCameraPlacement) => void
  pager: GalleryPagerPlacement
  setPager: (pager: GalleryPagerPlacement) => void
  introPage: IntroPagePlacement
  setIntroPage: (introPage: IntroPagePlacement) => void
  /** 판정에 쓰는 콜라이더를 화면에 그릴지. 눈으로 맞춰 보기 위한 것이라 기본은 꺼짐이다. */
  showColliders: boolean
  setShowColliders: (show: boolean) => void
}

/**
 * 전시 공간의 개발용 튜닝 상태.
 * 프로덕션에서는 HUD가 렌더되지 않아 항상 기본값이다.
 * 여기서 맞춘 값을 `ProjectsGallery.constants.ts`의 기본값에 반영하면 확정된다.
 */
export const useGalleryPageStore = create<GalleryPageState>((set) => ({
  camera: {
    anchorY: GALLERY_CAMERA_ANCHOR.y,
    anchorZ: GALLERY_CAMERA_ANCHOR.z,
    x: GALLERY_CAMERA_OFFSET[0],
    y: GALLERY_CAMERA_OFFSET[1],
    z: GALLERY_CAMERA_OFFSET[2],
    fov: GALLERY_CAMERA_FOV,
    shiftX: GALLERY_CAMERA_SHIFT.x,
    shiftY: GALLERY_CAMERA_SHIFT.y,
  },
  setCamera: (camera) => set({ camera }),
  pager: { ...GALLERY_PAGER },
  setPager: (pager) => set({ pager }),
  introPage: { ...INTRO_PAGE_LAYOUT },
  setIntroPage: (introPage) => set({ introPage }),
  showColliders: false,
  setShowColliders: (showColliders) => set({ showColliders }),
}))
