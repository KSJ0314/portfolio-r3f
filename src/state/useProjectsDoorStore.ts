import { create } from 'zustand'

/**
 * 모델에서 잰 문의 실제 자리·크기(월드 기준).
 * 건물 크기·회전을 바꾸면 이 값이 다시 계산되고, 문에 붙는 것들이 전부 따라온다.
 */
export interface ProjectsDoorMeasure {
  /** 건물 중심에서 문까지(월드 x, z). */
  x: number
  z: number
  /** 문 중심 높이와 위 끝 높이(월드 y). */
  centerY: number
  topY: number
  /** 문 가로·세로(월드). */
  width: number
  height: number
  /** 문이 향하는 쪽(월드 단위벡터). 근접 구역이 앞으로 뻗는 방향이다. */
  facingX: number
  facingZ: number
  /** 모델에 걸린 배율. 모델 좌표로 둔 값을 월드로 옮길 때 쓴다. */
  scale: number
}

interface ProjectsDoorState {
  door: ProjectsDoorMeasure
  setDoor: (door: ProjectsDoorMeasure) => void
}

/** 아직 재기 전. 가로가 0이면 잰 적이 없다는 뜻이라 자리를 묻는 쪽이 그것으로 판단한다. */
const UNMEASURED: ProjectsDoorMeasure = {
  x: 0,
  z: 0,
  centerY: 0,
  topY: 0,
  width: 0,
  height: 0,
  facingX: 0,
  facingZ: 1,
  scale: 1,
}

/**
 * 잰 문 값. 손으로 맞추는 값이 아니라 **측정값**이라 페이지 스토어와 나눠 둔다
 * (`useCareerLogoStore`가 로고 가로를 재서 올리는 것과 같은 자리다).
 *
 * 문 자리를 상수로 박아 두면 건물 크기를 바꿀 때마다 클릭 판·표시·근접 구역·서는 자리가 모두 어긋난다.
 */
export const useProjectsDoorStore = create<ProjectsDoorState>((set) => ({
  door: UNMEASURED,
  setDoor: (door) => set({ door }),
}))
