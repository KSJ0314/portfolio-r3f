import { create } from 'zustand'
import {
  DEFAULT_INTRO_PAGE_AREA,
  DEFAULT_INTRO_PAGE_LAYOUT,
} from '../stations/sections/about/AboutIntro/AboutIntro.constants'
import type { IntroPageLayout } from '../stations/sections/about/AboutIntro/AboutIntro.constants'
import type { StationArea } from '../stations/types'

interface IntroPageState {
  /** Intro 페이지 영역. 클릭 판정 범위이자 근접 판정 기준이다. */
  area: StationArea
  /** 페이지 안의 배치 값(여백·글씨 크기·사진 크기). */
  layout: IntroPageLayout
  /** 영역 테두리를 그릴지. 범위를 눈으로 확인하는 개발용이라 기본은 끔. */
  showOutline: boolean
  setArea: (area: StationArea) => void
  setLayout: (layout: IntroPageLayout) => void
  setShowOutline: (show: boolean) => void
}

/**
 * Intro 페이지의 개발용 튜닝 상태.
 * 프로덕션에서는 HUD가 렌더되지 않아 항상 기본값이다.
 * 여기서 맞춘 값을 aboutIntro.constants.ts에 반영하면 확정된다.
 */
export const useIntroPageStore = create<IntroPageState>((set) => ({
  area: DEFAULT_INTRO_PAGE_AREA,
  layout: DEFAULT_INTRO_PAGE_LAYOUT,
  showOutline: false,
  setArea: (area) => set({ area }),
  setLayout: (layout) => set({ layout }),
  setShowOutline: (showOutline) => set({ showOutline }),
}))
