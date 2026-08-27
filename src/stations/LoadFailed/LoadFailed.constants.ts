import type { PaperStickerParams } from '../../lib/PaperSticker'

/** 곁들이는 글씨 색. 본문 잉크(`#3a3a3a`)보다 물러나 있다(DESIGN 컬러 팔레트). */
export const LOAD_FAILED_COLOR = '#696969'

/** 실패했을 때 그 자리에 대신 두는 한 줄. */
export const LOAD_FAILED_TEXT = '내용을 불러오지 못했습니다.'

/** 다시 읽는 아이콘. 도형이라 색·모양을 고치기 쉬운 SVG로 둔다. */
export const LOAD_FAILED_ICON_URL = '/images/refresh.svg'

/** 작게 붙는 아이콘이라 나가기와 같은 두께로 둔다. */
export const LOAD_FAILED_ICON_PARAMS: Partial<PaperStickerParams> = {
  border: 0.05,
  shadowBlur: 0.03,
  shadowDistance: 0,
  shadowOpacity: 0.3,
}

/** 아이콘 크기와 문구에서 떨어뜨리는 거리. 글자 크기에 비례해 잡는다. */
export const LOAD_FAILED_ICON_SIZE_RATIO = 1.4
export const LOAD_FAILED_ICON_GAP_RATIO = 1.6
