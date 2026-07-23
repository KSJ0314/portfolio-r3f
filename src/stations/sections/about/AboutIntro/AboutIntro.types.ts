import type { DocBase } from '../../../../lib/firebase'

/** Intro가 쓰는 profile 필드. 나머지 필드(name·email 등)는 이 페이지에 싣지 않는다. */
export interface ProfileDoc extends DocBase {
  tagline?: string
  intro?: string
}

/** troika가 글자 배치를 끝내고 넘겨주는 정보 중 쓰는 것 — 글 덩어리의 경계 `[minX, minY, maxX, maxY]`. */
export interface TroikaTextMesh {
  textRenderInfo?: { blockBounds?: ArrayLike<number> }
}

/** 나가기 화살표 컴포넌트 props. */
export interface ExitArrowProps {
  x: number
  y: number
  size: number
  color: string
  stroke: number
  roughness: number
  opacity: number
}

/** 크레파스 화살표를 굽는 파라미터. useLoader의 캐시 키로 쓰려고 JSON으로 직렬화한다. */
export interface ArrowTextureParams {
  color: string
  strokePixels: number
  roughness: number
  opacity: number
}
