import { useEffect, useRef, useState } from 'react'
import { type StationPhase, useStationStore } from '../state/useStationStore'

/** 등장 조건이 보는 라이프사이클 값. */
interface StationSnapshot {
  activeId: string | null
  phase: StationPhase
}

/**
 * 그 스테이션을 **한 번 열었다 닫은 뒤**인지 — 활성화된 적이 있고 라이프사이클이 다시 idle이 된 시점이다.
 * `delaySeconds`를 주면 그만큼 더 기다린다.
 *
 * 맵 장식은 앞 스테이션을 보고 나온 뒤에 나타나는 조건으로 쓰고,
 * 스테이션은 이것을 뒤집어 **아직 열어본 적 없는지**(클릭 표시를 낼지)로 쓴다.
 * 열었던 적이 있는지는 리렌더와 무관한 기록이라 ref에 둔다 — 지연 값이 바뀌어 이펙트가 다시 돌아도 남는다.
 */
export function useAfterStation(stationId: string, delaySeconds = 0): boolean {
  const [passed, setPassed] = useState(false)
  const visited = useRef(false)

  useEffect(() => {
    if (passed) return
    let timer = 0

    const check = (state: StationSnapshot) => {
      if (state.activeId === stationId) {
        visited.current = true
        return
      }
      // 기다리는 중에 다시 들어오면 타이머가 겹치므로 한 번만 건다.
      if (!visited.current || state.phase !== 'idle' || timer) return
      if (delaySeconds > 0) timer = window.setTimeout(() => setPassed(true), delaySeconds * 1000)
      else setPassed(true)
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
