import { create } from 'zustand'
import type { InteriorTrigger } from '../stations/sections/projects/interior'

interface GalleryGeometryState {
  /** 트리거 이름(`Trigger_ToLobby`) → 잰 값. */
  triggers: Record<string, InteriorTrigger>
  /** 조립한 방의 좌우 끝(월드 x). 카메라가 방 밖을 비추지 않게 하는 기준이다. */
  bounds: { minX: number; maxX: number }
  setGeometry: (
    triggers: Record<string, InteriorTrigger>,
    bounds: { minX: number; maxX: number },
  ) => void
  clear: () => void
}

/** 방이 없을 때의 값. 카메라가 이것을 보면 따라갈 범위가 없어 캐릭터를 그대로 따라간다. */
const EMPTY_BOUNDS = { minX: 0, maxX: 0 }

/**
 * 전시 공간에서 **잰** 것.
 *
 * 방을 코드에서 조립하므로 칸 수에 따라 너비가 달라진다. 트리거 자리도 마감이 어디 붙느냐에
 * 달려 있어 상수로 둘 수 없다 — 모델이 아는 것은 모델에게 묻는다 (DECISIONS 033).
 */
export const useGalleryGeometryStore = create<GalleryGeometryState>((set) => ({
  triggers: {},
  bounds: EMPTY_BOUNDS,
  setGeometry: (triggers, bounds) => set({ triggers, bounds }),
  clear: () => set({ triggers: {}, bounds: EMPTY_BOUNDS }),
}))
