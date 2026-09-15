import { create } from 'zustand'

interface CareerSequenceState {
  /** 그림들이 로고 자리로 물러날 차례인지. */
  logoTurn: boolean
  /**
   * 트윈 없이 그 자세로 곧바로 갈지.
   *
   * 화면이 이미 활성인 채로 붙는 경우(사이드바에서 눌러 바로 열기·HMR 재마운트)에는 물러나는
   * 과정을 보여줄 앞 구간이 없다. 그대로 트윈을 돌리면 다 열린 화면에서 그림만 미끄러진다.
   */
  instant: boolean
  setLogoTurn: (on: boolean, instant?: boolean) => void
}

/**
 * Career 활성 연출의 차례 신호.
 *
 * 캐릭터가 걷는 시간은 거리에 따라 달라져 지연 상수로 차례를 맞출 수 없다.
 * 전체 순서를 아는 활성 구현이 신호를 내고, 상시 마운트된 그림들이 그것을 보고 움직인다.
 */
export const useCareerSequenceStore = create<CareerSequenceState>((set) => ({
  logoTurn: false,
  instant: false,
  setLogoTurn: (logoTurn, instant = false) => set({ logoTurn, instant }),
}))
