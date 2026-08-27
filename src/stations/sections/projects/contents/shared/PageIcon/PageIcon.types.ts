export interface PageIconProps {
  /** 판에 얹을 그림 경로. */
  icon: string
  /** 놓을 자리(가로 1 기준 정규화). 그림 한가운데다. */
  x: number
  y: number
  /** 그림 세로. 가로는 그림 비율에서 나온다. */
  size: number
}
