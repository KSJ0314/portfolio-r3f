import type { PaperStickerParams } from '../../../lib/PaperSticker'

/** 마우스 아이콘. SVG도 배경이 투명하면 PNG와 똑같이 모양대로 오려진다. */
export const RIGHT_CLICK_HINT_URL = '/images/mouse_right.svg'

/** 바닥과 겹쳐 깜빡이지 않도록 살짝 띄운다. 안내 화살표와 같은 층이다. */
export const RIGHT_CLICK_HINT_Y = 0.02

/** 작게 붙는 아이콘이라 테두리·그림자를 공구함보다 얇게 둔다. */
export const RIGHT_CLICK_HINT_PARAMS: Partial<PaperStickerParams> = {
  border: 0.05,
  shadowBlur: 0.03,
  shadowDistance: 0.01,
  shadowOpacity: 0.25,
}

/** 배치 기본값. 눈으로 맞춰야 하는 값이라 HUD로 조절한다. */
export const RIGHT_CLICK_HINT_PLACEMENT = {
  /** 그림 세로의 월드 크기(테두리·그림자 여백 제외). 가로는 그림 비율에서 나온다. */
  height: 0.8,
  /** 그림 중심(월드 x, z) — 안내 화살표 곁이다. */
  x: 4.7,
  z: 8.25,
  /** y축 회전(도). 양수가 반시계다. */
  rotation: -28,
}
