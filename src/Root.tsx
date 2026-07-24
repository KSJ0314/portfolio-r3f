import { Route, Routes } from 'react-router-dom'
import { ThemeProvider } from 'styled-components'
import App from './App'
import { GlobalStyle } from './styles/GlobalStyle'
import { themes } from './theme/themes'
import { useThemeStore } from './state/useThemeStore'
import { CrayonStudioPage } from './tools/CrayonStudio'

/** 라우트 셸. 테마·전역 스타일은 페이지가 공유하므로 라우트보다 위에 둔다. */
export function Root() {
  const mode = useThemeStore((s) => s.mode)

  return (
    <ThemeProvider theme={themes[mode]}>
      <GlobalStyle />
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/crayon" element={<CrayonStudioPage />} />
      </Routes>
    </ThemeProvider>
  )
}
