import { Route, Routes } from 'react-router-dom'
import { ThemeProvider } from 'styled-components'
import App from './App'
import { GlobalStyle } from './styles/GlobalStyle'
import { themes } from './theme/themes'
import { useThemeStore } from './state/useThemeStore'
import { CrayonStudioPage } from './tools/CrayonStudio'
import { LOBBY_ROUTE, ProjectsLobbyPage } from './stations/sections/projects/ProjectsLobby'
import { SceneTransition } from './ui/SceneTransition'

/** 라우트 셸. 테마·전역 스타일은 페이지가 공유하므로 라우트보다 위에 둔다. */
export function Root() {
  const mode = useThemeStore((s) => s.mode)

  return (
    <ThemeProvider theme={themes[mode]}>
      <GlobalStyle />
      <Routes>
        <Route path="/" element={<App />} />
        <Route path={LOBBY_ROUTE} element={<ProjectsLobbyPage />} />
        <Route path="/crayon" element={<CrayonStudioPage />} />
      </Routes>
      {/* 장면 전환 덮개도 라우트보다 위다 — 페이지가 통째로 갈리는 동안 남아 화면을 덮는다. */}
      <SceneTransition />
    </ThemeProvider>
  )
}
