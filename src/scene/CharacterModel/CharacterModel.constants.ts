/** 캐릭터가 어떤 걸음으로 다닐지. */
export type CharacterMotion = 'w' | 'r'

/**
 * 동작별 모델 파일. 뼈대·몸집은 같고 담긴 동작만 다르다.
 * 한 파일에 동작이 하나씩이라 동작을 고르는 것이 곧 모델을 고르는 것이다.
 */
const CHARACTER_URLS: Record<CharacterMotion, string> = {
  w: '/assets/character_w.glb',
  r: '/assets/character_r.glb',
}

/** 쓸 동작. **여기만 바꾸면** 맵·실내·에셋 출처가 함께 변경된다. 'w' | 'r'*/
export const CHARACTER_MOTION: CharacterMotion = 'r'

/** 지금 쓰는 캐릭터 모델 파일. */
export const CHARACTER_URL = CHARACTER_URLS[CHARACTER_MOTION]

/** 걷는 것으로 보는 최소 속도(유닛/초). 이보다 느리면 선 것으로 판단한다. */
export const WALK_EPSILON = 0.05

/**
 * 모델 정면을 +z로 맞추는 각(도).
 * 진행 방향으로 도는 계산이 +z를 앞으로 보므로, 모델이 다른 쪽을 보면 여기서 돌린다.
 */
export const CHARACTER_FACING = 0
