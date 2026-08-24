import { create } from 'zustand'
import type { GalleryArtworkSpot } from '../stations/sections/projects/ProjectsGallery/GalleryArtworks'
import type { GalleryNameplateSpot } from '../stations/sections/projects/ProjectsGallery/GalleryNameplates'
import type { InteriorTrigger } from '../stations/sections/projects/interior'

interface GalleryGeometryState {
  /** 트리거 이름(`Trigger_ToLobby`) → 잰 값. */
  triggers: Record<string, InteriorTrigger>
  /** 조립한 방의 좌우 끝(월드 x). 카메라가 방 밖을 비추지 않게 하는 기준이다. */
  bounds: { minX: number; maxX: number }
  /** 칸 순서대로의 이름판 자리. 그 앞에 프로젝트 이름을 적은 판을 세운다. */
  plates: GalleryNameplateSpot[]
  /** 칸 순서대로의 액자 자리. 그 앞에 프로젝트 사진 판을 세운다. */
  artworks: GalleryArtworkSpot[]
  setGeometry: (
    triggers: Record<string, InteriorTrigger>,
    bounds: { minX: number; maxX: number },
    plates: GalleryNameplateSpot[],
    artworks: GalleryArtworkSpot[],
  ) => void
  clear: () => void
}

/** 방이 없을 때의 값. 카메라가 이것을 보면 따라갈 범위가 없어 캐릭터를 그대로 따라간다. */
const EMPTY_BOUNDS = { minX: 0, maxX: 0 }

/** 방이 없을 때의 이름판. 같은 배열을 돌려줘 방이 없는 동안 판을 다시 만들지 않는다. */
const EMPTY_PLATES: GalleryNameplateSpot[] = []

/** 방이 없을 때의 액자. 이름판과 같은 이유로 같은 배열을 돌려준다. */
const EMPTY_ARTWORKS: GalleryArtworkSpot[] = []

/**
 * 전시 공간에서 **잰** 것.
 *
 * 방을 코드에서 조립하므로 칸 수에 따라 너비가 달라진다. 트리거 자리도 마감이 어디 붙느냐에
 * 달려 있어 상수로 둘 수 없다 — 모델이 아는 것은 모델에게 묻는다 (DECISIONS 033).
 */
export const useGalleryGeometryStore = create<GalleryGeometryState>((set) => ({
  triggers: {},
  bounds: EMPTY_BOUNDS,
  plates: EMPTY_PLATES,
  artworks: EMPTY_ARTWORKS,
  setGeometry: (triggers, bounds, plates, artworks) =>
    set({ triggers, bounds, plates, artworks }),
  clear: () =>
    set({ triggers: {}, bounds: EMPTY_BOUNDS, plates: EMPTY_PLATES, artworks: EMPTY_ARTWORKS }),
}))
