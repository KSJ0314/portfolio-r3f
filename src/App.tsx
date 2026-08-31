import { Route, Routes } from 'react-router-dom'
import { ThemeProvider } from 'styled-components'
import { GlobalStyle } from './styles/GlobalStyle'
import { themes } from './theme/themes'
import { useThemeStore } from './state/useThemeStore'
import { MainPage } from './pages/MainPage'
import { CrayonStudioPage } from './pages/CrayonStudioPage'
import { ListViewPage } from './pages/ListViewPage'
import { ProjectsLobbyPage } from './pages/ProjectsLobbyPage'
import { ProjectsGalleryPage } from './pages/ProjectsGalleryPage'
import { CRAYON_ROUTE, GALLERY_ROUTE, LIST_ROUTE, LOBBY_ROUTE, MAIN_ROUTE } from './routes'
import { SceneTransition } from './ui/SceneTransition'
import { AppErrorBoundary } from './ui/AppErrorBoundary'
import { ErrorPage } from './ui/ErrorPage'

/**
 * 앱 셸. 테마·전역 스타일·라우트를 갖고, 라우트보다 위에 있어야 하는 것(전환 덮개·안내)을 둔다.
 * 화면 하나하나는 `pages/` 밑의 페이지 컴포넌트가 그린다.
 */
export function App() {
  const mode = useThemeStore((s) => s.mode)

  return (
    <ThemeProvider theme={themes[mode]}>
      <GlobalStyle />
      {/* 어느 화면이 깨지든 여기까지 올라온다. 씬 안은 `SceneErrorBoundary`가 따로 받는다. */}
      <AppErrorBoundary>
        <Routes>
          <Route path={MAIN_ROUTE} element={<MainPage />} />
          <Route path={LOBBY_ROUTE} element={<ProjectsLobbyPage />} />
          <Route path={GALLERY_ROUTE} element={<ProjectsGalleryPage />} />
          <Route path={LIST_ROUTE} element={<ListViewPage />} />
          <Route path={CRAYON_ROUTE} element={<CrayonStudioPage />} />
          {/* SPA rewrite로 오타 주소도 여기까지 오므로, 받아 줄 자리를 끝에 둔다. */}
          <Route path="*" element={<ErrorPage message="찾으시는 페이지가 없습니다." action="home" />} />
        </Routes>
      </AppErrorBoundary>
      {/* 장면 전환 덮개도 라우트보다 위다 — 페이지가 통째로 갈리는 동안 남아 화면을 덮는다. */}
      <SceneTransition />
    </ThemeProvider>
  )
}
