import { Component, type ReactNode } from 'react'
import { ErrorPage } from '../ErrorPage'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

/**
 * 앱 전체의 마지막 방어선. 라우트 바깥에 두어 어느 화면에서 던지든 여기까지 올라온다.
 *
 * 씬 안은 `scene/SceneErrorBoundary`가 따로 받는다(아무것도 그리지 않고 나머지 씬을 살린다).
 * 여기는 그 바깥 — Canvas 밖 UI나 페이지 자체가 깨진 경우이고, 화면이 통째로 비므로 안내를 그린다.
 */
export class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: unknown) {
    console.error('[app] 렌더 중 에러로 화면을 중단함', error)
  }

  render() {
    if (this.state.hasError) return <ErrorPage message="화면을 그리지 못했습니다." action="reload" />
    return this.props.children
  }
}
