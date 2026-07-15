export type ThemeMode = 'light' | 'dark'

export interface SceneColors {
  /** 바닥 바깥의 여백 색. 하늘이 아니라 종이 밖 여백이다(스케치북 컨셉엔 하늘이 없다). */
  background: string
  ambient: string
  ambientIntensity: number
  directional: string
  directionalIntensity: number
}

export interface AppFonts {
  /** 읽어야 하는 내용(이력서·방명록·본문). 가독성과 인쇄를 위해 Pretendard. */
  body: string
  /** 컨셉을 만드는 손글씨(스테이션 라벨·표지판·제목). */
  hand: string
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
  fonts: AppFonts
  scene: SceneColors
}

/** 폰트는 낮/밤에 따라 달라지지 않으므로 두 테마가 함께 쓴다. */
const fonts: AppFonts = {
  body: "Pretendard, system-ui, -apple-system, 'Segoe UI', sans-serif",
  hand: "'Gamja Flower', Pretendard, system-ui, sans-serif",
}

export const lightTheme: AppTheme = {
  name: 'light',
  colors: {
    background: '#ffffff',
    surface: '#ffffff',
    text: '#2b2a28',
    accent: '#7c9cff',
    // 모눈 선과 같은 계열의 회색. UI 테두리도 종이에 그은 선처럼 보이게 한다.
    border: '#e0e0e0',
  },
  scene: {
    background: '#ffffff',
    ambient: '#ffffff',
    ambientIntensity: 0.9,
    directional: '#fff2d0',
    directionalIntensity: 1.3,
  },
  fonts,
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
    // 밤에도 하늘이 아니라 어두워진 여백이다.
    background: '#14141c',
    ambient: '#3a3a6a',
    ambientIntensity: 0.35,
    directional: '#8ea2ff',
    directionalIntensity: 0.6,
  },
  fonts,
}

export const themes: Record<ThemeMode, AppTheme> = {
  light: lightTheme,
  dark: darkTheme,
}
