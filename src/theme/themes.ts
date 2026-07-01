export type ThemeMode = 'light' | 'dark'

export interface SceneColors {
  background: string
  ambient: string
  ambientIntensity: number
  directional: string
  directionalIntensity: number
  ground: string
}

export interface AppTheme {
  name: ThemeMode
  colors: {
    background: string
    surface: string
    text: string
    accent: string
    border: string
  }
  scene: SceneColors
}

export const lightTheme: AppTheme = {
  name: 'light',
  colors: {
    background: '#f6f1e7',
    surface: '#ffffff',
    text: '#2b2a28',
    accent: '#7c9cff',
    border: '#e3ddcf',
  },
  scene: {
    background: '#bfe3ff',
    ambient: '#ffffff',
    ambientIntensity: 0.9,
    directional: '#fff2d0',
    directionalIntensity: 1.3,
    ground: '#cfe8bf',
  },
}

export const darkTheme: AppTheme = {
  name: 'dark',
  colors: {
    background: '#131219',
    surface: '#1e1d29',
    text: '#e9e8f2',
    accent: '#a98bff',
    border: '#2c2a3a',
  },
  scene: {
    background: '#0a0a18',
    ambient: '#3a3a6a',
    ambientIntensity: 0.35,
    directional: '#8ea2ff',
    directionalIntensity: 0.6,
    ground: '#24331f',
  },
}

export const themes: Record<ThemeMode, AppTheme> = {
  light: lightTheme,
  dark: darkTheme,
}
