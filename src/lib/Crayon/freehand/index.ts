/**
 * 마우스로 직접 그리는 쪽.
 *
 * 획을 쌓아 두는 캔버스와 포인터 궤적 수집이다. 알갱이를 흩뿌리는 렌더 자체는 굽기와 공통이라
 * 여기 있지 않고 `Crayon.draw`에 있다(`createCrayonStrokePainter`).
 */
export { createCrayonCanvas } from './Crayon.canvas'
export { useCrayonStrokeInput } from './Crayon.input'
export type { CrayonCanvas, CrayonCanvasOptions } from './Crayon.canvas'
export type { CrayonStrokeInput, CrayonStrokeInputOptions } from './Crayon.input'
