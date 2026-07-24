import { CRAYON_TEXTURE_PIXELS, DEFAULT_CRAYON_PARAMS } from '../Crayon.constants'
import {
  createCrayonStrokePainter,
  drawCrayonDrawing,
  type CrayonStrokePainter,
} from '../Crayon.draw'
import type { CrayonDrawing, CrayonPoint, CrayonSharedParams, CrayonStroke } from '../Crayon.types'

/**
 * 획을 쌓아 두는 크레파스 캔버스.
 *
 * 그리는 중인 획은 늘어난 구간만 덧그리고(`createCrayonStrokePainter`), 확정되면 목록에 넣는다.
 * 캔버스에 눌러 담은 왁스는 지울 수 없으므로, 되돌리기·값 변경처럼 이미 그린 것이 바뀌는 일은
 * 전부 **전체 다시 그리기**로 처리한다. 획이 몇 개 안 되므로 굽는 비용과 같다.
 *
 * 좌표는 밖에서 안까지 0~1 정규화로 다룬다. 그대로 `CrayonDrawing`이 되어 코드에 붙여 쓸 수 있다.
 */

/** 획으로 인정할 최소 길이(정규화 좌표). 누르기만 하고 뗀 것을 걸러낸다. */
const MIN_STROKE_LENGTH = 0.01

export interface CrayonCanvasOptions {
  /** 캔버스 가로 픽셀 수. */
  width?: number
  /** 캔버스 세로 픽셀 수. */
  height?: number
  /** 획들이 공유하는 값. */
  params?: CrayonSharedParams
}

export interface CrayonCanvas {
  /** 새 획을 시작한다. */
  begin(seed: number): void
  /** 그리는 중인 획에 점을 잇는다(0~1 정규화). */
  extend(points: readonly CrayonPoint[]): void
  /** 그리는 중인 획을 확정한다. 너무 짧으면 버리고 null을 준다. */
  end(): CrayonStroke | null
  /** 마지막 획을 지운다. */
  undo(): void
  /** 그 지점에 닿은 획 하나를 지운다(위에 그린 것부터). 지웠으면 true. `radius`는 캔버스 픽셀 단위다. */
  eraseAt(point: CrayonPoint, radius: number): boolean
  /** 전부 지운다. */
  clear(): void
  /** 공유 값을 갈아끼운다. 이미 그린 획에도 반영된다. */
  setParams(params: CrayonSharedParams): void
  /** 캔버스 크기를 바꾸고 다시 그린다. 획은 정규화 좌표라 새 크기에 맞춰 따라온다. */
  resize(width: number, height: number): void
  /** 지금까지 확정된 그림. */
  getDrawing(): CrayonDrawing
  /** 그림을 통째로 갈아끼운다. */
  load(drawing: CrayonDrawing): void
  /** 확정된 획 수. */
  getStrokeCount(): number
}

/** 점에서 선분까지의 최단거리. */
function distanceToSegment(point: CrayonPoint, from: CrayonPoint, to: CrayonPoint): number {
  const dx = to[0] - from[0]
  const dy = to[1] - from[1]
  const lengthSq = dx * dx + dy * dy
  if (lengthSq === 0) return Math.hypot(point[0] - from[0], point[1] - from[1])

  // 선분 밖으로 넘어가지 않도록 0~1로 자른다(직선이 아니라 선분까지의 거리다).
  const t = Math.max(
    0,
    Math.min(1, ((point[0] - from[0]) * dx + (point[1] - from[1]) * dy) / lengthSq),
  )
  return Math.hypot(point[0] - (from[0] + dx * t), point[1] - (from[1] + dy * t))
}

/** 정규화 경로의 전체 길이. */
function pathLength(points: readonly CrayonPoint[]): number {
  let total = 0
  for (let i = 1; i < points.length; i += 1) {
    total += Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1])
  }
  return total
}

export function createCrayonCanvas(
  canvas: HTMLCanvasElement,
  options: CrayonCanvasOptions = {},
): CrayonCanvas {
  let width = options.width ?? CRAYON_TEXTURE_PIXELS
  let height = options.height ?? CRAYON_TEXTURE_PIXELS
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('크레파스 캔버스의 2D 컨텍스트를 만들 수 없다.')

  let params: CrayonSharedParams = options.params ?? {}
  const strokes: CrayonStroke[] = []

  let active: {
    seed: number
    /** 획을 시작한 순간의 색. 나중에 색을 바꿔도 이미 그은 획은 자기 색을 지킨다. */
    color: string
    points: CrayonPoint[]
    painter: CrayonStrokePainter
  } | null = null

  const toPixels = ([u, v]: CrayonPoint): CrayonPoint => [u * width, v * height]

  const newPainter = (seed: number, color: string) =>
    createCrayonStrokePainter(ctx, { ...DEFAULT_CRAYON_PARAMS, ...params, color, seed })

  /** 캔버스를 비우고 확정된 획을 다시 굽는다. 그리던 중이었다면 그 경로도 되짚어 재생한다. */
  const redraw = () => {
    ctx.clearRect(0, 0, width, height)
    drawCrayonDrawing(ctx, width, height, strokes, params)

    if (active) {
      active.painter = newPainter(active.seed, active.color)
      active.painter.extend(active.points.map(toPixels))
    }
  }

  return {
    begin(seed) {
      const color = params.color ?? DEFAULT_CRAYON_PARAMS.color
      active = { seed, color, points: [], painter: newPainter(seed, color) }
    },

    extend(points) {
      if (!active || points.length === 0) return
      active.points.push(...points)
      active.painter.extend(points.map(toPixels))
    },

    end() {
      if (!active) return null

      const { seed, color, points, painter } = active
      active = null
      painter.finish()

      // 너무 짧은 획은 버린다. 이미 찍힌 자국이 있으므로 다시 그려 지운다.
      if (points.length < 2 || pathLength(points) < MIN_STROKE_LENGTH) {
        redraw()
        return null
      }

      const stroke: CrayonStroke = { points, seed, color }
      strokes.push(stroke)
      return stroke
    },

    undo() {
      if (strokes.length === 0) return
      strokes.pop()
      redraw()
    },

    eraseAt(point, radius) {
      const target = toPixels(point)

      // 나중에 그린 것이 위에 있으므로 뒤에서부터 찾는다.
      for (let i = strokes.length - 1; i >= 0; i -= 1) {
        const path = strokes[i].points.map(toPixels)
        let nearest = Infinity
        for (let k = 1; k < path.length; k += 1) {
          nearest = Math.min(nearest, distanceToSegment(target, path[k - 1], path[k]))
        }

        if (nearest <= radius) {
          strokes.splice(i, 1)
          redraw()
          return true
        }
      }

      return false
    },

    clear() {
      strokes.length = 0
      active = null
      redraw()
    },

    setParams(next) {
      params = next
      redraw()
    },

    resize(nextWidth, nextHeight) {
      if (nextWidth === width && nextHeight === height) return
      width = nextWidth
      height = nextHeight
      // 크기 대입은 캔버스를 비우기도 한다. 어차피 전부 다시 그리므로 상관없다.
      canvas.width = width
      canvas.height = height
      redraw()
    },

    getDrawing() {
      return strokes.map(({ points, seed, color }) => ({ points: [...points], seed, color }))
    },

    load(drawing) {
      active = null
      strokes.length = 0
      strokes.push(...drawing.map(({ points, seed, color }) => ({ points: [...points], seed, color })))
      redraw()
    },

    getStrokeCount() {
      return strokes.length
    },
  }
}
