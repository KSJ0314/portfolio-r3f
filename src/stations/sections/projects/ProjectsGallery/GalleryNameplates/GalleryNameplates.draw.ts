import {
  GALLERY_NAMEPLATE_INK,
  GALLERY_NAMEPLATE_MARGIN,
  GALLERY_NAMEPLATE_TEXT_SIZE,
} from './GalleryNameplates.constants'

/** 글꼴 이름. 캔버스는 스택 문자열을 그대로 받는다. */
const HAND = "'Gamja Flower', Pretendard, sans-serif"

/**
 * 이름판에 프로젝트 이름을 한 줄로 그린다.
 *
 * 이름 길이가 제각각이라 **폭을 넘으면 글자 크기를 줄여** 맞춘다. 줄을 나누지 않는 것은
 * 이름판이 한 줄짜리 띠라 두 줄이 들어갈 높이가 없기 때문이다.
 */
export function drawNameplate(canvas: HTMLCanvasElement, title: string): void {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // 다시 그릴 때 이전 이름을 지운다. 바탕을 칠하지 않으므로 지우면 금색이 그대로 남는다.
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  if (!title) return

  const width = canvas.width * (1 - GALLERY_NAMEPLATE_MARGIN.x * 2)
  const height = canvas.height * (1 - GALLERY_NAMEPLATE_MARGIN.y * 2)

  let size = height * GALLERY_NAMEPLATE_TEXT_SIZE
  ctx.font = `${size}px ${HAND}`
  const measured = ctx.measureText(title).width
  if (measured > width) {
    size *= width / measured
    ctx.font = `${size}px ${HAND}`
  }

  ctx.fillStyle = GALLERY_NAMEPLATE_INK
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(title, canvas.width / 2, canvas.height / 2)
}

/** 그릴 글자를 함께 넘겨야 그 유니코드 범위 조각을 받는다. 이름을 다 합쳐 한 번에 받는다. */
export async function loadNameplateFont(text: string): Promise<void> {
  await document.fonts.load(`100px ${HAND}`, text)
}
