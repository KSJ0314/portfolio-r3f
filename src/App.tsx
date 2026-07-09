import { ThemeProvider } from 'styled-components'
import { GlobalStyle } from './styles/GlobalStyle'
import { themes } from './theme/themes'
import { useThemeStore } from './state/useThemeStore'
import { Experience } from './scene/Experience'
import { ThemeToggle } from './ui/ThemeToggle'
import { Minimap } from './ui/Minimap'
import { DebugHUD } from './ui/DebugHUD'

function App() {
  const mode = useThemeStore((s) => s.mode)

  return (
    <ThemeProvider theme={themes[mode]}>
      <GlobalStyle />
      <Experience />
      <ThemeToggle />
      <Minimap />
      {import.meta.env.DEV && <DebugHUD />}
    </ThemeProvider>
  )
}

export default App
