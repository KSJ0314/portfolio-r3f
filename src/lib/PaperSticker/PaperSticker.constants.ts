import type { PaperStickerParams } from './PaperSticker.types'

/**
 * 실루엣을 넓힐 때 원 둘레를 훑는 횟수.
 * 원을 이만큼의 다각형으로 근사하는 셈이라, 낮으면 테두리에 각이 진다.
 */
export const DILATE_STEPS = 48

/** 종이 스티커 기본값. */
export const DEFAULT_PAPER_STICKER_PARAMS: PaperStickerParams = {
  border: 0.04,
  paperColor: '#fffefc',
  alphaThreshold: 0.4,
  shadowBlur: 0.025,
  shadowDistance: 0.012,
  shadowOpacity: 0.22,
  shadowColor: '#3a3a3a',
}
