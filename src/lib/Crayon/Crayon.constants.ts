import type { CrayonStrokeParams } from './Crayon.types'

/** 획을 따라 왁스를 찍는 간격(px). 촘촘할수록 알갱이가 빽빽해진다. */
export const GRAIN_STEP = 0.7

/** 왁스 알갱이 한 점의 크기(px). */
export const GRAIN_SIZE = 1.4

/**
 * 필압·끊김 무늬가 한 주기를 도는 길이 — 획 굵기의 몇 배인지.
 * 획 전체 길이가 아니라 따라간 거리를 기준으로 삼아야, 획이 길어져도 이미 그린 앞부분이 변하지 않는다.
 */
export const PATTERN_PERIOD = 7

/** 크레파스 텍스처 한 변의 기본 픽셀 수. 화면에 뜨는 크기보다 넉넉히 잡아 알갱이가 뭉개지지 않게 한다. */
export const CRAYON_TEXTURE_PIXELS = 512

/** plane이 그림보다 넓은 기본 배율. 획이 가장자리에서 잘리지 않도록 여백을 준다. */
export const CRAYON_TEXTURE_MARGIN = 1.35

/** 크레파스 획 기본값. */
export const DEFAULT_CRAYON_PARAMS: CrayonStrokeParams = {
  width: 12,
  color: '#7cc4e8',
  opacity: 0.85,
  roughness: 0.55,
  patchiness: 0.35,
  wobble: 1.6,
  seed: 7,
}
