import type { Mesh } from 'three'

/** 콜라이더가 판정에서 맡은 역할. 색을 가르는 기준이다. */
export type LobbyColliderKind = 'walkable' | 'blocker' | 'overhead' | 'trigger' | 'none'

/** 모델에서 갈라낸 콜라이더 하나. 메시를 그대로 들고 온다. */
export interface LobbyColliderPart {
  mesh: Mesh
  kind: LobbyColliderKind
  /** 판정에서 아래로 늘린 높이. 그린 것과 판정이 어긋나지 않게 늘린 몫도 함께 그린다. */
  extendDown?: number
}

export interface LobbyColliderViewProps {
  parts: LobbyColliderPart[]
}
