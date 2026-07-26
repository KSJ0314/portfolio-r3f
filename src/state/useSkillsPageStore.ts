import { create } from 'zustand'
import {
  SKILLS_AREA,
  SKILLS_TOP_LEFT,
} from '../stations/sections/about/AboutSkills/AboutSkills.constants'
import { GUIDE_ARROW_PLACEMENT } from '../stations/sections/about/AboutSkills/SkillsGuideArrow/SkillsGuideArrow.constants'
import type { StationArea } from '../stations/types'

/** 영역 좌상단 꼭지점(월드 x, z). */
export interface AreaCorner {
  x: number
  z: number
}

/** Skills로 가는 바닥 화살표의 배치·연출. */
export interface GuideArrowPlacement {
  /** 기준 크기에 곱하는 배율. 획 굵기도 같이 곱해져 그림째 확대된다. */
  scale: number
  /** 그림 좌상단 꼭지점(월드 x, z). */
  x: number
  z: number
  /** y축 회전(도). 좌상단 꼭지점을 축으로 돈다. */
  rotation: number
  /** 처음부터 끝까지 그어지는 데 걸리는 시간(초). */
  seconds: number
}

interface SkillsPageState {
  /** Skills 영역. 클릭 판정 범위이자 근접 판정 기준이다. */
  area: StationArea
  /** 영역 좌상단 꼭지점. 여기서 크기만큼 +x·+z로 펼쳐진다. */
  topLeft: AreaCorner
  /** 영역 테두리를 그릴지. 범위를 눈으로 확인하는 개발용이라 기본은 끔. */
  showOutline: boolean
  /** 바닥 화살표의 배치·연출. */
  guide: GuideArrowPlacement
  /** 값이 바뀌면 화살표를 새로 마운트해 그리는 연출을 다시 재생한다(HUD 버튼). */
  guideRedraw: number
  setArea: (area: StationArea) => void
  setTopLeft: (topLeft: AreaCorner) => void
  setShowOutline: (show: boolean) => void
  setGuide: (guide: GuideArrowPlacement) => void
  redrawGuide: () => void
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
  guide: { ...GUIDE_ARROW_PLACEMENT },
  guideRedraw: 0,
  setArea: (area) => set({ area }),
  setTopLeft: (topLeft) => set({ topLeft }),
  setShowOutline: (showOutline) => set({ showOutline }),
  setGuide: (guide) => set({ guide }),
  redrawGuide: () => set((s) => ({ guideRedraw: s.guideRedraw + 1 })),
}))
