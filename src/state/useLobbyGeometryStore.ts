import { create } from 'zustand'
import type { InteriorTrigger } from '../stations/sections/projects/interior'

/** 모델에서 잰 통로 입구 — 그 자리에 세운 면의 중심과 크기. */
export interface LobbyPassageOpening {
  x: number
  y: number
  /** 입구가 뚫린 자리(월드 z). 여기서 안쪽으로 조금 들여 가림 면을 세운다. */
  z: number
  width: number
  height: number
}

interface LobbyGeometryState {
  /** 트리거 이름(`Trigger_Book` 등) → 잰 값. */
  triggers: Record<string, InteriorTrigger>
  /**
   * 계단 난간 **안쪽** 좌우 폭(월드 x). 통로로 곧장 갈 수 있는 길이 이만큼이다.
   * 좌우가 뒤집혀 있으면(잰 적 없음) 아직 아무 데도 아니다.
   */
  corridor: { minX: number; maxX: number }
  /** 통로 입구. 재기 전에는 null이라 가림 면을 세우지 않는다. */
  passage: LobbyPassageOpening | null
  setGeometry: (
    triggers: Record<string, InteriorTrigger>,
    corridor: { minX: number; maxX: number },
    passage: LobbyPassageOpening | null,
  ) => void
  clearGeometry: () => void
}

/** 잰 적이 없을 때의 값. 좌우가 뒤집혀 있어 어떤 x도 안에 들지 않는다. */
const EMPTY_CORRIDOR = { minX: 1, maxX: -1 }

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
  corridor: EMPTY_CORRIDOR,
  passage: null,
  setGeometry: (triggers, corridor, passage) => set({ triggers, corridor, passage }),
  clearGeometry: () => set({ triggers: {}, corridor: EMPTY_CORRIDOR, passage: null }),
}))
