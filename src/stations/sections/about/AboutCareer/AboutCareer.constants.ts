import type { StationArea } from '../../../types'

/**
 * Career 영역(가로 × 세로). 바닥에 눕은 사각형이고, 이게 곧 클릭·근접 판정 범위다.
 * 시작 추정값이라 HUD로 맞춰 확정한다.
 */
export const CAREER_AREA: StationArea = { width: 13.5, height: 8 }

/** 종이에 적힌 글씨·선 색(다른 About 스테이션과 같은 잉크색). */
export const INK = '#3a3a3a'

/**
 * Career 영역의 상단 중앙(월드 x, z). 횡단보도를 건너온 자리와 맞물리는 기준점이라
 * 좌상단이 아니라 이 점을 앵커로 둔다. 가로 크기를 바꿔도 중앙이 유지된다.
 */
export const CAREER_TOP_CENTER = { x: 13.5, z: 25 } as const

/**
 * 항공뷰 ↔ 정면뷰 전환 시간(초)과 이징.
 * 종이·트로피가 로고 자리로 물러나는 것도 같은 값을 써 **카메라 회전과 동시에** 끝난다.
 */
export const CAREER_TURN_SECONDS = 1.5
export const CAREER_TURN_EASE = 'power2.inOut'

/** 캐릭터가 설 자리를 테두리에서 바깥으로 얼마나 띄울지. 0이면 테두리 위에 선다. */
export const CAREER_STAND_MARGIN = 0

/** 영역을 세로로 가르는 칸 수 — 교육 · 자격증 · 수상내역. */
export const CAREER_COLUMN_COUNT = 3

/** 칸마다 붙는 제목. 순서가 곧 칸 순서이고, 그 칸의 로고가 되는 그림도 같은 순서다. */
export const CAREER_COLUMN_TITLES = ['교육', '수상내역', '자격증'] as const

/** 활성 상태에서 각 그림이 물러나 로고가 되는 자세. */
export const CAREER_LOGO = {
  /**
   * 로고의 세로 크기(월드 단위). 배율이 아니라 높이라, 평소 크기가 제각각이어도 셋이 같게 보인다.
   * 각자 자기 평소 크기 대비 배율을 구해 줄어든다.
   */
  height: 0.55,
  /** 영역 위 테두리에서 로고 중심까지 내려오는 거리. */
  top: 0.9,
  /** 칸 왼쪽 테두리에서 로고 왼쪽 끝까지 들이는 거리. */
  left: 0.5,
}

/** 로고 옆에 나란히 붙는 손글씨 제목. */
export const CAREER_TITLE = {
  /** 글자 크기. */
  size: 0.5,
  /** 로고 오른쪽 끝에서 제목까지 띄우는 거리. */
  gap: 0.3,
  /** 세로 보정. 양수면 위로 올라간다. */
  offsetY: 0,
}

/** 칸 왼쪽 테두리의 x(영역 중심 기준). 로고도 제목도 이 선에서부터 잰다. */
export function careerColumnLeft(index: number, width: number): number {
  return -width / 2 + (width / CAREER_COLUMN_COUNT) * index
}

/** Career 영역의 중심(월드 x, z). 상단 중앙 + 세로 반크기. stations.ts의 배치 좌표로 쓴다. */
export const CAREER_CENTER: readonly [number, number] = [
  CAREER_TOP_CENTER.x,
  CAREER_TOP_CENTER.z + CAREER_AREA.height / 2,
]
