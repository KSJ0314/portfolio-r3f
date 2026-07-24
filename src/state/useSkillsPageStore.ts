import { create } from 'zustand'
import {
  SKILLS_AREA,
  SKILLS_TOP_LEFT,
} from '../stations/sections/about/AboutSkills/AboutSkills.constants'
import type { StationArea } from '../stations/types'

/** 영역 좌상단 꼭지점(월드 x, z). */
export interface AreaCorner {
  x: number
  z: number
}

interface SkillsPageState {
  /** Skills 영역. 클릭 판정 범위이자 근접 판정 기준이다. */
  area: StationArea
  /** 영역 좌상단 꼭지점. 여기서 크기만큼 +x·+z로 펼쳐진다. */
  topLeft: AreaCorner
  /** 영역 테두리를 그릴지. 범위를 눈으로 확인하는 개발용이라 기본은 끔. */
  showOutline: boolean
  setArea: (area: StationArea) => void
  setTopLeft: (topLeft: AreaCorner) => void
  setShowOutline: (show: boolean) => void
}

/**
 * Skills 페이지의 개발용 튜닝 상태.
 * 프로덕션에서는 HUD가 렌더되지 않아 항상 기본값이다.
 * 여기서 맞춘 값을 AboutSkills.constants.ts에 반영하면 확정된다.
 */
export const useSkillsPageStore = create<SkillsPageState>((set) => ({
  area: SKILLS_AREA,
  topLeft: { ...SKILLS_TOP_LEFT },
  showOutline: false,
  setArea: (area) => set({ area }),
  setTopLeft: (topLeft) => set({ topLeft }),
  setShowOutline: (showOutline) => set({ showOutline }),
}))
