import type { StationArea } from '../../../types'

/**
 * Skills 영역(가로 × 세로). 바닥에 눕은 사각형이고, 이게 곧 클릭·근접 판정 범위다.
 * 시작 추정값이라 HUD로 맞춰 확정한다.
 *
 * 좌상단 꼭지점(min x, min z)이 월드 (6, 6)에 오도록 배치 좌표(중심)를 맞춰 둔다.
 * 크기를 바꾸면 중심(`SKILLS_CENTER`)도 같이 옮겨져 꼭지점이 유지된다.
 */
export const SKILLS_AREA: StationArea = { width: 10, height: 8 }

/** Skills 영역의 좌상단 꼭지점(월드 x, z). 이 점을 기준으로 영역이 +x·+z로 펼쳐진다. */
export const SKILLS_TOP_LEFT = { x: 6, z: 6 } as const

/** Skills 영역의 중심(월드 x, z). 좌상단 + 반크기. stations.ts의 배치 좌표로 쓴다. */
export const SKILLS_CENTER: readonly [number, number] = [
  SKILLS_TOP_LEFT.x + SKILLS_AREA.width / 2,
  SKILLS_TOP_LEFT.z + SKILLS_AREA.height / 2,
]
