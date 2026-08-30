import { create } from 'zustand'

/**
 * 이 기기가 연출을 감당할 만한지.
 *
 * `smooth`는 화면이 주사율을 거의 그대로 내고 있다는 뜻이고, `strained`는 프레임이 밀리고
 * 있다는 뜻이다. 중간 단계는 두지 않는다 — 쓰는 쪽이 정하는 것은 "연출을 그대로 둘지 뺄지"라
 * 두 갈래면 충분하다.
 */
export type DevicePerfTier = 'smooth' | 'strained'

interface DevicePerfState {
  /** 아직 재지 않았으면 null. */
  tier: DevicePerfTier | null
  setTier: (tier: DevicePerfTier) => void
}

/**
 * 기기 성능 등급.
 *
 * 값은 `DevicePerfProbe`가 평소 프레임 간격을 모아 한 번 정하고, 그 뒤로 바뀌지 않는다.
 * 무거운 연출을 켤지 말지를 여기에 물어본다.
 */
export const useDevicePerfStore = create<DevicePerfState>((set, get) => ({
  tier: null,
  setTier: (tier) => {
    if (get().tier !== tier) set({ tier })
  },
}))
