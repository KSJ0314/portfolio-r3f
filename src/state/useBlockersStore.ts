import { create } from 'zustand'

/** 이동을 막는 사각형(월드 xz 축에 나란한 상자). */
export interface BlockerRect {
  minX: number
  maxX: number
  minZ: number
  maxZ: number
}

interface BlockersState {
  /** 막는 사각형들. 올린 쪽이 자기 이름으로 넣고 뺀다. */
  blockers: Record<string, BlockerRect>
  setBlocker: (id: string, rect: BlockerRect) => void
  removeBlocker: (id: string) => void
}

/**
 * 캐릭터가 통과하지 못하는 자리를 모아 둔다.
 *
 * 무엇이 막는지는 막는 쪽이 안다 — 건물은 자기 발자국을 여기 올리고, `Character`는 목록만 보고 밀려난다.
 * 이름으로 넣으므로 크기가 바뀌면 덮어써지고, 사라질 때 자기 것만 뺀다.
 */
export const useBlockersStore = create<BlockersState>((set) => ({
  blockers: {},
  setBlocker: (id, rect) => set((s) => ({ blockers: { ...s.blockers, [id]: rect } })),
  removeBlocker: (id) =>
    set((s) => {
      if (!(id in s.blockers)) return s
      const blockers = { ...s.blockers }
      delete blockers[id]
      return { blockers }
    }),
}))

/**
 * 막는 사각형 밖으로 밀어낸다(파고든 깊이가 가장 얕은 축으로).
 * 그 축만 되돌리므로 벽을 따라 미끄러진다 — 정면으로 밀면 멈추고, 비스듬히 밀면 옆으로 흐른다.
 */
export function pushOutOfBlockers(point: { x: number; z: number }, radius: number): void {
  const { blockers } = useBlockersStore.getState()
  for (const rect of Object.values(blockers)) {
    const minX = rect.minX - radius
    const maxX = rect.maxX + radius
    const minZ = rect.minZ - radius
    const maxZ = rect.maxZ + radius
    if (point.x <= minX || point.x >= maxX || point.z <= minZ || point.z >= maxZ) continue

    const left = point.x - minX
    const right = maxX - point.x
    const near = point.z - minZ
    const far = maxZ - point.z
    const shortest = Math.min(left, right, near, far)
    if (shortest === left) point.x = minX
    else if (shortest === right) point.x = maxX
    else if (shortest === near) point.z = minZ
    else point.z = maxZ
  }
}
