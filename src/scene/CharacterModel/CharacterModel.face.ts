/**
 * 밖에서 넘긴 "이쪽을 봐라"를 캐릭터에게 한 번 전해 주는 자리. 맵과 실내가 함께 쓴다.
 *
 * 계속 바라보게 하는 상태가 아니라 **한 번 넘기고 끝나는 신호**라 스토어에 두지 않는다.
 * 컴포넌트 파일에 두면 Fast Refresh가 걸리므로 따로 뺀다.
 */
const _face = { x: 0, z: 0, pending: false }

/**
 * 캐릭터를 그 지점 쪽으로 한 번 돌린다.
 * 다시 걷기 시작하면 진행 방향이 그 자리를 덮으므로 그쪽만 바라본 채로 남지 않는다.
 */
export function turnCharacterTo(x: number, z: number): void {
  _face.x = x
  _face.z = z
  _face.pending = true
}

/** 넘어온 지점을 집어간다(집어가면 비워진다). 넘어온 것이 없으면 null이다. */
export function takeFacePoint(): { x: number; z: number } | null {
  if (!_face.pending) return null
  _face.pending = false
  return _face
}
