import type { CrayonStrokeParams } from './crayon.types'

/** 획을 따라 왁스를 찍는 간격(px). 촘촘할수록 알갱이가 빽빽해진다. */
export const GRAIN_STEP = 0.7

/** 왁스 알갱이 한 점의 크기(px). */
export const GRAIN_SIZE = 1.4

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
