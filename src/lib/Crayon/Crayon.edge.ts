import { DEFAULT_CRAYON_EDGE } from './Crayon.constants'
import type { CrayonDrawing, CrayonEdgeParams } from './Crayon.types'

/**
 * 그림 바깥 윤곽에서 알갱이를 성기게 만드는 값밭.
 *
 * 획 한 줄의 좌우 가장자리는 `roughness`가 이미 너덜하게 만들지만, 획을 겹쳐 면을 채우면
 * 겹친 안쪽이 꽉 차면서 **바깥 윤곽만 딱 떨어진다.**
 * 그래서 그림이 채울 영역을 미리 한 장 만들어 두고, 알갱이를 찍을 때 그 자리가 얼마나 안쪽인지 보고
 * 바깥일수록 건너뛴다.
 *
 * 안쪽인 정도는 **가로·세로를 따로 재서 더 바깥인 쪽을 쓴다.** 사방으로 퍼지는 흐림 한 번으로 재면
 * 모서리에서 두 변이 함께 깎여 **직각이 둥글어진다.** 축마다 따로 재면 그 자리의 등고선이 사각이라
 * 모서리가 각진 채로 남는다.
 *
 * 값밭은 그리기 전에 그림 전체로 한 번만 만든다. 그려 나가는 연출에서도 첫 획부터 테두리가 적용된다.
 */

/** 픽셀 좌표에 알갱이를 찍을 확률(0~1). 바깥 윤곽에 가까울수록 0에 가깝다. */
export interface CrayonEdgeField {
  at(x: number, y: number): number
}

function createCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  return canvas
}

/** 획을 굵기대로 불투명하게 그어 그림이 채울 영역을 만든다. */
function drawSolidRegion(
  ctx: CanvasRenderingContext2D,
  drawing: CrayonDrawing,
  width: number,
  height: number,
): void {
  ctx.fillStyle = '#000'
  ctx.strokeStyle = '#000'
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  for (const stroke of drawing) {
    const { points } = stroke
    if (points.length === 0) continue

    // 점 하나(클릭)는 진행 방향이 없어 선이 아니라 원으로 남는다.
    if (points.length === 1) {
      const [u, v] = points[0]
      ctx.beginPath()
      ctx.arc(u * width, v * height, ctx.lineWidth / 2, 0, Math.PI * 2)
      ctx.fill()
      continue
    }

    ctx.beginPath()
    for (let i = 0; i < points.length; i += 1) {
      const [u, v] = points[i]
      const x = u * width
      const y = v * height
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.stroke()
  }
}

/**
 * 한 축으로만 훑어 "창 안이 얼마나 영역인지"(0~1)를 잰다.
 *
 * 곧게 잘린 경계에서는 창의 절반만 영역이라 0.5가 나온다. 펴는 것은 두 축을 합친 뒤에 한다 —
 * 여기서 미리 펴 버리면 0인 자리가 굳어 어떻게 합쳐도 경계선이 움직이지 않는다.
 * 판 밖은 영역 밖으로 셈해, 획이 판 밖까지 나가 잘린 자국도 경계로 다룬다.
 */
function axisAverage(
  region: Uint8Array,
  width: number,
  height: number,
  radius: number,
  vertical: boolean,
): Float32Array {
  const ramp = new Float32Array(width * height)
  const outer = vertical ? width : height
  const inner = vertical ? height : width
  const step = vertical ? width : 1
  const window = radius * 2 + 1

  for (let o = 0; o < outer; o += 1) {
    const base = vertical ? o : o * width
    let sum = 0
    for (let i = 0; i <= radius && i < inner; i += 1) sum += region[base + i * step]

    for (let i = 0; i < inner; i += 1) {
      ramp[base + i * step] = sum / window
      const add = i + radius + 1
      const drop = i - radius
      if (add < inner) sum += region[base + add * step]
      if (drop >= 0) sum -= region[base + drop * step]
    }
  }

  return ramp
}

/**
 * 영역에서 "얼마나 안쪽인가"(0~1) 값밭을 만든다.
 *
 * 두 축의 원값을 **낮은 쪽으로 고르면** 등고선이 사각이라 모서리가 각지게 남고,
 * **곱하면** 두 축으로 잇따라 흐린 것과 같아져 모서리가 둥글어진다. `roundness`가 그 사이를 오간다.
 *
 * 곧은 변에서는 한쪽 원값이 1이라 곱과 최솟값이 같다 — 그래서 `roundness`는 **모서리에만 든다.**
 * 마지막에 절반을 0으로 당겨 펴는데, 곧게 잘린 경계의 원값이 0.5라 그 자리가 0이 되고
 * 창 폭만큼 안쪽에서 1이 된다.
 */
function buildEdgeRamp(
  region: Uint8Array,
  width: number,
  height: number,
  radius: number,
  roundness: number,
): Float32Array {
  const across = axisAverage(region, width, height, radius, false)
  const down = axisAverage(region, width, height, radius, true)

  const ramp = new Float32Array(width * height)
  for (let i = 0; i < ramp.length; i += 1) {
    const square = Math.min(across[i], down[i])
    const round = across[i] * down[i]
    ramp[i] = Math.max(0, (square + (round - square) * roundness) * 2 - 1)
  }
  return ramp
}

/**
 * 그림의 바깥 윤곽에서 성기어지는 값밭을 만든다. `params`가 없으면 걸지 않는다는 뜻이라 null을 준다.
 *
 * 띠 폭(`feather`)이 획 굵기의 절반을 넘으면 가는 획은 안쪽까지 값이 차오르지 못해 통째로 옅어진다.
 * 면을 채운 그림에 거는 값이므로, 가는 획만 있는 그림에는 주지 않는다.
 */
export function createCrayonEdgeField(
  drawing: CrayonDrawing,
  width: number,
  height: number,
  strokeWidth: number,
  params?: Partial<CrayonEdgeParams>,
): CrayonEdgeField | null {
  if (!params) return null

  const { feather, strength, roundness } = { ...DEFAULT_CRAYON_EDGE, ...params }
  if (strength <= 0 || width <= 0 || height <= 0) return null

  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  ctx.lineWidth = Math.max(1, strokeWidth)
  drawSolidRegion(ctx, drawing, width, height)

  const { data } = ctx.getImageData(0, 0, width, height)
  const region = new Uint8Array(width * height)
  for (let i = 0; i < region.length; i += 1) region[i] = data[i * 4 + 3] > 127 ? 1 : 0

  const radius = Math.max(1, Math.round(feather * Math.min(width, height)))
  const field = buildEdgeRamp(region, width, height, radius, roundness)
  // 강도가 1보다 작으면 바깥에서도 이만큼은 찍힌다.
  const floor = 1 - strength

  return {
    at(x, y) {
      const ix = Math.floor(x)
      const iy = Math.floor(y)
      if (ix < 0 || iy < 0 || ix >= width || iy >= height) return floor
      return floor + strength * field[iy * width + ix]
    },
  }
}
