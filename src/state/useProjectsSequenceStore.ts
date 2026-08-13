import { create } from 'zustand'

interface ProjectsSequenceState {
  /**
   * 문이 닫혀 있는지. 나갈 때 카메라가 이 신호를 보고 항공뷰로 돌기 시작한다.
   *
   * 처음이 참인 이유는 **아직 문이 열린 적이 없으면 기다릴 것도 없기** 때문이다.
   * 모델에 문이 없어 여닫이가 아예 없는 경우에도 카메라가 영영 기다리지 않는다.
   */
  doorClosed: boolean
  /**
   * 문이 다 열렸는지. 활성 구현이 이 신호를 보고 캐릭터를 건물 안으로 들여보낸다.
   * 닫기 시작하면 내려간다.
   */
  doorOpened: boolean
  setDoorClosed: (closed: boolean) => void
  setDoorOpened: (opened: boolean) => void
}

/**
 * 프로젝트 구역 활성 연출의 차례 신호.
 *
 * 나갈 때는 **문이 다 닫힌 뒤에** 카메라가 돈다. 그 차례를 지연(delay)이 아니라 신호로 넘긴다 —
 * 문 여닫는 시간은 HUD로 바뀔 수 있고, 지연으로 맞춰 두면 값이 바뀔 때마다 어긋난다.
 */
export const useProjectsSequenceStore = create<ProjectsSequenceState>((set, get) => ({
  doorClosed: true,
  doorOpened: false,
  setDoorClosed: (closed) => {
    if (get().doorClosed !== closed) set({ doorClosed: closed })
  },
  setDoorOpened: (opened) => {
    if (get().doorOpened !== opened) set({ doorOpened: opened })
  },
}))
