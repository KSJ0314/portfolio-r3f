import { create } from 'zustand'
import { Vector3 } from 'three'
import { useCameraStore } from './useCameraStore'

/**
 * 스테이션 활성화 라이프사이클.
 *
 * ```
 * idle ──근접 + 좌클릭──> entering ──진입 애니 끝(enterComplete)──> active
 *                        [이동 잠금]                                 │
 *                                          우클릭(이동) · ESC ───────┘
 *                                                  ↓
 *                        exiting ──종료 애니 끝(exitComplete)──> idle
 *                        [이동 잠금] → 끝나면 우클릭한 지점으로 출발
 * ```
 *
 * - **이동 잠금은 애니메이션 재생 중(entering·exiting)에만 걸린다.**
 *   `active`에서는 이동 입력을 받으며, 그 입력이 곧 종료 트리거다.
 *   우클릭 지점을 기억해뒀다가 종료 애니메이션이 끝난 뒤 그리로 출발한다.
 * - **좌클릭은 상세 내부 요소 상호작용 전용** — 닫기에 쓰지 않는다.
 * - 진입·종료 애니메이션과 그동안의 카메라 연출은 전적으로 스테이션 구현의 몫이며, 끝났을 때
 *   `enterComplete()`/`exitComplete()`로 공통층에 알린다.
 *   등록된 구현이 없는 스테이션은 알릴 주체가 없으므로 공통층이 즉시 완료 처리한다(StationLifecycle).
 *   카메라 팔로우 복귀는 `exitComplete()` 시점에 공통층이 보장한다. (DECISIONS 007)
 */
export type StationPhase = 'idle' | 'entering' | 'active' | 'exiting'

interface StationState {
  /** 캐릭터가 근접해 상호작용 가능한 스테이션(매 프레임 근접 판정으로 갱신). */
  nearId: string | null
  /** 활성화된(또는 진입·종료 중인) 스테이션. idle이면 null. */
  activeId: string | null
  phase: StationPhase
  /** 종료를 부른 우클릭 지점. 종료 애니메이션이 끝나면 이 지점으로 캐릭터가 출발한다. */
  pendingTarget: Vector3 | null
  /** 근접 스테이션 갱신. */
  setNear: (id: string | null) => void
  /** 근접한 스테이션을 활성화한다(idle에서만). 진입 애니메이션이 시작되고 이동이 잠긴다. */
  activate: (id: string) => void
  /** 스테이션 구현이 진입 애니메이션을 마쳤음을 알린다 → 이동 잠금 해제. */
  enterComplete: () => void
  /**
   * 종료를 요청한다(우클릭 이동 · ESC). active에서만 받는다.
   * @param target 우클릭 이동으로 닫는 경우 그 지점. 종료 애니메이션이 끝난 뒤 캐릭터가 여기로 간다.
   */
  requestClose: (target?: Vector3) => void
  /** 스테이션 구현이 종료 애니메이션을 마쳤음을 알린다 → idle 복귀 + 대기 중이던 이동 시작. */
  exitComplete: () => void
}

export const useStationStore = create<StationState>((set, get) => ({
  nearId: null,
  activeId: null,
  phase: 'idle',
  pendingTarget: null,
  setNear: (id) => {
    if (get().nearId !== id) set({ nearId: id })
  },
  activate: (id) => {
    const { phase, nearId } = get()
    if (phase !== 'idle' || nearId !== id) return
    set({ activeId: id, phase: 'entering', pendingTarget: null })
  },
  enterComplete: () => {
    if (get().phase === 'entering') set({ phase: 'active' })
  },
  requestClose: (target) => {
    if (get().phase !== 'active') return
    set({ phase: 'exiting', pendingTarget: target ? target.clone() : null })
  },
  exitComplete: () => {
    if (get().phase !== 'exiting') return
    const { pendingTarget } = get()
    set({ activeId: null, phase: 'idle', pendingTarget: null })
    // 종료 애니메이션이 끝난 뒤에야 캐릭터가 우클릭했던 지점으로 출발한다.
    if (pendingTarget) useCameraStore.getState().setTarget(pendingTarget)
  },
}))

/** 애니메이션 재생 중(entering·exiting)에는 캐릭터 이동이 잠긴다. */
export const isMovementLocked = (phase: StationPhase) => phase === 'entering' || phase === 'exiting'
