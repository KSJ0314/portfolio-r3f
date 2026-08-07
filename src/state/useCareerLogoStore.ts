import { create } from 'zustand'

interface CareerLogoState {
  /** 칸 순서 → 그림의 월드 가로(평소 크기 기준). */
  widths: Record<number, number>
  setWidth: (column: number, width: number) => void
}

/**
 * 로고가 될 그림들의 실제 가로.
 *
 * 그림마다 가로가 달라 왼쪽 정렬이나 제목 간격을 상수로 잡을 수 없고, 텍스처를 굽거나 모델을
 * 읽어야 알 수 있다. 그래서 각 그림이 재서 올리고 자리를 잡는 쪽이 그것을 본다.
 * 튜닝 값이 아니라 측정값이라 개발용 페이지 스토어와 나눠 둔다.
 */
export const useCareerLogoStore = create<CareerLogoState>((set, get) => ({
  widths: {},
  setWidth: (column, width) => {
    // 같은 값이면 넘어간다 — 다시 넣으면 자리를 잡는 쪽이 헛되이 리렌더된다.
    if (get().widths[column] === width) return
    set((state) => ({ widths: { ...state.widths, [column]: width } }))
  },
}))
