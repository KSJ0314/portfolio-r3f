import { useEffect, useState } from 'react'
import { type StationPhase, useStationStore } from '../../state/useStationStore'

/** 라이프사이클에서 등장 조건이 보는 값. */
interface StationSnapshot {
  activeId: string | null
  phase: StationPhase
}

/**
 * Intro가 닫혀 카메라 전환이 끝났는지 — 라이프사이클이 **처음 idle이 되는 시점**이다.
 * `delaySeconds`를 주면 그만큼 더 기다린다(앞선 장식이 다 그려진 뒤에 얹을 때).
 *
 * 첫 화면은 Intro가 활성이라 그 위에 장식을 얹으면 페이지를 가린다. 맵으로 나온 뒤에 나타나야 한다.
 * 한 번 참이 되면 되돌리지 않으므로 phase를 구독해 리렌더하지 않고, idle이 되는 순간만 스토어에서 직접 받는다.
 */
export function useAfterIntro(delaySeconds = 0): boolean {
  const [passed, setPassed] = useState(() => useStationStore.getState().phase === 'idle')

  useEffect(() => {
    if (passed) return
    let timer = 0
    const check = (state: StationSnapshot) => {
      // 기다리는 중에 다시 들어오면 타이머가 겹치므로 한 번만 건다.
      if (state.phase !== 'idle' || timer) return
      if (delaySeconds > 0) timer = window.setTimeout(() => setPassed(true), delaySeconds * 1000)
      else setPassed(true)
    }
    const unsubscribe = useStationStore.subscribe(check)
    // 구독은 다음 변화부터 알리므로 지금 상태를 한 번 본다. 기다리는 도중 지연 값이 바뀌어
    // 이펙트가 다시 돌면, 이미 idle이라 알림이 오지 않아 타이머가 영영 걸리지 않는다.
    check(useStationStore.getState())

    return () => {
      unsubscribe()
      window.clearTimeout(timer)
    }
  }, [passed, delaySeconds])

  return passed
}
