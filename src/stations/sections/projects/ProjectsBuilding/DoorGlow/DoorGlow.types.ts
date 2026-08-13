import type { Box3, Vector3 } from 'three'

export interface DoorGlowProps {
  /** 문짝이 차지하는 범위(모델 좌표). 여기에 맞춰 크기와 자리를 잡는다. */
  box: Box3
  /** 모델 좌표에서 경첩이 선 자리. 문쪽 면을 열린 자리에 두는 데 쓴다. */
  hinge: Vector3
  /** 모델을 바닥·중심에 맞추려고 옮겨 둔 만큼. 같은 자리에 놓이도록 함께 더한다. */
  base: [number, number, number]
}
