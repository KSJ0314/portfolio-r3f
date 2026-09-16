/**
 * 오른쪽 페이지에 적는 프로젝트 한 항목.
 *
 * `key`는 전시 칸을 가리키는 번호(0부터)다. 이름은 바뀔 수 있어 가리키는 값으로 쓰지 않는다.
 */
export interface LobbyProject {
  key: number
  title: string
  summary: string
}

/**
 * 페이지에서 한 항목이 차지한 세로 구간 — 텍스처 위아래 비율(0~1).
 *
 * 그리는 쪽만 정확한 자리를 알므로 그릴 때 함께 모은다. 누를 자리를 재는 데 쓴다.
 */
export interface LobbyBookSpot {
  key: number
  top: number
  bottom: number
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
