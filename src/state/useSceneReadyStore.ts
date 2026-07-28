import { create } from 'zustand'

interface SceneReadyState {
  /** 준비를 마친 것들. 각 요소가 마운트되면서 자기 이름을 올린다. */
  ready: Record<string, boolean>
  /** 준비됐음을 알린다. 같은 이름을 다시 올려도 상태가 바뀌지 않는다. */
  markReady: (key: string) => void
}

/**
 * 첫 화면에 필요한 것들이 준비됐는지 모으는 곳.
 *
 * 텍스처는 저마다 다른 Suspense 경계에서 준비되므로 준비되는 대로 하나씩 나타난다.
 * 그러면 바닥보다 그 위의 그림이 먼저 뜨는 것처럼 순서가 뒤집혀 보이기도 한다.
 * 그래서 첫 화면을 가려두는 쪽(SceneGate)이 무엇을 기다릴지 여기서 확인한다.
 *
 * three의 `LoadingManager`를 쓰지 않는 이유는, 그것이 "시작된 전부"를 세기 때문이다.
 * 첫 화면과 무관한 것까지 함께 기다리게 되므로 필요한 것만 골라 확인한다.
 */
export const useSceneReadyStore = create<SceneReadyState>((set) => ({
  ready: {},
  markReady: (key) =>
    set((state) => (state.ready[key] ? state : { ready: { ...state.ready, [key]: true } })),
}))
