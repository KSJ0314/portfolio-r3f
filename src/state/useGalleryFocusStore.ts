import { create } from 'zustand'

interface GalleryFocusState {
  /** 지금 확대해 보고 있는 칸의 번호. 없으면 평소 화면이다. */
  focusedBay: number | null
  /** 그 칸에서 보고 있는 페이지(0부터). */
  page: number
  /** 확대가 끝나 페이지를 볼 수 있는 상태인지. 카메라가 도는 동안은 꺼져 있다. */
  zoomed: boolean
  focus: (bay: number) => void
  setPage: (page: number) => void
  setZoomed: (zoomed: boolean) => void
  close: () => void
  /** 전시 공간에 다시 들어오면 처음 상태로. */
  reset: () => void
}

/**
 * 전시 칸을 확대해 보는 상태.
 *
 * 자리·크기는 모델에서 잰 것(`useGalleryGeometryStore`)이고 여기 있는 것은 **지금 무엇을 보고
 * 있는지**다. 성격이 달라 나눠 둔다 — 로비의 `useLobbyTriggerStore`와 같은 자리다.
 * 어느 칸인지와 몇 페이지인지는 같은 물음이라 한자리에 둔다.
 *
 * **칸이 바뀌거나 닫히면 페이지는 첫 장으로 돌아간다.** 다른 프로젝트를 열었는데 앞서 보던
 * 장수가 남아 있으면 없는 페이지를 가리킨다.
 *
 * **`zoomed`는 카메라가 다 확대된 뒤에야 켜진다.** 페이지 내용은 액자 사진을 덮으므로, 도는 도중에
 * 바뀌면 멀리서 그림만 갈리는 것으로 보인다. 켜는 것은 트윈을 굴리는 `GalleryCameraRig`이고,
 * 끄는 것은 여기서 곧바로 한다 — 닫을 때는 내용이 먼저 사라지고 그다음 카메라가 물러난다.
 *
 * 연 적이 있는지는 담지 않는다. 누를 수 있다는 표시를 두지 않아 걷을 기준이 필요 없다.
 */
export const useGalleryFocusStore = create<GalleryFocusState>((set, get) => ({
  focusedBay: null,
  page: 0,
  zoomed: false,
  focus: (bay) => {
    if (get().focusedBay === bay) return
    set({ focusedBay: bay, page: 0, zoomed: false })
  },
  setPage: (page) => {
    if (get().page === page) return
    set({ page })
  },
  setZoomed: (zoomed) => {
    if (get().zoomed === zoomed) return
    set({ zoomed })
  },
  close: () => {
    if (get().focusedBay === null) return
    set({ focusedBay: null, page: 0, zoomed: false })
  },
  reset: () => set({ focusedBay: null, page: 0, zoomed: false }),
}))
