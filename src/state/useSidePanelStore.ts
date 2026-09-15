import { create } from 'zustand'

interface SidePanelState {
  /** 사이드바가 펼쳐져 있는지. */
  open: boolean
  setOpen: (open: boolean) => void
  toggle: () => void
}

/**
 * 사이드바를 펼쳤는지.
 *
 * 사이드바 안에 두지 않는 것은 **밖에서도 여는 길이 있기 때문**이다 — 마우스 없는 기기 안내가
 * 목록을 열어 주는 버튼을 갖는다. 컴포넌트 안에 두면 그 버튼이 손댈 방법이 없다.
 */
export const useSidePanelStore = create<SidePanelState>((set, get) => ({
  open: false,
  setOpen: (open) => set({ open }),
  toggle: () => set({ open: !get().open }),
}))
