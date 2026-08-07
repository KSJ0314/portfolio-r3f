import { create } from 'zustand'

interface CareerSequenceState {
  /** 그림들이 로고 자리로 물러날 차례인지. */
  logoTurn: boolean
  setLogoTurn: (on: boolean) => void
}

/**
 * Career 활성 연출의 차례 신호.
 *
 * 캐릭터가 걷는 시간은 거리에 따라 달라져 지연 상수로 차례를 맞출 수 없다.
 * 전체 순서를 아는 활성 구현이 신호를 내고, 상시 마운트된 그림들이 그것을 보고 움직인다.
 */
export const useCareerSequenceStore = create<CareerSequenceState>((set) => ({
  logoTurn: false,
  setLogoTurn: (logoTurn) => set({ logoTurn }),
}))
