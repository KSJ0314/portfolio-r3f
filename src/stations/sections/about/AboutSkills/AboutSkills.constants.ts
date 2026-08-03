import type { StationArea } from '../../../types'

/**
 * Skills 영역(가로 × 세로). 바닥에 눕은 사각형이고, 이게 곧 클릭·근접 판정 범위다.
 * 시작 추정값이라 HUD로 맞춰 확정한다.
 *
 * 좌상단 꼭지점(min x, min z)이 월드 (6, 6)에 오도록 배치 좌표(중심)를 맞춰 둔다.
 * 크기를 바꾸면 중심(`SKILLS_CENTER`)도 같이 옮겨져 꼭지점이 유지된다.
 */
export const SKILLS_AREA: StationArea = { width: 13, height: 8 }

/** 종이에 적힌 글씨·선 색(AboutIntro와 같은 잉크색). */
export const INK = '#3a3a3a'

/** Skills 영역의 좌상단 꼭지점(월드 x, z). 이 점을 기준으로 영역이 +x·+z로 펼쳐진다. */
export const SKILLS_TOP_LEFT = { x: 5, z: 3 } as const

/**
 * 활성화할 때 캐릭터가 걸어가 서는 자리. 영역 중심 기준 오프셋(월드 x, z)이라 영역을 옮기면 따라온다.
 * 걷는 동안은 카메라가 평소처럼 캐릭터를 따라가고, 도착해야 스테이션이 카메라를 넘겨받는다.
 */
export const SKILLS_STAND = { x: 3, z: 4 } as const

/**
 * 활성 전환 시간·이징. 캐릭터 이동·카메라 각도 전환·공구상자 이동이 **겹치지 않고 차례로** 돈다 —
 * 들어갈 때는 캐릭터가 자리로 걸어간 뒤 카메라가 돌고 그 뒤에 공구상자가 로고 자리로 물러나며,
 * 나올 때는 공구상자가 제자리로 돌아온 뒤에 카메라가 항공뷰로 돌아간다.
 * 걷는 시간은 거리에 따라 달라져 상수로 둘 수 없다(차례는 `useSkillsSequenceStore`가 알린다).
 */
export const SKILLS_TURN_SECONDS = 1.5
export const SKILLS_LOGO_SECONDS = 1
export const SKILLS_TURN_EASE = 'power2.inOut'

/** Skills 영역의 중심(월드 x, z). 좌상단 + 반크기. stations.ts의 배치 좌표로 쓴다. */
export const SKILLS_CENTER: readonly [number, number] = [
  SKILLS_TOP_LEFT.x + SKILLS_AREA.width / 2,
  SKILLS_TOP_LEFT.z + SKILLS_AREA.height / 2,
]
