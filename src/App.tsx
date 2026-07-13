import { ThemeProvider } from 'styled-components'
import { GlobalStyle } from './styles/GlobalStyle'
import { themes } from './theme/themes'
import { useThemeStore } from './state/useThemeStore'
import { Experience } from './scene/Experience'
import { ThemeToggle } from './ui/ThemeToggle'
import { Minimap } from './ui/Minimap'
import { DebugHUD } from './ui/DebugHUD'
import { StationLifecycle } from './features/stations'

function App() {
  const mode = useThemeStore((s) => s.mode)

  return (
    <ThemeProvider theme={themes[mode]}>
      <GlobalStyle />
      <Experience />
      {/* 활성 스테이션의 2D 상세 자리 + ESC 종료 + 미구현 스테이션 fallback */}
      <StationLifecycle />
      <ThemeToggle />
      <Minimap />
      {import.meta.env.DEV && <DebugHUD />}
    </ThemeProvider>
  )
}

export default App
