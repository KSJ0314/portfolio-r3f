import { create } from 'zustand'
import { Vector3 } from 'three'

/**
 * 캐릭터가 이동할 수 있는 최대 반경(경계). 경계에서 투명 벽처럼 멈춘다.
 */
export const CAMERA_BOUNDS = 30

/**
 * 캐릭터 시작 위치 [x, y, z]. Intro 페이지 바깥 아래쪽이다.
 * 카메라 초기 위치(Experience)는 여기에 아이소메트릭 오프셋을 더한 값이어야 시점이 유지된다.
 */
export const CHARACTER_START: [number, number, number] = [0, 0, 5]

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
   * 팔로우 오프셋(카메라 − 캐릭터). CameraRig가 초기화할 때 한 번 채운다.
   * 스테이션이 카메라를 넘겨받았을 때 "돌아갈 자세"를 계산하는 데 쓴다 —
   * 지금 카메라가 어디 있는지 보고 유추하면 팔로우가 아직 안 돈 상황에서 틀린 값을 잡는다.
   */
  followOffset: Vector3
  /**
   * 이동 관련 실시간 값. position처럼 set 없이 in-place로 갱신(구독 알림 없음) — 디버그/튜닝용.
   * `speed`: 이번 프레임 실제 이동 속도(유닛/초). Character가 매 프레임 기록.
   */
  motion: { speed: number }
  /** 목표점을 설정한다(경계 안으로 clamp). */
  setTarget: (point: Vector3) => void
  /** 뷰 각도를 설정한다(값이 바뀔 때만). */
  setViewAngle: (angle: number) => void
  /** 팔로우 오프셋을 기록한다(좌표만 갱신). */
  setFollowOffset: (offset: Vector3) => void
}

export const useCameraStore = create<CameraState>((set, get) => ({
  position: new Vector3(...CHARACTER_START),
  target: new Vector3(...CHARACTER_START),
  viewAngle: 0,
  followOffset: new Vector3(),
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
  setFollowOffset: (offset) => {
    get().followOffset.copy(offset)
  },
}))
