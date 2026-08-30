import { CRAYON_TEXTURE_MARGIN, CRAYON_TEXTURE_PIXELS } from './Crayon.constants'
import { drawCrayonDrawing } from './Crayon.draw'
import type { CrayonDrawing, CrayonEdgeParams, CrayonSharedParams } from './Crayon.types'

/** 획 굵기 대비 손떨림 폭의 기본 비율. 굵을수록 더 흔들리게. */
const WOBBLE_RATIO = 0.18

/** 텍스처를 굽는 데 필요한 값. 컴포넌트와 미리 굽기가 같은 것을 받아야 캐시에 적중한다. */
export interface CrayonBakeOptions {
  /** 그릴 크레파스 그림(0~1 정규화 획들). */
  drawing: CrayonDrawing
  /** plane 가로의 월드 크기(margin 적용 전). */
  size: number
  /** plane 세로의 월드 크기(margin 적용 전). 없으면 정사각(= size). */
  height?: number
  /** 획 굵기(월드 단위). 내부에서 텍스처 픽셀로 환산된다. */
  strokeWidth: number
  color: string
  roughness?: number
  opacity?: number
  patchiness?: number
  /** 획 굵기 대비 손떨림 폭의 비율. 크기를 바꿔도 손맛이 유지되도록 비율로 받는다. */
  wobbleRatio?: number
  /**
   * 바깥 윤곽 마무리 — 그림 가장자리로 갈수록 알갱이를 덜 찍어 테두리가 자연스럽게 끝난다.
   * 획을 겹쳐 면을 채운 그림에 준다. 주지 않으면 걸지 않는다.
   */
  edge?: Partial<CrayonEdgeParams>
  /** plane이 그림보다 넓은 배율(획 잘림 방지). */
  margin?: number
  /** 텍스처 해상도(px). */
  pixels?: number
}

/** 굽는 데 넘길 값과 그림이 붙을 판 크기. */
export interface CrayonBakeResult {
  drawing: CrayonDrawing
  params: CrayonSharedParams
  texWidth: number
  texHeight: number
  planeW: number
  planeH: number
}

/**
 * 월드 크기·굵기를 텍스처 픽셀로 환산한다.
 *
 * 컴포넌트와 미리 굽기가 **같은 계산**을 거쳐야 캐시 키가 맞아 다시 굽지 않으므로 함수로 둔다.
 */
export function resolveCrayonBake({
  drawing,
  size,
  height = size,
  strokeWidth,
  color,
  roughness,
  opacity,
  patchiness,
  wobbleRatio = WOBBLE_RATIO,
  edge,
  margin = CRAYON_TEXTURE_MARGIN,
  pixels = CRAYON_TEXTURE_PIXELS,
}: CrayonBakeOptions): CrayonBakeResult {
  const planeW = size * margin
  const planeH = height * margin
  // 텍스처는 plane 비율에 맞춘 직사각으로 굽는다. 짧은 변을 기준 해상도(pixels)로 둔다.
  const shorter = Math.min(planeW, planeH)
  const texWidth = Math.round((planeW / shorter) * pixels)
  const texHeight = Math.round((planeH / shorter) * pixels)
  // 월드 굵기를 텍스처 픽셀로 환산한다. 짧은 변 기준이라 가로·세로 어느 획이든 둥글게 유지된다.
  const strokePixels = (strokeWidth / shorter) * pixels

  return {
    drawing,
    params: {
      color,
      width: strokePixels,
      wobble: strokePixels * wobbleRatio,
      roughness,
      opacity,
      patchiness,
      edge,
    },
    texWidth,
    texHeight,
    planeW,
    planeH,
  }
}

/**
 * 그림을 캔버스에 구워 돌려준다 — 그 결과를 PNG로 내보내는 데 쓴다.
 *
 * 굽는 일이 무거워 기기를 타는 그림은 파일로 두고 앱에서는 그것을 붙인다(모눈종이와 같은 흐름).
 * 개발용 HUD가 값을 맞춘 뒤 이 함수로 구워 내려받고, 그 파일을 `public/`에 넣는다.
 */
export function bakeCrayonCanvas(options: CrayonBakeOptions): HTMLCanvasElement {
  const { drawing, params, texWidth, texHeight } = resolveCrayonBake(options)
  const canvas = document.createElement('canvas')
  canvas.width = texWidth
  canvas.height = texHeight
  const ctx = canvas.getContext('2d')
  if (ctx) drawCrayonDrawing(ctx, texWidth, texHeight, drawing, params)
  return canvas
}
