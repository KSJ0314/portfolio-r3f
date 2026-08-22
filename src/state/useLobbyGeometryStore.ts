import { create } from 'zustand'
import type { InteriorTrigger } from '../stations/sections/projects/interior'

interface LobbyGeometryState {
  /** 트리거 이름(`Trigger_Book` 등) → 잰 값. */
  triggers: Record<string, InteriorTrigger>
  setTriggers: (triggers: Record<string, InteriorTrigger>) => void
  clearTriggers: () => void
}

/**
 * 로비 모델에서 **잰** 것.
 *
 * 트리거(연단 위 책 · 북쪽 통로 입구)의 자리를 상수로 박아 두면 모델을 다시 내보낼 때마다 어긋난다.
 * 모델이 아는 것은 모델에게 묻는다 — 건물 문을 재서 올리는 `useProjectsDoorStore`와 같은 자리다.
 * (DECISIONS 033)
 *
 * 누를 수 있다는 표시와 동작은 아직 없다. 여기 올려 두는 것은 그것을 붙일 자리다.
 */
export const useLobbyGeometryStore = create<LobbyGeometryState>((set) => ({
  triggers: {},
  setTriggers: (triggers) => set({ triggers }),
  clearTriggers: () => set((s) => (Object.keys(s.triggers).length === 0 ? s : { triggers: {} })),
}))
