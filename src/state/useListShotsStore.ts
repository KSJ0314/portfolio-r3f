import { create } from 'zustand'
import type { ListShot } from '../scene/ListBaker/ListBaker.types'

interface ListShotsState {
  /** 구운 화면들. 아직 굽지 않았으면 null이다. */
  shots: ListShot[] | null
  /** 지금까지 구운 장수. 굽는 동안 진행을 보여준다. */
  baked: number
  /** 미리 묶어 둔 PDF. 다 묶이기 전에는 null이라 내려받기 버튼이 잠긴다. */
  pdf: Blob | null
  /** PDF를 묶은 정도(0~1). 내려받기 버튼 테두리가 이 값을 그린다. */
  pdfRatio: number
  setBaked: (baked: number) => void
  setShots: (shots: ListShot[]) => void
  setPdf: (pdf: Blob) => void
  setPdfRatio: (ratio: number) => void
}

/**
 * 목록 보기가 구운 화면.
 *
 * **컴포넌트가 아니라 여기 담는다.** 사이드바는 라우트가 갈려도 살아 있어야 하고, 접었다 펴거나
 * 로비에 다녀와도 다시 구우면 안 된다 — 굽는 데 몇 초가 걸리고 그동안 캔버스가 한 벌 더 선다.
 *
 * `shots`의 `url`은 blob 주소다. 세션 내내 쓰므로 되돌리지 않는다.
 */
export const useListShotsStore = create<ListShotsState>((set) => ({
  shots: null,
  baked: 0,
  pdf: null,
  pdfRatio: 0,
  setBaked: (baked) => set({ baked }),
  setShots: (shots) => set({ shots }),
  setPdf: (pdf) => set({ pdf }),
  setPdfRatio: (pdfRatio) => set({ pdfRatio }),
}))
