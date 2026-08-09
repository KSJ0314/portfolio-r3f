import { create } from 'zustand'
import {
  CAREER_AREA,
  CAREER_AREA_PADDING,
  CAREER_LOGO,
  CAREER_TOP_CENTER,
} from '../stations/sections/about/AboutCareer/AboutCareer.constants'
import {
  CAREER_DIVIDER,
  CAREER_LIST_LAYOUT,
} from '../stations/sections/about/AboutCareer/CareerColumns/CareerColumns.constants'
import { CAREER_EXIT } from '../stations/sections/about/AboutCareer/CareerExit/CareerExit.constants'
import {
  CAREER_EDUCATION,
  CAREER_SPEC,
} from '../stations/sections/about/AboutCareer/CareerPaper/CareerPaper.constants'
import { CAREER_TITLE } from '../stations/sections/about/AboutCareer/CareerTitles/CareerTitles.constants'
import { CAREER_TROPHY } from '../stations/sections/about/AboutCareer/CareerTrophy/CareerTrophy.constants'
import type { StationArea, StationAreaPadding } from '../stations/types'

/** 영역 상단 중앙(월드 x, z). 가로는 이 점을 가운데 두고 양옆으로, 세로는 아래로 펼쳐진다. */
export interface AreaAnchor {
  x: number
  z: number
}

/** 종이 위에 세워 둔 트로피 모델의 배치·그림자. */
export interface CareerTrophyPlacement {
  /** 모델 세로의 월드 크기. 가로·깊이는 모델 비율에서 나온다. */
  height: number
  /** 영역 중심 기준 오프셋(월드 x, z). */
  x: number
  z: number
  /** y축 회전(도). 양수가 반시계다. */
  rotation: number
  /** 로고가 될 때의 y축 회전(도). 눕히기 전에 먼저 돌아간다. */
  logoTurn: number
  /** 로고가 될 때 눕히는 각도(도, x축). */
  logoTilt: number
  /** 눕힌 뒤 화면 안에서 도는 각도(도). 음수가 시계방향이다. */
  logoRoll: number
  /** 로고로 가는 동안 추가로 도는 반 바퀴 수. */
  logoTurns: number
  /** 바닥 그림자가 뻗는 방향(도). */
  shadowAngle: number
  /** 바닥 그림자의 길이 배수. */
  shadowLength: number
  /** 바닥 그림자의 진하기(0~1). */
  shadowOpacity: number
}

/** 오려 붙인 종이 한 장(교육 과정·자격증)의 배치·모양. */
export interface CareerPaperPlacement {
  /** 그림 세로의 월드 크기(여백 제외). 가로는 그림 비율에서 나온다. */
  height: number
  /** 영역 중심 기준 오프셋(월드 x, z). */
  x: number
  z: number
  /** 눕힌 종이의 회전(도). 양수가 반시계다. */
  rotation: number
  /** 종이 테두리 폭 — 그림 짧은 변 대비 비율. */
  border: number
}

/** 활성 상태에서 그림들이 물러나 로고가 되는 자세. */
export interface CareerLogoPlacement {
  /** 로고의 세로 크기(월드 단위). 각자 자기 평소 크기 대비 배율을 구해 줄어든다. */
  height: number
  /** 영역 위 테두리에서 로고 중심까지 내려오는 거리. */
  top: number
  /** 칸 왼쪽 테두리에서 로고 왼쪽 끝까지 들이는 거리. */
  left: number
}

/** 로고 옆에 붙는 손글씨 제목의 배치. */
export interface CareerTitlePlacement {
  /** 글자 크기. */
  size: number
  /** 로고 중심에서 오른쪽으로 띄우는 거리. */
  gap: number
  /** 세로 보정. 양수면 위로 올라간다. */
  offsetY: number
}

/** 칸에 늘어놓는 목록의 배치. */
export interface CareerListLayout {
  /** 영역 위 테두리에서 목록이 시작하는 곳까지의 거리. */
  top: number
  /** 칸 좌우 여백. */
  paddingX: number
  /** 항목 사이 세로 간격. */
  itemGap: number
  /** 항목 제목 글자 크기. */
  titleSize: number
  /** 제목과 그 아래 첫 줄 사이 간격. */
  titleGap: number
  /** 본문과 그 아래 줄 사이 간격. */
  lineGap: number
  /** 본문 글자 크기. */
  bodySize: number
  /** 본문 줄 간격(글자 크기 배수). */
  bodyLineHeight: number
  /** 본문 왼쪽 인용 막대의 폭. */
  quoteBarWidth: number
  /** 인용 막대와 본문 사이 간격. */
  quoteBarGap: number
}

/** 칸을 가르는 세로선의 배치. 세로 전체를 긋지 않고 위아래를 들인다. */
export interface CareerDividerPlacement {
  /** 선의 폭. */
  width: number
  /** 영역 위 테두리에서 선이 시작하는 곳까지의 거리. */
  top: number
  /** 영역 아래 테두리에서 선이 끝나는 곳까지의 거리. */
  bottom: number
}

/** 우상단 나가기 X의 배치. */
export interface CareerExitPlacement {
  /** 아이콘 한 변의 크기. */
  size: number
  /** 오른쪽 끝에서 들이는 거리. */
  right: number
  /** 위 끝에서 내리는 거리. */
  top: number
}

interface CareerPageState {
  /** Career 영역. 클릭 판정 범위이자 근접 판정 기준이다. */
  area: StationArea
  /** 영역 상단 중앙. */
  topCenter: AreaAnchor
  /** 영역 테두리에서 내용까지 들이는 여백. 내용은 모두 이 안쪽을 기준으로 놓인다. */
  padding: StationAreaPadding
  /** 영역 테두리를 그릴지. 범위를 눈으로 확인하는 개발용이라 기본은 끔. */
  showOutline: boolean
  /** 트로피 모델의 배치·그림자. */
  trophy: CareerTrophyPlacement
  /** 교육 과정 종이의 배치. */
  education: CareerPaperPlacement
  /** 자격증 종이의 배치. */
  spec: CareerPaperPlacement
  /** 로고가 될 때의 자세. */
  logo: CareerLogoPlacement
  /** 칸 제목의 배치. */
  title: CareerTitlePlacement
  /** 칸 목록의 배치. */
  list: CareerListLayout
  /** 칸을 가르는 세로선의 배치. */
  divider: CareerDividerPlacement
  /** 나가기 X의 배치. */
  exit: CareerExitPlacement
  setArea: (area: StationArea) => void
  setTopCenter: (topCenter: AreaAnchor) => void
  setPadding: (padding: StationAreaPadding) => void
  setShowOutline: (show: boolean) => void
  setTrophy: (trophy: CareerTrophyPlacement) => void
  setEducation: (education: CareerPaperPlacement) => void
  setSpec: (spec: CareerPaperPlacement) => void
  setLogo: (logo: CareerLogoPlacement) => void
  setTitle: (title: CareerTitlePlacement) => void
  setList: (list: CareerListLayout) => void
  setDivider: (divider: CareerDividerPlacement) => void
  setExit: (exit: CareerExitPlacement) => void
}

/**
 * Career 페이지의 개발용 튜닝 상태.
 * 프로덕션에서는 HUD가 렌더되지 않아 항상 기본값이다.
 * 여기서 맞춘 값을 AboutCareer.constants.ts에 반영하면 확정된다.
 */
export const useCareerPageStore = create<CareerPageState>((set) => ({
  area: { ...CAREER_AREA },
  topCenter: { ...CAREER_TOP_CENTER },
  padding: { ...CAREER_AREA_PADDING },
  showOutline: false,
  trophy: { ...CAREER_TROPHY },
  education: { ...CAREER_EDUCATION },
  spec: { ...CAREER_SPEC },
  logo: { ...CAREER_LOGO },
  title: { ...CAREER_TITLE },
  list: { ...CAREER_LIST_LAYOUT },
  divider: { ...CAREER_DIVIDER },
  exit: { ...CAREER_EXIT },
  setArea: (area) => set({ area }),
  setTopCenter: (topCenter) => set({ topCenter }),
  setPadding: (padding) => set({ padding }),
  setShowOutline: (showOutline) => set({ showOutline }),
  setTrophy: (trophy) => set({ trophy }),
  setEducation: (education) => set({ education }),
  setSpec: (spec) => set({ spec }),
  setLogo: (logo) => set({ logo }),
  setTitle: (title) => set({ title }),
  setList: (list) => set({ list }),
  setDivider: (divider) => set({ divider }),
  setExit: (exit) => set({ exit }),
}))
