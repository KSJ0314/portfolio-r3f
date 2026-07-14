import type { GridPaperParams, GridPaperRenderOptions } from './gridPaper.types'

/**
 * 확정된 모눈종이 텍스처 값. `public/textures/paper/grid-paper.png`가 이 값으로 구워져 있다.
 * 개발용 HUD(GridPaperHUD)에서 조절해 값을 정한 뒤 여기에 반영하고, 스크립트로 다시 굽는다.
 */
export const DEFAULT_GRID_PAPER_PARAMS: GridPaperParams = {
  cells: 32,
  paperColor: '#fffefc',
  lineColor: '#e0e0e0',
  lineWidthRatio: 0.06,
  lineSoftness: 1.5,
  wobbleRatio: 0.0575,
  wobbleCyclesPerCell: [0.1, 0.34375, 0.71875, 1.34375],
  lineOpacityMax: 0.55,
  opacityVariance: 0.14,
  pressureVariance: 0.4,
  grainStrength: 0.04,
}

/** 실제로 구워 쓰는 텍스처 해상도. 스크립트가 PNG를 만들 때 쓴다. */
export const GRID_PAPER_OUTPUT: GridPaperRenderOptions = {
  size: 1024,
  supersample: 3,
}
