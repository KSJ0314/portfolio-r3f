import { useEffect, useMemo, useRef } from 'react'
import type { CrayonPoint } from '../Crayon.types'

/**
 * 마우스로 긋는 획의 입력 상태.
 *
 * 포인터 이벤트를 직접 듣지 않고 좌표만 받는다. 이벤트를 어디서 받아 어떤 좌표로 바꿀지는
 * 쓰는 쪽마다 다르기 때문이다(개발용 툴은 캔버스 픽셀, 바닥 낙서는 레이캐스트한 월드 좌표).
 * 공유되는 것은 **누른 뒤 뗄 때까지의 상태와 잔떨림 걸러내기**뿐이라 그것만 갖는다.
 */

/** 기본 최소 이동 거리(0~1 정규화 기준). 같은 자리 반복과 손떨림을 걸러낸다. */
const MIN_DISTANCE = 0.002

export interface CrayonStrokeInputOptions {
  /** 획이 시작될 때. */
  onBegin(): void
  /** 경로에 점이 이어질 때. */
  onExtend(points: CrayonPoint[]): void
  /** 획이 끝날 때. */
  onEnd(): void
  /** 이만큼 움직여야 점으로 인정한다. */
  minDistance?: number
}

export interface CrayonStrokeInput {
  start(point: CrayonPoint): void
  move(point: CrayonPoint): void
  stop(): void
  isDrawing(): boolean
}

export function useCrayonStrokeInput(options: CrayonStrokeInputOptions): CrayonStrokeInput {
  // 매 렌더 새로 오는 콜백을 그대로 붙들면 낡은 값을 부르게 되므로 ref로 최신 것을 본다.
  // 갱신은 렌더가 끝난 뒤에 한다 — 렌더 중 ref를 건드리면 안 된다.
  const latest = useRef(options)
  useEffect(() => {
    latest.current = options
  })

  const drawing = useRef(false)
  const previous = useRef<CrayonPoint | null>(null)

  return useMemo<CrayonStrokeInput>(
    () => ({
      start(point) {
        if (drawing.current) return
        drawing.current = true
        previous.current = point
        latest.current.onBegin()
        latest.current.onExtend([point])
      },

      move(point) {
        if (!drawing.current) return

        const last = previous.current
        const limit = latest.current.minDistance ?? MIN_DISTANCE
        if (last && Math.hypot(point[0] - last[0], point[1] - last[1]) < limit) return

        previous.current = point
        latest.current.onExtend([point])
      },

      stop() {
        if (!drawing.current) return
        drawing.current = false
        previous.current = null
        latest.current.onEnd()
      },

      isDrawing() {
        return drawing.current
      },
    }),
    [],
  )
}
