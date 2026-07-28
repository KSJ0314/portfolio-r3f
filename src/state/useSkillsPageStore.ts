import { create } from 'zustand'
import {
  SKILLS_AREA,
  SKILLS_TOP_LEFT,
} from '../stations/sections/about/AboutSkills/AboutSkills.constants'
import {
  SKILLS_BOX_LOGO,
  SKILLS_BOX_PLACEMENT,
} from '../stations/sections/about/AboutSkills/SkillsBox/SkillsBox.constants'
import { GUIDE_ARROW_PLACEMENT } from '../stations/sections/about/AboutSkills/SkillsGuideArrow/SkillsGuideArrow.constants'
import { SKILLS_EXIT } from '../stations/sections/about/AboutSkills/SkillsExit/SkillsExit.constants'
import { SKILLS_PAGER } from '../stations/sections/about/AboutSkills/SkillsPager/SkillsPager.constants'
import { SKILLS_LEVEL } from '../stations/sections/about/AboutSkills/SkillsPages/SkillItem/SkillLevel/SkillLevel.constants'
import { SKILLS_LIST_LAYOUT } from '../stations/sections/about/AboutSkills/SkillsPages/SkillsPages.constants'
import { SKILLS_TITLE } from '../stations/sections/about/AboutSkills/SkillsTitle/SkillsTitle.constants'
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

/** 종이 스티커로 붙인 공구함 그림의 배치·모양. */
export interface SkillsBoxPlacement {
  /** 그림 세로의 월드 크기(테두리·그림자 여백 제외). 가로는 그림 비율에서 나온다. */
  height: number
  /** 영역 중심 기준 오프셋(월드 x, z). */
  x: number
  z: number
  /** 종이 테두리 폭 — 그림 짧은 변 대비 비율. */
  border: number
  /** 그림자 흐림 폭(같은 비율 기준). */
  shadowBlur: number
  /** 그림자가 밀리는 거리(같은 비율 기준). */
  shadowDistance: number
  /** 그림자 진하기(0~1). */
  shadowOpacity: number
}

/** 활성 상태에서 로고처럼 놓이는 공구함의 자세. */
export interface SkillsBoxLogo {
  /** 평소 크기에 곱하는 배율. */
  scale: number
  /** 영역 좌상단에서 안쪽으로 들이는 거리(월드 x, z). 그림 중심 기준이다. */
  x: number
  z: number
  /** y축 회전(도). 양수가 반시계다. */
  rotation: number
}

/** 로고 옆 손글씨 제목의 배치. */
export interface SkillsTitlePlacement {
  /** 글자 크기. */
  size: number
  /** 로고 중심에서 오른쪽으로 띄우는 거리. */
  gap: number
  /** 세로 보정. 양수면 위로 올라간다. */
  offsetY: number
}

/** 기술 목록의 배치. */
export interface SkillsListLayout {
  /** 영역 위 테두리에서 목록이 시작하는 곳까지의 거리. */
  top: number
  /** 좌우 여백. */
  paddingX: number
  /** 두 열 사이 간격. */
  columnGap: number
  /** 항목 사이 세로 간격. */
  itemGap: number
  /** 기술 이름 글자 크기. */
  nameSize: number
  /** 이름과 설명 사이 간격. */
  nameGap: number
  /** 설명 글자 크기. */
  bodySize: number
  /** 설명 줄 간격(글자 크기 배수). */
  bodyLineHeight: number
}

/** 기술 이름 오른쪽에 붙는 레벨 별의 배치. */
export interface SkillsLevelPlacement {
  /** 별 하나의 세로 크기. */
  size: number
  /** 이름과 첫 별 사이 간격. */
  gap: number
  /** 별 사이 간격. */
  starGap: number
  /** 세로 보정. 양수면 위로 올라간다. */
  offsetY: number
  /** 종이 테두리 폭 — 그림 짧은 변 대비 비율. */
  border: number
  /** 그림자 흐림 폭(같은 비율 기준). */
  shadowBlur: number
  /** 그림자가 밀리는 거리(같은 비율 기준). */
  shadowDistance: number
  /** 그림자 진하기(0~1). */
  shadowOpacity: number
}

/** 우상단 나가기 X의 배치. */
export interface SkillsExitPlacement {
  /** 아이콘 한 변의 크기. */
  size: number
  /** 오른쪽 끝에서 들이는 거리. */
  right: number
  /** 위 끝에서 내리는 거리. */
  top: number
}

/** 페이지 넘김 글씨의 배치. */
export interface SkillsPagerPlacement {
  /** 글자 크기. */
  size: number
  /** 오른쪽 끝에서 들이는 거리. */
  right: number
  /** 아래 끝에서 올리는 거리. */
  bottom: number
}

interface SkillsPageState {
  /** Skills 영역. 클릭 판정 범위이자 근접 판정 기준이다. */
  area: StationArea
  /** 영역 좌상단 꼭지점. 여기서 크기만큼 +x·+z로 펼쳐진다. */
  topLeft: AreaCorner
  /** 영역 테두리를 그릴지. 범위를 눈으로 확인하는 개발용이라 기본은 끔. */
  showOutline: boolean
  /** 공구함 스티커의 배치·모양. */
  box: SkillsBoxPlacement
  /** 활성 상태에서 로고처럼 놓이는 자세. */
  logo: SkillsBoxLogo
  /** 로고 옆 제목의 배치. */
  title: SkillsTitlePlacement
  /** 기술 목록의 배치. */
  list: SkillsListLayout
  /** 레벨 별의 배치. */
  level: SkillsLevelPlacement
  /** 페이지 넘김 글씨의 배치. */
  pager: SkillsPagerPlacement
  /** 나가기 X의 배치. */
  exit: SkillsExitPlacement
  /** 바닥 화살표의 배치·연출. */
  guide: GuideArrowPlacement
  /** 값이 바뀌면 화살표를 새로 마운트해 그리는 연출을 다시 재생한다(HUD 버튼). */
  guideRedraw: number
  setArea: (area: StationArea) => void
  setTopLeft: (topLeft: AreaCorner) => void
  setShowOutline: (show: boolean) => void
  setBox: (box: SkillsBoxPlacement) => void
  setLogo: (logo: SkillsBoxLogo) => void
  setTitle: (title: SkillsTitlePlacement) => void
  setList: (list: SkillsListLayout) => void
  setLevel: (level: SkillsLevelPlacement) => void
  setPager: (pager: SkillsPagerPlacement) => void
  setExit: (exit: SkillsExitPlacement) => void
  setGuide: (guide: GuideArrowPlacement) => void
  redrawGuide: () => void
}

/**
 * Skills 페이지의 개발용 튜닝 상태.
 * 프로덕션에서는 HUD가 렌더되지 않아 항상 기본값이다.
 * 여기서 맞춘 값을 AboutSkills.constants.ts에 반영하면 확정된다.
 */
export const useSkillsPageStore = create<SkillsPageState>((set) => ({
  area: { ...SKILLS_AREA },
  topLeft: { ...SKILLS_TOP_LEFT },
  showOutline: false,
  box: { ...SKILLS_BOX_PLACEMENT },
  logo: { ...SKILLS_BOX_LOGO },
  title: { ...SKILLS_TITLE },
  list: { ...SKILLS_LIST_LAYOUT },
  level: { ...SKILLS_LEVEL },
  pager: { ...SKILLS_PAGER },
  exit: { ...SKILLS_EXIT },
  guide: { ...GUIDE_ARROW_PLACEMENT },
  guideRedraw: 0,
  setArea: (area) => set({ area }),
  setTopLeft: (topLeft) => set({ topLeft }),
  setShowOutline: (showOutline) => set({ showOutline }),
  setBox: (box) => set({ box }),
  setLogo: (logo) => set({ logo }),
  setTitle: (title) => set({ title }),
  setList: (list) => set({ list }),
  setLevel: (level) => set({ level }),
  setPager: (pager) => set({ pager }),
  setExit: (exit) => set({ exit }),
  setGuide: (guide) => set({ guide }),
  redrawGuide: () => set((s) => ({ guideRedraw: s.guideRedraw + 1 })),
}))
