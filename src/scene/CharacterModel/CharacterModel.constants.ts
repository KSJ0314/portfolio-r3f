/** 캐릭터가 어떤 걸음으로 다닐지. 쓰는 쪽이 상황에 맞게 고른다. */
export type CharacterMotion = 'walk' | 'run'

/** 걸음별 애니메이션 클립 이름. 한 파일에 둘 다 들어 있다. */
export const CHARACTER_CLIPS: Record<CharacterMotion, string> = {
  walk: 'Walking',
  run: 'Running',
}

/** 캐릭터 모델 파일. */
export const CHARACTER_URL = '/assets/character.glb'

/** 걷는 것으로 보는 최소 속도(유닛/초). 이보다 느리면 선 것으로 판단한다. */
export const WALK_EPSILON = 0.05

/**
 * 모델 정면을 +z로 맞추는 각(도).
 * 진행 방향으로 도는 계산이 +z를 앞으로 보므로, 모델이 다른 쪽을 보면 여기서 돌린다.
 */
export const CHARACTER_FACING = 0
