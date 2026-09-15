import { createContext, useContext, useLayoutEffect } from 'react'
import { create } from 'zustand'

/** 맵의 활성 상세가 쓰는 기본 꾸러미. */
export const DEFAULT_GATE_SCOPE = 'station'

interface StationGateState {
  /**
   * 꾸러미별로 걸려 있는 열쇠들. 한 꾸러미가 비면 그쪽은 준비된 것이다.
   *
   * 꾸러미를 나누는 것은 같은 스테이션 구현이 두 곳에서 동시에 뜨기 때문이다 — 맵에 열린 상세와
   * 목록 보기를 굽는 씬이 열쇠 이름까지 같다. 한 꾸러미에 담으면 굽는 쪽이 건 열쇠가 맵의 상세를
   * 감추고, 굽는 쪽이 푼 열쇠가 아직 기다리는 맵의 상세를 일찍 드러낸다.
   */
  pending: Record<string, Record<string, boolean>>
  hold: (scope: string, key: string) => void
  release: (scope: string, key: string) => void
  /** 스테이션이 바뀔 때 그 꾸러미에 남은 열쇠를 비운다. */
  clear: (scope: string) => void
}

const useStationGateStore = create<StationGateState>((set) => ({
  pending: {},
  hold: (scope, key) =>
    set((state) => {
      const keys = state.pending[scope]
      if (keys?.[key]) return state
      return { pending: { ...state.pending, [scope]: { ...keys, [key]: true } } }
    }),
  release: (scope, key) =>
    set((state) => {
      const keys = state.pending[scope]
      if (!keys?.[key]) return state
      const next = { ...keys }
      delete next[key]
      return { pending: { ...state.pending, [scope]: next } }
    }),
  clear: (scope) =>
    set((state) => {
      const keys = state.pending[scope]
      if (!keys || Object.keys(keys).length === 0) return state
      return { pending: { ...state.pending, [scope]: {} } }
    }),
}))

/**
 * 열쇠를 어느 꾸러미에 걸지. 기본은 맵이고, 굽는 씬이 자기 내용을 감싸 갈아 준다.
 * 감싸는 쪽과 거는 쪽이 모두 같은 Canvas 안이라 R3F 트리를 그대로 타고 내려간다.
 */
const GateScopeContext = createContext(DEFAULT_GATE_SCOPE)

export const StationGateScope = GateScopeContext.Provider

/** 지금 활성 상세를 보여줘도 되는지. 걸린 열쇠가 없으면 준비된 것이다. */
export function useStationGateOpen(scope: string = DEFAULT_GATE_SCOPE): boolean {
  return useStationGateStore((s) => Object.keys(s.pending[scope] ?? {}).length === 0)
}

/** 스테이션이 바뀔 때 남은 열쇠를 비운다(공통층에서 부른다). */
export function clearStationGate(scope: string = DEFAULT_GATE_SCOPE) {
  useStationGateStore.getState().clear(scope)
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
  const scope = useContext(GateScopeContext)

  useLayoutEffect(() => {
    const { hold, release } = useStationGateStore.getState()
    if (!waiting) {
      release(scope, key)
      return
    }
    hold(scope, key)
    return () => release(scope, key)
  }, [scope, key, waiting])
}
