import { create } from 'zustand'
import { IRIS_CLOSE_SECONDS } from '../ui/SceneTransition/SceneTransition.constants'

/**
 * 장면 전환 단계.
 *
 * ```
 * idle ──close(to)──> closing ──다 덮임──> covered ──도착 + 최소 유지──> opening ──> idle
 *                                            │
 *                                     그 사이에 라우트가 갈린다
 * ```
 */
export type SceneTransitionPhase = 'idle' | 'closing' | 'covered' | 'opening'

interface SceneTransitionState {
  phase: SceneTransitionPhase
  /** 다 덮인 뒤에 갈 경로. 덮개가 직접 옮긴다. */
  to: string | null
  /** 도착한 페이지가 그릴 준비를 마쳤는지. 이것이 켜져야 덮개를 연다. */
  arrived: boolean
  /**
   * 덮개가 조여드는 중심(화면 비율 0~1, 좌상단이 0·0). 기본은 화면 한가운데다.
   *
   * 매 프레임 갱신되는 값이라 `set` 없이 좌표만 바꾼다(구독 알림 없음) —
   * `useCameraStore.position`과 같은 방식이다. 다른 곳으로 모아야 하는 씬이 매 프레임 채운다.
   */
  focus: { x: number; y: number }
  /**
   * 지금 전환의 조여드는 시간(초). 부르는 쪽이 정하지 않으면 기본값이다.
   * 걸어 들어가는 걸음과 함께 도는 구간이라 장면마다 다르다.
   */
  closeSeconds: number
  /**
   * 덮기 시작한다. 이미 전환 중이면 무시한다 — 겹쳐 부르면 가던 곳이 바뀐다.
   * 조여드는 시간을 주면 이번 전환에만 쓰인다.
   */
  close: (to: string, seconds?: number) => void
  /** 다 덮였음을 알린다(덮개가 부른다). */
  markCovered: () => void
  /** 도착한 페이지가 준비됐음을 알린다. */
  markArrived: () => void
  /** 열기 시작한다(덮개가 부른다 — 언제 열지는 덮개가 최소·최대 유지 시간으로 정한다). */
  beginOpen: () => void
  /** 다 열렸음을 알린다(덮개가 부른다). */
  markOpened: () => void
}

/**
 * 라우트를 옮기는 동안 화면을 덮는 전환 상태.
 *
 * 페이지가 통째로 갈리므로 덮개는 라우트보다 위(`Root`)에 있고, 이 스토어가 그것과 페이지 사이의
 * 유일한 연결이다. **다 덮인 뒤에 옮기고, 도착한 쪽이 준비를 알려야 연다** — 덮인 채로 기다리므로
 * 모델을 받는 동안에도 화면이 끊기지 않는다.
 */
export const useSceneTransitionStore = create<SceneTransitionState>((set, get) => ({
  phase: 'idle',
  to: null,
  arrived: false,
  focus: { x: 0.5, y: 0.5 },
  closeSeconds: IRIS_CLOSE_SECONDS,
  close: (to, seconds) => {
    if (get().phase !== 'idle') return
    // 중심을 화면 한가운데로 되돌린다. 다른 곳으로 모아야 하는 씬은 그동안 매 프레임 다시 채운다.
    get().focus.x = 0.5
    get().focus.y = 0.5
    set({ phase: 'closing', to, arrived: false, closeSeconds: seconds ?? IRIS_CLOSE_SECONDS })
  },
  markCovered: () => {
    if (get().phase === 'closing') set({ phase: 'covered' })
  },
  markArrived: () => {
    // 전환 없이 직접 들어온 경우에도 페이지가 부르므로, 기다리는 중이 아니면 아무 일도 하지 않는다.
    if (get().phase === 'covered' && !get().arrived) set({ arrived: true })
  },
  beginOpen: () => {
    if (get().phase === 'covered') set({ phase: 'opening' })
  },
  markOpened: () => {
    if (get().phase === 'opening') set({ phase: 'idle', to: null, arrived: false })
  },
}))

/** 지금 화면이 덮여 있는지 — 덮는 중·덮인 채 기다리는 중. 그동안 입력을 받지 않는다. */
export const isSceneCovered = (phase: SceneTransitionPhase) =>
  phase === 'closing' || phase === 'covered'
