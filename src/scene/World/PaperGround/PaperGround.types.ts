import type { ThreeEvent } from '@react-three/fiber'

export interface PaperGroundProps {
  /** 바닥 한 변의 길이(월드 단위). */
  size: number
  /** 이동 입력(우클릭 누름/홀드) — 바닥이 레이캐스트 대상이므로 입력 처리는 World가 넘겨준다. */
  onPointerDown: (event: ThreeEvent<PointerEvent>) => void
  onPointerMove: (event: ThreeEvent<PointerEvent>) => void
}
