import { create } from 'zustand'

interface LobbyTriggerState {
  /** 지금 보고 있는 트리거. 없으면 평소 화면이다. */
  activeId: string | null
  /** 한 번이라도 연 적 있는 트리거. 누를 수 있다는 표시를 걷는 기준이다. */
  seen: Record<string, boolean>
  activate: (id: string) => void
  /** 연 적이 있다고 표시한다. 카메라를 돌리지 않고 넘어가는 트리거가 쓴다. */
  markSeen: (id: string) => void
  close: () => void
  /** 로비에 다시 들어오면 처음 상태로. */
  reset: () => void
}

/**
 * 로비 트리거(연단 위 책 · 북쪽 통로)를 여는 상태.
 *
 * 자리·크기는 모델에서 잰 것(`useLobbyGeometryStore`)이고, 여기 있는 것은 **연 적이 있는지와
 * 지금 무엇을 보고 있는지**다. 잰 값과 나눠 두는 것은 성격이 다르기 때문이다.
 */
export const useLobbyTriggerStore = create<LobbyTriggerState>((set, get) => ({
  activeId: null,
  seen: {},
  activate: (id) => {
    if (get().activeId === id) return
    set((s) => ({ activeId: id, seen: s.seen[id] ? s.seen : { ...s.seen, [id]: true } }))
  },
  markSeen: (id) => {
    if (get().seen[id]) return
    set((s) => ({ seen: { ...s.seen, [id]: true } }))
  },
  close: () => {
    if (get().activeId === null) return
    set({ activeId: null })
  },
  reset: () => set({ activeId: null, seen: {} }),
}))
