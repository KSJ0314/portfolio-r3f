import { DILATE_STEPS } from './PaperSticker.constants'
import type { PaperStickerBake, PaperStickerParams } from './PaperSticker.types'

/** `#rrggbb` + 불투명도 → 캔버스가 받는 rgba 문자열. */
function toRgba(hex: string, opacity: number): string {
  const value = Number.parseInt(hex.slice(1), 16)
  return `rgba(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}, ${opacity})`
}

function createCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  return canvas
}

function context2d(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('2D 컨텍스트를 만들지 못했습니다.')
  return ctx
}

/**
 * 바깥에서 닿지 않는 구멍을 메운다.
 *
 * 종이는 한 장이라 **바깥 윤곽만 오리고 속은 남는다.** 그림 안쪽의 빈 곳(공구 사이 틈 등)까지
 * 뚫려 있으면 모눈종이가 비쳐 스티커가 아니라 오려낸 조각들처럼 보인다.
 * 가장자리에서 시작해 덜 채워진 픽셀을 타고 번져 나가면 닿지 못한 곳이 곧 안쪽 구멍이다.
 * 윤곽의 반투명 픽셀은 바깥과 이어져 있어 그대로 남고, 테두리가 계단지지 않는다.
 */
function fillEnclosedHoles(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const image = ctx.getImageData(0, 0, width, height)
  const { data } = image
  const outside = new Uint8Array(width * height)
  const stack: number[] = []

  const visit = (index: number) => {
    if (outside[index] || data[index * 4 + 3] === 255) return
    outside[index] = 1
    stack.push(index)
  }

  for (let x = 0; x < width; x++) {
    visit(x)
    visit((height - 1) * width + x)
  }
  for (let y = 0; y < height; y++) {
    visit(y * width)
    visit(y * width + width - 1)
  }

  while (stack.length > 0) {
    const index = stack.pop() as number
    const x = index % width
    const y = (index - x) / width
    if (x > 0) visit(index - 1)
    if (x < width - 1) visit(index + 1)
    if (y > 0) visit(index - width)
    if (y < height - 1) visit(index + width)
  }

  for (let i = 0; i < outside.length; i++) {
    if (!outside[i]) data[i * 4 + 3] = 255
  }
  ctx.putImageData(image, 0, 0)
}

/** 그림 모양대로 오려낸 종이 — 실루엣을 테두리 폭만큼 넓혀 종이 색으로 채운 판. */
function buildPaperShape(
  image: HTMLImageElement,
  width: number,
  height: number,
  pad: number,
  border: number,
  params: PaperStickerParams,
): HTMLCanvasElement {
  // 흐린 가장자리를 기준값으로 딱 잘라 실루엣만 남긴다.
  const cut = createCanvas(width, height)
  const cutCtx = context2d(cut)
  cutCtx.drawImage(image, pad, pad)
  const silhouette = cutCtx.getImageData(0, 0, width, height)
  const min = params.alphaThreshold * 255
  for (let i = 3; i < silhouette.data.length; i += 4) {
    silhouette.data[i] = silhouette.data[i] >= min ? 255 : 0
  }
  cutCtx.putImageData(silhouette, 0, 0)

  // 실루엣을 원 둘레로 훑어 겹쳐 그리면 그 반지름만큼 사방으로 넓어진다(= 가위로 남긴 여백).
  const shape = createCanvas(width, height)
  const shapeCtx = context2d(shape)
  for (let i = 0; i < DILATE_STEPS; i++) {
    const angle = (i / DILATE_STEPS) * Math.PI * 2
    shapeCtx.drawImage(cut, Math.cos(angle) * border, Math.sin(angle) * border)
  }
  shapeCtx.drawImage(cut, 0, 0)

  fillEnclosedHoles(shapeCtx, width, height)

  shapeCtx.globalCompositeOperation = 'source-in'
  shapeCtx.fillStyle = params.paperColor
  shapeCtx.fillRect(0, 0, width, height)
  return shape
}

/**
 * 배경이 투명한 그림을 "오려서 붙인 종이 스티커"로 굽는다.
 *
 * 종이(테두리) → 그림자 → 그림 순으로 한 장에 합성한다. 그림자는 종이를 그릴 때 함께 깔리므로
 * 종이 밑에 정확히 들어간다. 판이 그림보다 커지는 만큼(`plane`) 호출부가 판 크기를 키워야
 * 그림 자체는 지정한 크기 그대로 남는다.
 */
export function bakePaperSticker(
  image: HTMLImageElement,
  params: PaperStickerParams,
): PaperStickerBake {
  const imageWidth = image.naturalWidth
  const imageHeight = image.naturalHeight
  // 비율의 기준은 짧은 변이다. 가로로 긴 그림이든 세로로 긴 그림이든 테두리 폭이 같아 보인다.
  const unit = Math.min(imageWidth, imageHeight)
  const border = params.border * unit
  const blur = params.shadowBlur * unit
  const distance = params.shadowDistance * unit

  // 테두리와 그림자가 잘리지 않을 만큼 사방에 여백을 둔다.
  const pad = Math.ceil(border + blur * 1.5 + distance) + 2
  const width = imageWidth + pad * 2
  const height = imageHeight + pad * 2

  const shape = buildPaperShape(image, width, height, pad, border, params)

  const canvas = createCanvas(width, height)
  const ctx = context2d(canvas)
  ctx.shadowColor = toRgba(params.shadowColor, params.shadowOpacity)
  ctx.shadowBlur = blur
  ctx.shadowOffsetX = distance
  ctx.shadowOffsetY = distance
  ctx.drawImage(shape, 0, 0)

  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = 0
  ctx.drawImage(image, pad, pad)

  return {
    canvas,
    plane: { width: width / imageHeight, height: height / imageHeight },
    artwork: { width: imageWidth / imageHeight, height: 1 },
  }
}
