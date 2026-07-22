import { ThemeProvider } from 'styled-components'
import { GlobalStyle } from './styles/GlobalStyle'
import { themes } from './theme/themes'
import { useThemeStore } from './state/useThemeStore'
import { Experience } from './scene/Experience'
import { Minimap } from './ui/Minimap'
import { DebugHUD } from './ui/DebugHUD'
import { GridPaperHUD } from './ui/GridPaperHUD'
import { IntroPageHUD } from './ui/IntroPageHUD'
import { StationLifecycle } from './features/stations'

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
      {import.meta.env.DEV && <DebugHUD />}
      {/* 모눈종이 바닥 텍스처 튜닝 패널(leva) — 값 확정 후 gridPaper.constants.ts에 반영한다. */}
      {import.meta.env.DEV && <GridPaperHUD />}
      {/* Intro 페이지 영역 튜닝(leva) — 패널은 GridPaperHUD가 그리고 값만 얹는다. */}
      {import.meta.env.DEV && <IntroPageHUD />}
    </ThemeProvider>
  )
}

export default App
