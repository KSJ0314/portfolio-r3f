import { create } from 'zustand'
import { CROSSWALK_PLACEMENT } from '../scene/MapDecorations/Crosswalk/Crosswalk.constants'
import { RIGHT_CLICK_HINT_PLACEMENT } from '../scene/MapDecorations/RightClickHint/RightClickHint.constants'
import { TRAFFIC_LIGHT_PLACEMENT } from '../scene/MapDecorations/TrafficLight/TrafficLight.constants'
import { GUIDE_ARROW_PLACEMENT } from '../scene/MapDecorations/SkillsGuideArrow/SkillsGuideArrow.constants'

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

/** 우클릭 안내 아이콘의 배치. */
export interface RightClickHintPlacement {
  /** 그림 세로의 월드 크기(여백 제외). 가로는 그림 비율에서 나온다. */
  height: number
  /** 그림 중심(월드 x, z). */
  x: number
  z: number
  /** y축 회전(도). 양수가 반시계다. */
  rotation: number
}

/** 횡단보도의 배치·연출. */
export interface CrosswalkPlacement {
  /** 기준 크기에 곱하는 배율. 획 굵기도 같이 곱해져 그림째 확대된다. */
  scale: number
  /** 그림 상단 중앙(월드 x, z). */
  x: number
  z: number
  /** y축 회전(도). 상단 중앙을 축으로 돈다. */
  rotation: number
  /** 처음부터 끝까지 그어지는 데 걸리는 시간(초). */
  seconds: number
}

/** 세워 두는 신호등의 배치·그림자. 좌표는 횡단보도 우상단 꼭지점 기준 상대값이다. */
export interface TrafficLightPlacement {
  /** 그림 세로의 월드 크기(테두리 여백 제외). 가로는 그림 비율에서 나온다. */
  height: number
  /** 횡단보도 우상단 꼭지점에서 떨어진 거리(월드 x, z). */
  offsetX: number
  offsetZ: number
  /** 세운 판의 y축 회전 보정(도). 0이면 화면을 정면으로 본다. */
  rotation: number
  /** 바닥 그림자가 뻗는 방향(도). */
  shadowAngle: number
  /** 바닥 그림자의 길이 배수. */
  shadowLength: number
  /** 바닥 그림자의 진하기(0~1). */
  shadowOpacity: number
}

interface MapDecorationsState {
  /** 바닥 화살표의 배치·연출. */
  guide: GuideArrowPlacement
  /** 값이 바뀌면 화살표를 새로 마운트해 그리는 연출을 다시 재생한다(HUD 버튼). */
  guideRedraw: number
  /** 우클릭 안내 아이콘의 배치. */
  hint: RightClickHintPlacement
  /** 횡단보도의 배치·연출. */
  crosswalk: CrosswalkPlacement
  /** 값이 바뀌면 횡단보도를 새로 마운트해 그리는 연출을 다시 재생한다(HUD 버튼). */
  crosswalkRedraw: number
  /**
   * 횡단보도를 다 그었는지. 뒤이어 나오는 장식이 기다리는 신호다.
   * 걷는 시간이 거리에 따라 달라져 지연(delay) 상수로는 차례를 맞출 수 없다.
   */
  crosswalkDrawn: boolean
  /** 세워 두는 신호등의 배치·그림자. */
  trafficLight: TrafficLightPlacement
  setGuide: (guide: GuideArrowPlacement) => void
  redrawGuide: () => void
  setHint: (hint: RightClickHintPlacement) => void
  setCrosswalk: (crosswalk: CrosswalkPlacement) => void
  redrawCrosswalk: () => void
  /** 횡단보도를 다 그었음을 알린다. */
  markCrosswalkDrawn: () => void
  setTrafficLight: (trafficLight: TrafficLightPlacement) => void
}

/**
 * 맵 장식(스테이션에 속하지 않는 종이 위 요소)의 개발용 튜닝 상태.
 * 프로덕션에서는 HUD가 렌더되지 않아 항상 기본값이다.
 * 여기서 맞춘 값을 각 장식의 `.constants.ts` 기본값에 반영하면 확정된다.
 */
export const useMapDecorationsStore = create<MapDecorationsState>((set, get) => ({
  guide: { ...GUIDE_ARROW_PLACEMENT },
  guideRedraw: 0,
  hint: { ...RIGHT_CLICK_HINT_PLACEMENT },
  crosswalk: { ...CROSSWALK_PLACEMENT },
  crosswalkRedraw: 0,
  crosswalkDrawn: false,
  trafficLight: { ...TRAFFIC_LIGHT_PLACEMENT },
  setGuide: (guide) => set({ guide }),
  redrawGuide: () => set((s) => ({ guideRedraw: s.guideRedraw + 1 })),
  setHint: (hint) => set({ hint }),
  setCrosswalk: (crosswalk) => set({ crosswalk }),
  // 다시 그리면 연출이 처음부터 재생되므로 다 그었다는 신호도 내린다 — 뒤이어 나오는 장식이
  // 그리는 동안 서 있으면 안 된다. 다 그으면 횡단보도가 다시 켠다.
  redrawCrosswalk: () =>
    set((s) => ({ crosswalkRedraw: s.crosswalkRedraw + 1, crosswalkDrawn: false })),
  markCrosswalkDrawn: () => {
    if (!get().crosswalkDrawn) set({ crosswalkDrawn: true })
  },
  setTrafficLight: (trafficLight) => set({ trafficLight }),
}))
