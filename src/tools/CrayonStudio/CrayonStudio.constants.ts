import { DEFAULT_CRAYON_PARAMS } from '../../lib/Crayon'
import type { CrayonStudioParams } from './CrayonStudio.types'

/** 그리는 캔버스의 해상도. 실제로 구워지는 텍스처와 같은 크기라야 보이는 대로 나온다. */
export const STUDIO_PIXELS = 512

/**
 * 그림판 한 변이 월드에서 차지하는 크기.
 * 1로 고정해 그린 크기가 그대로 월드 크기가 되게 한다 — 슬라이더의 굵기가 곧 `strokeWidth`다.
 * 쓰는 쪽에서 더 크게 놓고 싶으면 `size`와 `strokeWidth`를 같은 배로 올린다.
 */
export const BOARD_WORLD_SIZE = 1

/** 바닥에 깔리는 모눈종이 한 칸이 화면에서 차지하는 크기(px). 눈에 익은 밀도로 잡은 값이다. */
export const PAPER_TILE_PX = 320

/** 시작 값. 색·질감은 나가기 화살표(하늘색 크레파스)를 기준으로 잡았다. */
export const DEFAULT_STUDIO_PARAMS: CrayonStudioParams = {
  color: '#55bcf0',
  widthRatio: 0.03,
  wobbleRatio: 0.18,
  opacity: 0.7,
  roughness: 0.55,
  patchiness: DEFAULT_CRAYON_PARAMS.patchiness,
}
