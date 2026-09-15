import { create } from 'zustand'

interface SkillsSequenceState {
  /** 공구함이 로고 자리로 물러날 차례인지. 카메라가 다 돌면 켜지고, 종료를 시작하면 꺼진다. */
  logoTurn: boolean
  /**
   * 트윈 없이 그 자세로 곧바로 갈지.
   *
   * 화면이 이미 활성인 채로 붙는 경우(사이드바에서 눌러 바로 열기·HMR 재마운트)에는 물러나는
   * 과정을 보여줄 앞 구간이 없다. 그대로 트윈을 돌리면 다 열린 화면에서 그림만 미끄러진다.
   */
  instant: boolean
  /** 차례를 알린다(값이 바뀔 때만). */
  setLogoTurn: (on: boolean, instant?: boolean) => void
}

/**
 * Skills 활성 연출의 차례를 알리는 신호.
 *
 * 진입은 캐릭터 이동 → 카메라 회전 → 공구함 로고 전환 순서인데, **걷는 시간이 거리에 따라 달라져**
 * 지연(delay) 상수만으로는 차례를 맞출 수 없다. 그래서 전체 순서를 아는 활성 구현(AboutSkillsScene)이
 * 신호를 내고, 상시 마운트된 공구함(SkillsBox)이 그것을 보고 움직인다.
 */
export const useSkillsSequenceStore = create<SkillsSequenceState>((set, get) => ({
  logoTurn: false,
  instant: false,
  setLogoTurn: (on, instant = false) => {
    if (get().logoTurn !== on) set({ logoTurn: on, instant })
  },
}))
