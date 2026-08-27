export interface GalleryPagerProps {
  /** 지금 보고 있는 페이지(0부터). */
  page: number
  /** 전체 페이지 수. */
  count: number
  /** 페이지 세로(가로 1 기준). 점을 아래에, 화살표를 세로 가운데에 두는 기준이다. */
  height: number
  /** 넘길 페이지를 알린다. */
  onPage: (page: number) => void
}
