import { useEffect, useState } from 'react'
import { type StationPhase, useStationStore } from '../state/useStationStore'

/** 등장 조건이 보는 라이프사이클 값. */
interface StationSnapshot {
  activeId: string | null
  phase: StationPhase
  visited: Record<string, boolean>
}

/**
 * 그 스테이션을 **한 번 열었다 닫은 뒤**인지 — 열어본 적이 있고 라이프사이클이 다시 idle인 시점이다.
 * `delaySeconds`를 주면 그만큼 더 기다린다.
 *
 * 맵 장식은 앞 스테이션을 보고 나온 뒤에 나타나는 조건으로 쓰고,
 * 스테이션은 이것을 뒤집어 **아직 열어본 적 없는지**(클릭 표시를 낼지)로 쓴다.
 *
 * 열어본 기록은 스토어(`useStationStore.visited`)에 있다. 컴포넌트에 들고 있으면 라우트가 갈려
 * 맵이 다시 마운트될 때 지워져, 뒤로가기로 돌아왔을 때 장식이 사라지고 클릭 표시가 되살아난다.
 */
export function useAfterStation(stationId: string, delaySeconds = 0): boolean {
  const [passed, setPassed] = useState(false)

  useEffect(() => {
    if (passed) return
    let timer = 0

    // idle이면 activeId는 null이므로 "지금 그 스테이션인지"는 따로 보지 않아도 된다.
    const check = (state: StationSnapshot) => {
      if (!state.visited[stationId] || state.phase !== 'idle') {
        // 기다리는 중에 다시 들어갔다. 나오면 그때 다시 건다.
        window.clearTimeout(timer)
        timer = 0
        return
      }
      // 기다리는 중에 다시 들어오면 타이머가 겹치므로 한 번만 건다.
      if (timer) return
      if (delaySeconds > 0) {
        timer = window.setTimeout(() => {
          timer = 0
          // 기다린 사이에 상태가 바뀌었을 수 있어 다시 본다.
          const now = useStationStore.getState()
          if (now.visited[stationId] && now.phase === 'idle') setPassed(true)
        }, delaySeconds * 1000)
      } else setPassed(true)
    }

    const unsubscribe = useStationStore.subscribe(check)
    // 구독은 다음 변화부터 알리므로 지금 상태를 한 번 본다.
    check(useStationStore.getState())

    return () => {
      unsubscribe()
      window.clearTimeout(timer)
    }
  }, [passed, stationId, delaySeconds])

  return passed
}
