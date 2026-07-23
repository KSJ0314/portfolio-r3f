import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  /** 에러가 잡혔을 때 대신 그릴 것. 3D 씬 안이므로 기본은 아무것도 안 그린다. */
  fallback?: ReactNode
}

interface State {
  hasError: boolean
}

/**
 * 씬 안전망. 하위 렌더 중 던져진 에러를 잡아 **앱 전체가 언마운트되는 것**을 막는다.
 *
 * 각 컴포넌트가 스스로 실패를 처리하는 게 먼저이고(예: 사진은 자체 재시도),
 * 이 경계는 거기서 놓친 예기치 못한 에러의 마지막 방어선이다.
 * 한 번 잡으면 fallback에서 멈춘다 — 자동 복구는 하지 않는다.
 */
export class SceneErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: unknown) {
    console.error('[scene] 렌더 중 에러로 씬을 중단함', error)
  }

  render() {
    if (this.state.hasError) return this.props.fallback ?? null
    return this.props.children
  }
}
