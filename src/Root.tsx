import { Route, Routes } from 'react-router-dom'
import { ThemeProvider } from 'styled-components'
import App from './App'
import { GlobalStyle } from './styles/GlobalStyle'
import { themes } from './theme/themes'
import { useThemeStore } from './state/useThemeStore'
import { CrayonStudioPage } from './tools/CrayonStudio'
import { LOBBY_ROUTE, ProjectsLobbyPage } from './stations/sections/projects/ProjectsLobby'
import { GALLERY_ROUTE, ProjectsGalleryPage } from './stations/sections/projects/ProjectsGallery'
import { SceneTransition } from './ui/SceneTransition'
import { AppErrorBoundary } from './ui/AppErrorBoundary'
import { ErrorPage } from './ui/ErrorPage'

/** 라우트 셸. 테마·전역 스타일은 페이지가 공유하므로 라우트보다 위에 둔다. */
export function Root() {
  const mode = useThemeStore((s) => s.mode)

  return (
    <ThemeProvider theme={themes[mode]}>
      <GlobalStyle />
      {/* 어느 화면이 깨지든 여기까지 올라온다. 씬 안은 `SceneErrorBoundary`가 따로 받는다. */}
      <AppErrorBoundary>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path={LOBBY_ROUTE} element={<ProjectsLobbyPage />} />
          <Route path={GALLERY_ROUTE} element={<ProjectsGalleryPage />} />
          <Route path="/crayon" element={<CrayonStudioPage />} />
          {/* SPA rewrite로 오타 주소도 여기까지 오므로, 받아 줄 자리를 끝에 둔다. */}
          <Route path="*" element={<ErrorPage message="찾으시는 페이지가 없습니다." action="home" />} />
        </Routes>
      </AppErrorBoundary>
      {/* 장면 전환 덮개도 라우트보다 위다 — 페이지가 통째로 갈리는 동안 남아 화면을 덮는다. */}
      <SceneTransition />
    </ThemeProvider>
  )
}
