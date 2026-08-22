import { create } from 'zustand'
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

interface GalleryPageState {
  camera: GalleryCameraPlacement
  setCamera: (camera: GalleryCameraPlacement) => void
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
  showColliders: false,
  setShowColliders: (showColliders) => set({ showColliders }),
}))
