import { create } from 'zustand'

/**
 * 스테이션 활성화 라이프사이클.
 *
 * ```
 * idle ──근접 + 좌클릭──> entering ──진입 애니 끝(enterComplete)──> active
 *                        [이동 잠금]                                 │
 *                              근접 이탈 · 나가기 요소 클릭 · ESC ───┘
 *                                                  ↓
 *                        exiting ──종료 애니 끝(exitComplete)──> idle
 * ```
 *
 * - **이동 잠금은 진입 애니메이션 중에만 걸린다.**
 *   `active`에서는 평소처럼 이동할 수 있고, **걸어서 근접 범위를 벗어나면 그것이 곧 종료**다.
 *   종료 애니메이션 중에도 이동은 막지 않는다 — 걸어나가다 멈칫하지 않게.
 * - **닫기는 근접 이탈 · 스테이션이 제공하는 나가기 요소 · ESC 세 가지**다. 우클릭(이동)은 닫지 않는다.
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
  /** 근접 스테이션 갱신. 활성 스테이션에서 멀어지면 그대로 종료를 건다. */
  setNear: (id: string | null) => void
  /** 근접한 스테이션을 활성화한다(idle에서만). 진입 애니메이션이 시작되고 이동이 잠긴다. */
  activate: (id: string) => void
  /** 스테이션 구현이 진입 애니메이션을 마쳤음을 알린다 → 이동 잠금 해제. */
  enterComplete: () => void
  /** 종료를 요청한다(근접 이탈 · 나가기 요소 · ESC). active에서만 받는다. */
  requestClose: () => void
  /** 스테이션 구현이 종료 애니메이션을 마쳤음을 알린다 → idle 복귀. */
  exitComplete: () => void
}

export const useStationStore = create<StationState>((set, get) => ({
  nearId: null,
  // 사이트 첫 화면은 Intro가 활성인 상태다. 진입 애니메이션 없이 처음부터 정면뷰로 시작한다.
  activeId: 'about-intro',
  phase: 'active',
  setNear: (id) => {
    if (get().nearId !== id) set({ nearId: id })
    // 걸어서 멀어지는 것이 곧 닫기다. 값이 바뀌는 순간이 아니라 매번 확인한다 —
    // 활성 스테이션이 처음부터 근접 밖이면 전환이 일어나지 않아 영영 안 닫힌다.
    // requestClose는 active에서만 받으므로 반복 호출은 무시된다.
    const { activeId, phase } = get()
    if (phase === 'active' && activeId !== null && id !== activeId) get().requestClose()
  },
  activate: (id) => {
    const { phase, nearId } = get()
    if (phase !== 'idle' || nearId !== id) return
    set({ activeId: id, phase: 'entering' })
  },
  enterComplete: () => {
    if (get().phase === 'entering') set({ phase: 'active' })
  },
  requestClose: () => {
    if (get().phase !== 'active') return
    set({ phase: 'exiting' })
  },
  exitComplete: () => {
    if (get().phase !== 'exiting') return
    set({ activeId: null, phase: 'idle' })
  },
}))

/**
 * 진입 애니메이션 중에만 캐릭터 이동이 잠긴다.
 * 종료 중에는 잠그지 않는다 — 걸어나가는 것이 종료 트리거라 잠그면 그 자리에서 멈칫한다.
 */
export const isMovementLocked = (phase: StationPhase) => phase === 'entering'
