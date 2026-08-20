import type { DocBase } from '../../../../../lib/firebase/firestore'

/** 오른쪽 페이지에 적는 프로젝트. Firestore `projects`에서 필요한 것만 본다. */
export interface LobbyProject extends DocBase {
  title: string
  summary: string
  order: number
}

/** 캔버스와 그것으로 만든 텍스처. 다시 그린 뒤 `texture.needsUpdate`를 켜면 화면에 반영된다. */
export interface LobbyBookPage {
  canvas: HTMLCanvasElement
  texture: import('three').CanvasTexture
}

/** 글을 쓸 수 있는 영역 — 텍스처 네 변에서 들이는 여백(UV 비율 0~1). */
export interface LobbyPageMargin {
  left: number
  right: number
  top: number
  bottom: number
}
