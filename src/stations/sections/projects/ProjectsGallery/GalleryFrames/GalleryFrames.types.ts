/** 전시 칸 하나를 누르는 사각형(월드). 액자와 그 아래 이름판을 함께 감싼다. */
export interface GalleryFrameRect {
  x: number
  y: number
  /** 판을 세울 깊이. 액자·이름판 중 더 앞에 있는 면이다. */
  z: number
  width: number
  height: number
}
