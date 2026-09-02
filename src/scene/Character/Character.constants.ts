import { CHARACTER_FACING } from '../CharacterModel/CharacterModel.constants'

/** 이동 속도(유닛/초). 거리와 무관하게 항상 일정. */
export const MOVE_SPEED = 4

/** 목표점에 닿았다고 보는 거리. */
export const ARRIVE_EPSILON = 1e-4

/** 막는 것과 얼마나 떨어져 서는지. 몸 반폭이라 벽에 파묻히지 않는다. */
export const CHARACTER_RADIUS = 0.3

/** 크기·회전·걷기 동작·밝기 기본값. 눈으로 맞춰야 하는 값이라 HUD로 조절한다. */
export const CHARACTER_PLACEMENT = {
  /** 모델 세로의 월드 크기. 가로·깊이는 모델 비율에서 나온다. */
  height: 1.2,
  /** 모델 정면을 +z로 맞추는 각(도). 실내도 같은 값을 본다 — 방이 아니라 모델의 성질이다. */
  facing: CHARACTER_FACING,
  /** 진행 방향으로 도는 데 걸리는 시간(초). 작을수록 홱 돈다. */
  turnSeconds: 0.12,
  /** 걸음 속도 대비 걷기 동작의 배속. 발이 미끄러져 보이면 여기서 맞춘다. */
  walkRate: 1.5,
  /**
   * 텍스처 색에 곱하는 밝기.
   *
   * 씬 조명은 종이(조명을 받지 않는 재질)에 맞춰 약하게 잡혀 있어, 광량 합이 π에 못 미친다.
   * 그대로 두면 흰색도 잿빛으로 찍히므로 재질 쪽에서 되올린다.
   * **광원을 캐릭터에만 비추는 방법은 없다** — three는 광원을 오브젝트별로 가르지 못하고,
   * 씬 조명을 올리면 트로피·자동차·건물이 함께 밝아진다.
   */
  brightness: 2.5,
}
