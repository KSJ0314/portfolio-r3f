import { create } from 'zustand'
import { PROJECTS_DOOR_GLOW } from '../stations/sections/projects/ProjectsBuilding/DoorGlow/DoorGlow.constants'
import {
  PROJECTS_BUILDING_PLACEMENT,
  PROJECTS_ENTER,
  PROJECTS_DOOR_PLATE,
  PROJECTS_MARKER,
  PROJECTS_NEAR,
  PROJECTS_SWING,
  PROJECTS_VIEW,
} from '../stations/sections/projects/ProjectsBuilding/ProjectsBuilding.constants'

/** 프로젝트 구역 건물의 배치. */
export interface ProjectsBuildingPlacement {
  /** 건물 높이의 월드 크기. 가로·깊이는 모델 비율에서 나온다. */
  height: number
  /** 밑면 중심(월드 x, z). */
  x: number
  z: number
  /** y축 회전(도). */
  rotation: number
}

/** 근접 판정 구역 — 잰 문 자리에서 문이 향하는 쪽으로 뻗는다(모델 좌표). */
export interface ProjectsNearPlacement {
  /** 문에서 구역 중심까지 앞으로 나가는 거리. */
  forward: number
  width: number
  depth: number
}

/** 문에 붙는 클릭 판. 자리는 건물 중심에서 떨어진 거리(모델 좌표), 크기는 잰 문 대비 배수. */
export interface ProjectsDoorPlate {
  x: number
  y: number
  z: number
  width: number
  height: number
}

/** 문 위에 뜨는 클릭 표시. 자리와 크기 모두 모델 좌표다. */
export interface ProjectsMarkerPlacement {
  /** 건물 중심에서 떨어진 거리. */
  x: number
  y: number
  z: number
  /** 원뿔 높이. */
  size: number
}

/** 문이 열리는 방식. */
export interface ProjectsSwingPlacement {
  /** 경첩이 오른쪽(+x) 모서리인지. */
  hingeRight: boolean
  /** 열렸을 때의 각도(도). 부호가 여는 방향이다. */
  angle: number
  /** 열리고 닫히는 데 걸리는 시간(초). */
  seconds: number
}

/** 문간을 채우는 빛. */
export interface ProjectsGlowPlacement {
  /** 빛 색. 문쪽 면·바닥 면·뒷면이 모두 이 색이다. */
  color: string
  /** 카펫 색. */
  carpetColor: string
  /** 문짝 대비 입구 크기 배율. */
  scale: number
  /** 뒷면까지의 깊이(모델 좌표). */
  depth: number
  /** 밝아지는 정도(0~1). 1에 가까울수록 급격하게 밝아진다. */
  sharpness: number
  /** 문쪽 면과 바닥 면이 안쪽으로 뻗는 길이(모델 좌표). 두 면이 같은 길이다. */
  length: number
  /** 카펫이 안으로 들어갈수록 어두워지는 정도(0~1). */
  carpetFalloff: number
}

/** 활성화했을 때 문을 정면으로 보는 카메라 자세. */
export interface ProjectsViewPlacement {
  /** 문에서 카메라까지의 거리. */
  distance: number
  /** 카메라 높이(월드 y). */
  height: number
  /** 바라보는 점의 높이(월드 y). */
  lookY: number
  /** 들어갈 때 확대하는 배수. */
  zoom: number
  /** 확대에 걸리는 시간(초). */
  zoomSeconds: number
}

/** 캐릭터가 건물 안으로 들어가 서는 깊이(건물 중심 기준 모델 좌표). x는 선 자리를 그대로 둔다. */
export interface ProjectsEnterPlacement {
  z: number
  /** 들어갈 때의 걸음 속도(유닛/초). */
  speed: number
}

interface ProjectsPageState {
  building: ProjectsBuildingPlacement
  near: ProjectsNearPlacement
  plate: ProjectsDoorPlate
  marker: ProjectsMarkerPlacement
  swing: ProjectsSwingPlacement
  glow: ProjectsGlowPlacement
  view: ProjectsViewPlacement
  enter: ProjectsEnterPlacement
  /** 근접 구역·클릭 판 테두리를 그릴지(범위 확인용). */
  showOutline: boolean
  setBuilding: (building: ProjectsBuildingPlacement) => void
  setNear: (near: ProjectsNearPlacement) => void
  setPlate: (plate: ProjectsDoorPlate) => void
  setMarker: (marker: ProjectsMarkerPlacement) => void
  setSwing: (swing: ProjectsSwingPlacement) => void
  setGlow: (glow: ProjectsGlowPlacement) => void
  setView: (view: ProjectsViewPlacement) => void
  setEnter: (enter: ProjectsEnterPlacement) => void
  setShowOutline: (showOutline: boolean) => void
}

/**
 * 프로젝트 섹션의 개발용 튜닝 상태.
 * 프로덕션에서는 HUD가 렌더되지 않아 항상 기본값이다.
 * 여기서 맞춘 값을 각 컴포넌트의 `.constants.ts` 기본값에 반영하면 확정된다.
 */
export const useProjectsPageStore = create<ProjectsPageState>((set) => ({
  building: { ...PROJECTS_BUILDING_PLACEMENT },
  near: { ...PROJECTS_NEAR },
  plate: { ...PROJECTS_DOOR_PLATE },
  marker: { ...PROJECTS_MARKER },
  swing: { ...PROJECTS_SWING },
  glow: { ...PROJECTS_DOOR_GLOW },
  view: { ...PROJECTS_VIEW },
  enter: { ...PROJECTS_ENTER },
  showOutline: false,
  setBuilding: (building) => set({ building }),
  setNear: (near) => set({ near }),
  setPlate: (plate) => set({ plate }),
  setMarker: (marker) => set({ marker }),
  setSwing: (swing) => set({ swing }),
  setGlow: (glow) => set({ glow }),
  setView: (view) => set({ view }),
  setEnter: (enter) => set({ enter }),
  setShowOutline: (showOutline) => set({ showOutline }),
}))
