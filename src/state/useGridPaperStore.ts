import { create } from 'zustand'
import { DEFAULT_GRID_PAPER_PARAMS } from '../lib/gridPaper'
import type { GridPaperParams } from '../lib/gridPaper'

interface GridPaperState {
  /** 개발용 HUD가 조절하는 값. 기본값은 실제로 구워둔 PNG와 같은 값이다. */
  params: GridPaperParams
  /**
   * HUD로 값을 한 번이라도 바꿨는지. 바꾸기 전에는 구워둔 PNG를 그대로 쓰고,
   * 바꾼 뒤에는 브라우저에서 텍스처를 다시 구워 미리보기로 보여준다.
   */
  tuned: boolean
  setParams: (params: GridPaperParams) => void
  reset: () => void
}

/**
 * 모눈종이 텍스처의 개발용 튜닝 상태.
 * 프로덕션에서는 HUD가 렌더되지 않아 항상 기본값이다.
 * 여기서 맞춘 값을 gridPaper.constants.ts에 반영하고 스크립트로 PNG를 다시 구우면 확정된다.
 */
export const useGridPaperStore = create<GridPaperState>((set) => ({
  params: DEFAULT_GRID_PAPER_PARAMS,
  tuned: false,
  setParams: (params) => set({ params, tuned: true }),
  reset: () => set({ params: DEFAULT_GRID_PAPER_PARAMS, tuned: false }),
}))
