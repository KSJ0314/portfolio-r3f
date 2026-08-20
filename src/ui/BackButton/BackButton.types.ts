export interface BackButtonProps {
  /** 화살표 뒤에 붙는 글자. 화살표는 버튼이 그리므로 여기엔 넣지 않는다. */
  label: string
  /** 글씨색. 화면마다 배경이 달라 쓰는 쪽이 정한다. */
  color: string
  onClick: () => void
}
