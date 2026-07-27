import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CanvasTexture, SRGBColorSpace } from 'three'
import { DEFAULT_CRAYON_PARAMS } from './Crayon.constants'
import { createCrayonStrokePainter } from './Crayon.draw'
import type { CrayonDrawing, CrayonPoint, CrayonSharedParams } from './Crayon.types'

/**
 * 그려지는 크레파스 텍스처 — 획을 처음부터 끝까지 등속으로 그어 나가는 연출.
 *
 * 한 번에 굽는 쪽(`Crayon.texture`)과 달리 캔버스를 직접 들고 매 프레임 조금씩 이어 그린다.
 * 매 프레임 바뀌는 텍스처는 `useLoader`(캐시·Suspense)에 태우지 않고
 * 인스턴스 하나를 만들어 `needsUpdate`로 갱신한다.
 * 다 그리면 갱신을 멈춰 그때부터는 평범한 정적 텍스처가 된다.
 */

/** 텍스처를 굽는 입력. 같은 입력이면 캔버스를 다시 만들지 않는다. */
interface CrayonBakeInput {
  drawing: CrayonDrawing
  params: CrayonSharedParams
  width: number
  height: number
}

/** 그리기 진행도를 재기 위해 길이를 미리 잰 획. */
interface RevealStroke {
  points: CrayonPoint[]
  /** points[i]까지 따라간 거리(px). */
  cumulative: number[]
  length: number
  seed: number
  color: string
}

interface CrayonReveal {
  texture: CanvasTexture
  /** 그림 전체의 경로 길이(px). 등속으로 그으려면 이 길이를 시간으로 나눈다. */
  total: number
  /** 시작점부터 `distance`(px)까지 그린다. 이미 그린 구간은 다시 건드리지 않는다. */
  drawTo: (distance: number) => void
  isDone: () => boolean
  dispose: () => void
}

/** 캔버스를 만들고 획을 조금씩 그려 나갈 준비를 한다. */
function createCrayonReveal({ drawing, params, width, height }: CrayonBakeInput): CrayonReveal {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace

  const shared = { ...DEFAULT_CRAYON_PARAMS, ...params }

  const strokes: RevealStroke[] = drawing.map((stroke) => {
    const points = stroke.points.map(([u, v]): CrayonPoint => [u * width, v * height])
    const cumulative = [0]
    for (let i = 1; i < points.length; i += 1) {
      const [ax, ay] = points[i - 1]
      const [bx, by] = points[i]
      cumulative.push(cumulative[i - 1] + Math.hypot(bx - ax, by - ay))
    }
    return {
      points,
      cumulative,
      length: cumulative[cumulative.length - 1] ?? 0,
      seed: stroke.seed,
      color: stroke.color ?? shared.color,
    }
  })

  const total = strokes.reduce((sum, stroke) => sum + stroke.length, 0)

  /** 지금 긋고 있는 획. */
  let index = ctx ? 0 : strokes.length
  /** 앞선 획들의 길이 합. */
  let before = 0
  /** 현재 획의 붓. 획 하나를 끝까지 이어 쓴다(난수 스트림이 이어져야 한 번에 그린 것과 같아진다). */
  let painter: ReturnType<typeof createCrayonStrokePainter> | null = null
  /** 현재 획에서 다음에 붓으로 넘길 원본 점. */
  let next = 0

  const isDone = () => index >= strokes.length

  return {
    texture,
    total,
    isDone,
    dispose: () => texture.dispose(),

    drawTo(distance) {
      if (!ctx || isDone()) return
      let drew = false

      while (index < strokes.length) {
        const stroke = strokes[index]
        if (!painter) {
          painter = createCrayonStrokePainter(ctx, {
            ...shared,
            seed: stroke.seed,
            color: stroke.color,
          })
          next = 0
        }

        // 이 획에서 그려야 할 지점. 획을 다 지났으면 획 길이에서 멈춘다.
        const local = Math.min(distance - before, stroke.length)
        if (local < 0) break

        const points: CrayonPoint[] = []
        while (next < stroke.points.length && stroke.cumulative[next] <= local) {
          points.push(stroke.points[next])
          next += 1
        }

        // 구간 중간에서 멈췄으면 그 지점을 보간해 하나 더 넘긴다 — 그래야 점 간격과 무관하게 등속으로 보인다.
        if (local < stroke.length && next > 0 && next < stroke.points.length) {
          const [ax, ay] = stroke.points[next - 1]
          const [bx, by] = stroke.points[next]
          const span = stroke.cumulative[next] - stroke.cumulative[next - 1]
          const ratio = span > 0 ? (local - stroke.cumulative[next - 1]) / span : 0
          points.push([ax + (bx - ax) * ratio, ay + (by - ay) * ratio])
        }

        if (points.length > 0) {
          painter.extend(points)
          drew = true
        }

        // 아직 이 획 위에 있으면 여기서 멈춘다. 끝까지 왔으면 마무리하고 다음 획으로.
        if (local < stroke.length) break
        painter.finish()
        painter = null
        drew = true
        before += stroke.length
        index += 1
      }

      if (drew) texture.needsUpdate = true
    },
  }
}

/**
 * 크레파스 그림을 등속으로 그려 나가는 텍스처 훅.
 * `seconds` 동안 그림 전체를 긋는다. 서스펜드하지 않으므로 Suspense가 필요 없다.
 */
export function useCrayonRevealTexture(
  drawing: CrayonDrawing,
  params: CrayonSharedParams,
  width: number,
  height: number,
  seconds: number,
): CanvasTexture {
  // 직렬화한 입력이 곧 캔버스의 정체다(로더가 캐시 키로 쓰는 것과 같은 방식).
  // 같은 그림·같은 크기면 다시 만들지 않으므로, 크기를 배율로만 키우면 새로 굽지 않는다.
  const key = JSON.stringify({ drawing, params, width, height } satisfies CrayonBakeInput)
  const reveal = useMemo(() => createCrayonReveal(JSON.parse(key) as CrayonBakeInput), [key])
  const drawn = useRef(0)

  useEffect(() => {
    drawn.current = 0
    // 로더가 캐시하는 텍스처와 달리 이건 우리가 만든 것이라 직접 버린다.
    return () => reveal.dispose()
  }, [reveal])

  useFrame((_, delta) => {
    if (reveal.isDone()) return
    // 0초는 "즉시 완성"이다. 진행도를 올리지 않으면 0에 멈춰 그림이 영영 나타나지 않는다.
    drawn.current += seconds > 0 ? (reveal.total / seconds) * delta : reveal.total
    reveal.drawTo(drawn.current)
  })

  return reveal.texture
}
