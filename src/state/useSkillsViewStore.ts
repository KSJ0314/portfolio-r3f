import { create } from 'zustand'

interface SkillsViewState {
  /** 보고 있는 쪽(0부터). */
  page: number
  setPage: (page: number) => void
  /** 첫 장으로 되돌린다. 스테이션을 닫을 때 부른다. */
  reset: () => void
}

/**
 * Skills 목록에서 보고 있는 쪽.
 *
 * 컴포넌트가 아니라 여기 두는 것은 **밖에서 정해 줄 일이 있기 때문**이다 — 사이드바에서 기술 스택
 * 세 번째 장을 누르면 그 쪽이 펼쳐진 채로 열려야 한다. 안에 두면 열어 준 쪽이 손댈 방법이 없다.
 *
 * 목록 보기가 쪽마다 한 화면씩 굽는 것은 이 값과 무관하다. 그쪽은 그릴 쪽을 props로 받는다.
 */
export const useSkillsViewStore = create<SkillsViewState>((set, get) => ({
  page: 0,
  setPage: (page) => {
    if (get().page === page) return
    set({ page })
  },
  reset: () => {
    if (get().page === 0) return
    set({ page: 0 })
  },
}))
