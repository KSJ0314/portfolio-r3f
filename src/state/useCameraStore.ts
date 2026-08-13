import { create } from 'zustand'
import { Vector3 } from 'three'
import { isMovementLocked, useStationStore } from './useStationStore'

/**
 * 캐릭터가 이동할 수 있는 최대 반경(경계). 경계에서 투명 벽처럼 멈춘다.
 * 스테이션 영역을 다 품되 바닥(`GROUND_SIZE`)보다는 작게 둬 가장자리가 화면에 안 보인다.
 */
export const CAMERA_BOUNDS = 50

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
  /**
   * 우클릭으로 이동 입력을 준 적이 있는지. 조작을 익혔다는 신호라 우클릭 안내를 걷는 데 쓴다.
   * 세션 한정이라 저장하지 않는다.
   */
  hasMoved: boolean
  /**
   * 스테이션 연출이 지정한 이동 중인지. 이동 잠금 중에도 이 목표점으로는 평소 속도로 걸어간다.
   * 도착하면 Character가 끄고, 그것이 다음 연출로 넘어가는 신호가 된다.
   */
  walking: boolean
  /**
   * 연출 이동에 쓸 걸음 속도(유닛/초). 0이면 평소 속도다.
   * 연출마다 빠르기가 달라야 할 때가 있어 `walkTo`가 받아 둔다.
   */
  walkSpeed: number
  /**
   * 스테이션 밖 연출이 걸어 둔 이동 잠금 수. 0보다 크면 이동이 막힌다.
   * 개수로 세는 이유는 연출이 겹쳐도 각자 걸고 각자 풀게 하기 위함이다.
   */
  locks: number
  /**
   * 캐릭터를 감출지. 탈것에 탄 동안처럼 캐릭터가 화면에 없어야 하는 구간에 켠다.
   * 위치는 그대로 도므로 카메라 팔로우·미니맵은 평소와 같이 따라간다.
   */
  hidden: boolean
  /** 목표점을 설정한다(경계 안으로 clamp). */
  setTarget: (point: Vector3) => void
  /**
   * 지정한 지점으로 걸어가게 한다(스테이션 연출용). 진입 잠금 중에도 멈추지 않는다.
   * 속도를 주면 그 걸음으로 가고, 주지 않으면 평소 속도다.
   */
  walkTo: (point: Vector3, speed?: number) => void
  /** 지정한 지점으로 즉시 옮긴다(월드맵 이동). 목표점도 함께 옮겨 걸어가지 않는다. */
  teleportTo: (point: Vector3) => void
  /** 연출 이동을 끝낸다(도착·중단). */
  endWalk: () => void
  /** 이동을 잠근다(연출용). 푸는 것은 건 쪽의 몫이다. */
  lockMovement: () => void
  /** 자기가 건 이동 잠금을 푼다. */
  unlockMovement: () => void
  /** 캐릭터를 감추거나 다시 보인다. */
  setHidden: (hidden: boolean) => void
  /** 우클릭 이동을 받았음을 표시한다(처음 한 번만). */
  markMoved: () => void
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
  hasMoved: false,
  walking: false,
  walkSpeed: 0,
  locks: 0,
  hidden: false,
  setTarget: (point) => {
    get().target.set(
      clamp(point.x, -CAMERA_BOUNDS, CAMERA_BOUNDS),
      0,
      clamp(point.z, -CAMERA_BOUNDS, CAMERA_BOUNDS),
    )
  },
  walkTo: (point, speed = 0) => {
    get().setTarget(point)
    if (get().walkSpeed !== speed) set({ walkSpeed: speed })
    if (!get().walking) set({ walking: true })
  },
  teleportTo: (point) => {
    get().setTarget(point)
    // 목표점은 경계 안으로 clamp되므로 그 값을 그대로 현재 위치로 삼는다.
    get().position.copy(get().target)
  },
  endWalk: () => {
    if (get().walking) set({ walking: false })
  },
  lockMovement: () => set((s) => ({ locks: s.locks + 1 })),
  // 이미 푼 잠금을 또 풀어 음수가 되면 남은 잠금이 무시되므로 0에서 멈춘다.
  unlockMovement: () => set((s) => ({ locks: Math.max(0, s.locks - 1) })),
  setHidden: (hidden) => {
    if (get().hidden !== hidden) set({ hidden })
  },
  setViewAngle: (angle) => {
    if (get().viewAngle !== angle) set({ viewAngle: angle })
  },
  setFollowOffset: (offset) => {
    get().followOffset.copy(offset)
  },
  markMoved: () => {
    // 우클릭마다 부르는 자리라, 이미 켜졌으면 set을 건너뛰어 리렌더를 만들지 않는다.
    if (!get().hasMoved) set({ hasMoved: true })
  },
}))

/**
 * 지금 이동이 막혔는지 — 스테이션 진입 애니메이션이거나, 맵 연출이 잠가 둔 동안이다.
 * 매 프레임 부르는 자리라 구독하지 않고 스토어에서 곧장 읽는다.
 */
export function isMovementBlocked(): boolean {
  return useCameraStore.getState().locks > 0 || isMovementLocked(useStationStore.getState().phase)
}
