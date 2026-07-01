import { useThemeStore } from '../../state/useThemeStore'
import { ToggleButton } from './ThemeToggle.styled'

export function ThemeToggle() {
  const mode = useThemeStore((s) => s.mode)
  const toggle = useThemeStore((s) => s.toggle)

  return (
    <ToggleButton type="button" onClick={toggle}>
      {mode === 'light' ? '밤으로' : '낮으로'}
    </ToggleButton>
  )
}
