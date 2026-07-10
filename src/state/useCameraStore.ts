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
  /**
   * 미니맵을 화면(아이소메트릭 뷰)에 맞추기 위한 회전각(라디안).
   * 카메라 오프셋에서 유도(CameraRig가 설정) — 하드코딩이 아니라 실제 카메라와 항상 일치.
   */
  viewAngle: number
  /**
   * 이동 관련 실시간 값. position처럼 set 없이 in-place로 갱신(구독 알림 없음) — 디버그/튜닝용.
   * `speed`: 이번 프레임 실제 이동 속도(유닛/초). Character가 매 프레임 기록.
   */
  motion: { speed: number }
  /** 목표점을 설정한다(경계 안으로 clamp). */
  setTarget: (point: Vector3) => void
  /** 뷰 각도를 설정한다(값이 바뀔 때만). */
  setViewAngle: (angle: number) => void
}

export const useCameraStore = create<CameraState>((set, get) => ({
  position: new Vector3(0, 0, 0),
  target: new Vector3(0, 0, 0),
  viewAngle: 0,
  motion: { speed: 0 },
  setTarget: (point) => {
    get().target.set(
      clamp(point.x, -CAMERA_BOUNDS, CAMERA_BOUNDS),
      0,
      clamp(point.z, -CAMERA_BOUNDS, CAMERA_BOUNDS),
    )
  },
  setViewAngle: (angle) => {
    if (get().viewAngle !== angle) set({ viewAngle: angle })
  },
}))
