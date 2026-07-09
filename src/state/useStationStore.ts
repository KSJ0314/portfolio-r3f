import { create } from 'zustand'

/**
 * 스테이션 상호작용 상태.
 * - `nearId`: 캐릭터가 근접해 상호작용 가능한 스테이션(매 프레임 근접 판정으로 갱신).
 * - `activeId`: 선택(활성화)된 스테이션. **항상 근접한 스테이션이어야 한다** — 근접 상태에서만
 *   선택할 수 있고, 근접 범위를 벗어나면 자동 해제된다.
 */
interface StationState {
  nearId: string | null
  activeId: string | null
  /** 근접 스테이션 갱신. near가 바뀌어 현재 선택이 더는 근접이 아니게 되면 선택을 해제한다. */
  setNear: (id: string | null) => void
  /** 좌클릭 선택 토글. 이미 선택돼 있으면 해제, 아니면 **근접한 스테이션일 때만** 선택. */
  toggleActive: (id: string) => void
}

export const useStationStore = create<StationState>((set, get) => ({
  nearId: null,
  activeId: null,
  setNear: (id) => {
    const s = get()
    const patch: Partial<StationState> = {}
    if (s.nearId !== id) patch.nearId = id
    // 선택은 근접한 스테이션에만 유효 — 근접 대상이 바뀌면(멀어짐 포함) 선택 해제.
    if (s.activeId !== null && s.activeId !== id) patch.activeId = null
    if (patch.nearId !== undefined || patch.activeId !== undefined) set(patch)
  },
  toggleActive: (id) =>
    set((s) => ({
      activeId: s.activeId === id ? null : s.nearId === id ? id : s.activeId,
    })),
}))
