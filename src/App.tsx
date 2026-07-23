import { ThemeProvider } from 'styled-components'
import { GlobalStyle } from './styles/GlobalStyle'
import { themes } from './theme/themes'
import { useThemeStore } from './state/useThemeStore'
import { Experience } from './scene/Experience'
import { Minimap } from './ui/Minimap'
import { DevHUD } from './ui/DevHUD'
import { StationLifecycle } from './stations'

function App() {
  const mode = useThemeStore((s) => s.mode)

  return (
    <ThemeProvider theme={themes[mode]}>
      <GlobalStyle />
      <Experience />
      {/* 활성 스테이션의 2D 상세 자리 + ESC 종료 + 미구현 스테이션 fallback */}
      <StationLifecycle />
      {/* 테마 토글은 밤 테마를 제대로 구현할 때 다시 단다(지금은 종이만 어두워진다). */}
      <Minimap />
      {/* 개발용 HUD 묶음(디버그 상태 + leva 튜닝 패널). dev에서만 렌더돼 프로덕션 번들에서 빠진다. */}
      {import.meta.env.DEV && <DevHUD />}
    </ThemeProvider>
  )
}

export default App
