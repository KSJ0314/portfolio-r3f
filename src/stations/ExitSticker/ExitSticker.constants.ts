import type { PaperStickerParams } from '../../lib/PaperSticker'

/** 나가기 아이콘. 배경이 투명한 PNG라 모양대로 오려진다. */
export const EXIT_STICKER_URL = '/images/exit.png'

/** 작게 붙는 아이콘이라 테두리·그림자를 공구함보다 얇게 둔다. */
export const EXIT_STICKER_PARAMS: Partial<PaperStickerParams> = {
  border: 0.05,
  shadowBlur: 0.03,
  shadowDistance: 0,
  shadowOpacity: 0.3,
}
