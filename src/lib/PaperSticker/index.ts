export { PaperSticker } from './PaperSticker'
// 굽는 훅은 내보내지 않는다 — 밖에서 꺼내 판을 직접 만들면 같은 코드가 흩어진다.
// 재질을 바꿔야 하는 쓰임은 <PaperSticker>의 props로 받는다.
export { preloadPaperSticker } from './PaperSticker.texture'
export { DEFAULT_PAPER_STICKER_PARAMS } from './PaperSticker.constants'
export type { PaperStickerParams } from './PaperSticker.types'
