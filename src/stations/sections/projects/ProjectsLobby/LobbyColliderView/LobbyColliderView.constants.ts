import type { LobbyColliderKind } from './LobbyColliderView.types'

/** 역할별 색. 서로 확실히 갈리는 원색으로 둔다 — 실내가 어두워 옅은 색은 묻힌다. */
export const LOBBY_COLLIDER_COLOR: Record<LobbyColliderKind, string> = {
  walkable: '#3ddc84',
  blocker: '#ff4d4d',
  overhead: '#4d8dff',
  trigger: '#ffd24d',
  none: '#8a8a8a',
}

/**
 * 아래로 늘린 몫을 그릴 때 한 장씩 내리는 간격.
 * 늘어난 것은 메시가 아니라 판정 규칙이라, 같은 메시를 이만큼씩 내려 겹쳐 이어진 것처럼 보인다.
 * 콜라이더의 세로 두께보다 작아야 사이가 벌어지지 않는다.
 */
export const LOBBY_COLLIDER_EXTEND_STEP = 0.3

/**
 * 콜라이더를 앞으로 당기는 정도. 벽·바닥 면과 겹쳐 있어 그대로 두면 z-파이팅으로 얼룩진다.
 * 음수라 깊이가 카메라 쪽으로 밀려 콜라이더가 이긴다.
 */
export const LOBBY_COLLIDER_DEPTH_BIAS = -2
