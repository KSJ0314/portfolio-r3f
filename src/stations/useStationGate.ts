import { useLayoutEffect } from 'react'
import { create } from 'zustand'

interface StationGateState {
  /** 걸려 있는 열쇠들. 하나라도 있으면 활성 상세를 아직 보여주지 않는다. */
  pending: Record<string, boolean>
  hold: (key: string) => void
  release: (key: string) => void
  /** 스테이션이 바뀔 때 남은 열쇠를 비운다. */
  clear: () => void
}

const useStationGateStore = create<StationGateState>((set) => ({
  pending: {},
  hold: (key) =>
    set((state) => (state.pending[key] ? state : { pending: { ...state.pending, [key]: true } })),
  release: (key) =>
    set((state) => {
      if (!state.pending[key]) return state
      const pending = { ...state.pending }
      delete pending[key]
      return { pending }
    }),
  clear: () => set((state) => (Object.keys(state.pending).length === 0 ? state : { pending: {} })),
}))

/** 지금 활성 상세를 보여줘도 되는지. 걸린 열쇠가 없으면 준비된 것이다. */
export function useStationGateOpen(): boolean {
  return useStationGateStore((s) => Object.keys(s.pending).length === 0)
}

/** 스테이션이 바뀔 때 남은 열쇠를 비운다(공통층에서 부른다). */
export function clearStationGate() {
  useStationGateStore.getState().clear()
}

/**
 * 활성 상세가 아직 다 준비되지 않았음을 알린다.
 *
 * 텍스처처럼 서스펜드하는 것은 공통층이 경계로 다루지만, Firestore 데이터처럼 **서스펜드하지 않고
 * 늦게 오는 것**은 공통층이 알 방법이 없다. 그런 것이 있으면 이 훅으로 열쇠를 걸어 둔다.
 * 열쇠가 걸려 있는 동안 공통층은 활성 상세를 그리지 않고, 그동안에도 마운트는 돼 있어
 * 텍스처를 굽고 글자 크기를 재는 일은 계속된다 — 그래서 열쇠가 풀리면 완성된 화면이 한 번에 뜬다.
 *
 * 기다릴 것이 없는 스테이션은 이 훅을 쓰지 않으면 되고, 그러면 곧바로 보인다.
 *
 * 열쇠는 **첫 페인트 전에** 걸어야 한다. 그리고 나서 걸면 그 한 프레임 동안 준비되지 않은 상세가 보인다.
 */
export function useStationGate(key: string, waiting: boolean) {
  useLayoutEffect(() => {
    const { hold, release } = useStationGateStore.getState()
    if (!waiting) {
      release(key)
      return
    }
    hold(key)
    return () => release(key)
  }, [key, waiting])
}
