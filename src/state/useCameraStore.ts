import { create } from 'zustand'
import { Vector3 } from 'three'

/**
 * 캐릭터가 이동할 수 있는 최대 반경(경계). 경계에서 투명 벽처럼 멈춘다.
 */
export const CAMERA_BOUNDS = 30

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

interface CameraState {
  /** 캐릭터(타겟) 현재 위치. 매 프레임 target을 향해 고정 속도로 이동. */
  position: Vector3
  /** 캐릭터가 향해 가는 목표점(경계 clamp 적용). 우클릭/드래그로 갱신. */
  target: Vector3
  /** 목표점을 설정한다(경계 안으로 clamp). */
  setTarget: (point: Vector3) => void
}

export const useCameraStore = create<CameraState>((_, get) => ({
  position: new Vector3(0, 0, 0),
  target: new Vector3(0, 0, 0),
  setTarget: (point) => {
    get().target.set(
      clamp(point.x, -CAMERA_BOUNDS, CAMERA_BOUNDS),
      0,
      clamp(point.z, -CAMERA_BOUNDS, CAMERA_BOUNDS),
    )
  },
}))
