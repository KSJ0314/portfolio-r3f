export interface SkillsPagerProps {
  /** 지금 보고 있는 페이지(0부터). */
  page: number
  /** 전체 페이지 수. */
  count: number
  /** 넘길 페이지를 알린다. */
  onPage: (page: number) => void
  /** 놓일 자리(눕힌 그룹 안의 화면 좌표) — 오른쪽 아래 모서리 기준이다. */
  x: number
  y: number
  /** 글자 크기. */
  size: number
}
