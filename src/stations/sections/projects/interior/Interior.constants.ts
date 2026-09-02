/**
 * 실내(로비·전시 공간)가 함께 쓰는 값.
 *
 * 방마다 달라도 되는 것(시작 자리·카메라·조명·재질)은 방 상수에 두고, 여기에는
 * **어느 방에서나 같아야 하는 것**만 둔다. 조작감이 방마다 달라지면 안 된다.
 */

/** 블렌더에서 붙인 이름 접두. 콜라이더·트리거는 화면에 그리지 않고 판정에만 쓴다. */
export const INTERIOR_COLLIDER_PREFIX = 'Collider_'
export const INTERIOR_TRIGGER_PREFIX = 'Trigger_'

/** 걸음 속도(유닛/초). 실내는 방이 좁아 맵(4)보다 느리다. */
export const INTERIOR_MOVE_SPEED = 2.2

/**
 * 한 걸음에 오를 수 있는 높이. 바닥을 찾는 레이가 지금 발밑에서 이만큼 위에서 시작한다.
 *
 * **하늘에서 쏘면 안 된다** — 로비는 통로가 2층 바로 밑이라, 통로를 걸을 때 2층 바닥을 먼저 맞는다.
 * 경사면이 한 걸음에 오르는 높이보다 넉넉하고 층간 높이(1.7)보다는 작아야 한다.
 */
export const INTERIOR_STEP_UP = 0.6

/** 바닥을 찾는 레이가 훑는 길이. 방 높이보다 넉넉하면 된다. */
export const INTERIOR_FLOOR_RAY_LENGTH = 20

/**
 * 막는 상자 판정에서 빼는 발밑 몫(캐릭터 높이 대비 비율).
 * 바닥 슬래브처럼 밟고 선 면과 윗면이 같은 상자가 발에 걸려 옆으로 미는 것을 막는다.
 */
export const INTERIOR_BLOCKER_FOOT_RATIO = 0.3

/** 캐릭터 반폭. 막는 상자에서 이만큼 떨어져 선다. */
export const INTERIOR_CHARACTER_RADIUS = 0.25

/**
 * 캐릭터 **판정** 몸통 크기. 막는 것과 겹치는지 볼 때 쓴다.
 * 보이는 키(`INTERIOR_CHARACTER`)와 따로 두는 이유는, 이 값을 바꾸면 난간·문틀을
 * 지나는 판정까지 함께 달라지기 때문이다.
 */
export const INTERIOR_CHARACTER_SIZE: readonly [number, number, number] = [0.4, 0.55, 0.4]

/** 실내 캐릭터의 크기·밝기. 눈으로 맞춰야 하는 값이라 HUD로 조절한다. */
export const INTERIOR_CHARACTER = {
  /** 모델 세로의 월드 크기. 방이 맵보다 좁은 축척이라 맵보다 작다. */
  height: 0.85,
  /**
   * 텍스처 색에 곱하는 밝기.
   * 실내는 노출(`LOBBY_EXPOSURE`)로 방 전체 밝기를 잡으므로 캐릭터도 그 톤 매핑을 함께 탄다.
   */
  brightness: 1.6,
}
