import { create } from 'zustand'
import { RIGHT_CLICK_HINT_PLACEMENT } from '../scene/MapDecorations/RightClickHint/RightClickHint.constants'
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

interface MapDecorationsState {
  /** 바닥 화살표의 배치·연출. */
  guide: GuideArrowPlacement
  /** 값이 바뀌면 화살표를 새로 마운트해 그리는 연출을 다시 재생한다(HUD 버튼). */
  guideRedraw: number
  /** 우클릭 안내 아이콘의 배치. */
  hint: RightClickHintPlacement
  setGuide: (guide: GuideArrowPlacement) => void
  redrawGuide: () => void
  setHint: (hint: RightClickHintPlacement) => void
}

/**
 * 맵 장식(스테이션에 속하지 않는 종이 위 요소)의 개발용 튜닝 상태.
 * 프로덕션에서는 HUD가 렌더되지 않아 항상 기본값이다.
 * 여기서 맞춘 값을 각 장식의 `.constants.ts` 기본값에 반영하면 확정된다.
 */
export const useMapDecorationsStore = create<MapDecorationsState>((set) => ({
  guide: { ...GUIDE_ARROW_PLACEMENT },
  guideRedraw: 0,
  hint: { ...RIGHT_CLICK_HINT_PLACEMENT },
  setGuide: (guide) => set({ guide }),
  redrawGuide: () => set((s) => ({ guideRedraw: s.guideRedraw + 1 })),
  setHint: (hint) => set({ hint }),
}))
