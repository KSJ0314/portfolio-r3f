export interface PageLinkProps {
  /** 판에 얹을 아이콘 경로. */
  icon: string
  /** 누르면 새 탭으로 열 주소. */
  url: string
  /** 놓을 자리(가로 1 기준 정규화). */
  x: number
  y: number
  /** 아이콘 세로. 가로는 그림 비율에서 나온다. */
  size: number
}
