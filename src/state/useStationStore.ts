import { create } from 'zustand'
import { createLogger } from '../lib/logger'

const log = createLogger('station:lifecycle')

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
  /**
   * 한 번이라도 열어본 스테이션.
   *
   * 맵 장식이 "앞 스테이션을 보고 나온 뒤"에 나타나는 조건으로 쓰고, 스테이션은 이것을 뒤집어
   * "아직 열어본 적 없는지"(클릭 표시를 낼지)로 쓴다. 세션 동안의 기록이라 컴포넌트가 아니라
   * 여기 둔다 — 라우트가 갈려 맵이 다시 마운트돼도 남아야 장식이 사라지지 않는다.
   */
  visited: Record<string, boolean>
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
  /**
   * 애니메이션 없이 곧바로 닫는다.
   *
   * 장면이 통째로 갈릴 때(로비처럼 다른 라우트로 넘어갈 때) 쓴다 — 연출을 재생할 화면이 이미
   * 없으므로 완료를 알릴 주체도 없고, 그대로 두면 다음에 돌아왔을 때 열린 채로 되살아난다.
   */
  closeImmediately: () => void
}

export const useStationStore = create<StationState>((set, get) => ({
  nearId: null,
  // 사이트 첫 화면은 Intro가 활성인 상태다. 진입 애니메이션 없이 처음부터 정면뷰로 시작한다.
  activeId: 'about-intro',
  phase: 'active',
  // 첫 화면 Intro는 `activate`를 거치지 않으므로 처음부터 열어본 것으로 둔다.
  visited: { 'about-intro': true },
  setNear: (id) => {
    if (get().nearId !== id) {
      log('근접 %s → %s', get().nearId ?? '없음', id ?? '없음')
      set({ nearId: id })
    }
    // 걸어서 멀어지는 것이 곧 닫기다. 값이 바뀌는 순간이 아니라 매번 확인한다 —
    // 활성 스테이션이 처음부터 근접 밖이면 전환이 일어나지 않아 영영 안 닫힌다.
    // requestClose는 active에서만 받으므로 반복 호출은 무시된다.
    const { activeId, phase } = get()
    if (phase === 'active' && activeId !== null && id !== activeId) get().requestClose()
  },
  activate: (id) => {
    const { phase, nearId, visited } = get()
    if (phase !== 'idle' || nearId !== id) return
    log('%s 열기 — 진입 애니메이션 시작', id)
    set({
      activeId: id,
      phase: 'entering',
      visited: visited[id] ? visited : { ...visited, [id]: true },
    })
  },
  enterComplete: () => {
    if (get().phase !== 'entering') return
    log('%s 진입 애니메이션 끝 — 활성', get().activeId)
    set({ phase: 'active' })
  },
  requestClose: () => {
    if (get().phase !== 'active') return
    log('%s 닫기 — 종료 애니메이션 시작', get().activeId)
    set({ phase: 'exiting' })
  },
  exitComplete: () => {
    if (get().phase !== 'exiting') return
    log('%s 종료 애니메이션 끝 — 대기', get().activeId)
    set({ activeId: null, phase: 'idle' })
  },
  closeImmediately: () => {
    if (get().phase === 'idle' && get().activeId === null) return
    log('%s 즉시 닫기(연출 없음)', get().activeId)
    set({ activeId: null, phase: 'idle' })
  },
}))

/**
 * 진입 애니메이션 중에만 캐릭터 이동이 잠긴다.
 * 종료 중에는 잠그지 않는다 — 걸어나가는 것이 종료 트리거라 잠그면 그 자리에서 멈칫한다.
 */
export const isMovementLocked = (phase: StationPhase) => phase === 'entering'
