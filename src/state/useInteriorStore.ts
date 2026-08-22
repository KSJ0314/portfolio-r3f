import { create } from 'zustand'
import { Vector3 } from 'three'

interface InteriorState {
  /** 캐릭터 현재 위치. y는 밟는 바닥에서 나오므로 걷는 쪽이 매 프레임 채운다. */
  position: Vector3
  /** 걸어갈 목표점. 바닥에 레이캐스트해 정하므로 y도 그 지점의 높이다. */
  target: Vector3
  /** 목표점을 설정한다. 경계는 두지 않는다 — 밟을 바닥이 있는 곳까지가 곧 갈 수 있는 곳이다. */
  setTarget: (point: Vector3) => void
  /** 들어올 때 그 방의 시작 자리로 되돌린다. */
  reset: (start: readonly [number, number]) => void
}

/**
 * 실내(로비·전시 공간)에서의 이동 상태.
 *
 * 맵의 `useCameraStore`를 그대로 쓰지 않는다 — 그쪽은 `CAMERA_BOUNDS` clamp와 y=0 고정이
 * 규칙으로 박혀 있어 층이 있는 실내와 맞지 않는다.
 * 다만 **조작 규칙은 같게** 옮긴다(고정 속도 한 걸음 · 우클릭 홀드) — 안팎의 조작감이 달라지면 안 된다.
 *
 * **방마다 나누지 않는다.** 실내는 라우트로 갈려 두 방이 동시에 뜨는 일이 없고, 방마다 스토어를
 * 두면 공통 부품이 어느 것을 볼지 몰라 결국 스토어를 props로 넘기게 된다. 시작 자리만 방이 준다.
 */
export const useInteriorStore = create<InteriorState>((_set, get) => ({
  position: new Vector3(),
  target: new Vector3(),
  setTarget: (point) => {
    get().target.copy(point)
  },
  reset: (start) => {
    // 좌표만 갈아 끼운다. 구독하는 쪽은 벡터를 그대로 들고 매 프레임 읽는다.
    get().position.set(start[0], 0, start[1])
    get().target.set(start[0], 0, start[1])
  },
}))
