import { create } from 'zustand'

interface GalleryFocusState {
  /** 지금 확대해 보고 있는 칸의 번호. 없으면 평소 화면이다. */
  focusedBay: number | null
  focus: (bay: number) => void
  close: () => void
  /** 전시 공간에 다시 들어오면 처음 상태로. */
  reset: () => void
}

/**
 * 전시 칸을 확대해 보는 상태.
 *
 * 자리·크기는 모델에서 잰 것(`useGalleryGeometryStore`)이고 여기 있는 것은 **지금 무엇을 보고
 * 있는지**다. 성격이 달라 나눠 둔다 — 로비의 `useLobbyTriggerStore`와 같은 자리다.
 *
 * 연 적이 있는지는 담지 않는다. 누를 수 있다는 표시를 두지 않아 걷을 기준이 필요 없다.
 */
export const useGalleryFocusStore = create<GalleryFocusState>((set, get) => ({
  focusedBay: null,
  focus: (bay) => {
    if (get().focusedBay === bay) return
    set({ focusedBay: bay })
  },
  close: () => {
    if (get().focusedBay === null) return
    set({ focusedBay: null })
  },
  reset: () => set({ focusedBay: null }),
}))
