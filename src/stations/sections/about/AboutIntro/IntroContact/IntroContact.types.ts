/** 연락처 한 줄. 누를 수 있는 줄은 동작(`copy`·`open`)을 갖는다. */
export interface ContactLine {
  /** 줄 앞에 놓을 아이콘 경로. */
  icon: string
  /** 화면에 적을 값. */
  text: string
  /** 누르면 클립보드에 담을 값. 없으면 복사하지 않는다. */
  copy?: string
  /** 누르면 새 탭으로 열 주소. 없으면 열지 않는다. */
  open?: string
}

export interface IntroContactProps {
  /** 그릴 줄. 값이 없는 항목은 부르는 쪽에서 미리 걸러 넘긴다. */
  lines: ContactLine[]
  /** 첫 줄이 놓일 왼쪽 끝(월드 x). */
  x: number
  /** 맨 아래 줄의 밑선(월드 y). 줄은 여기서 위로 쌓인다. */
  y: number
  /** 글씨 크기. 아이콘도 이 크기에 맞춘다. */
  size: number
  /** 아이콘과 글씨 사이 간격. */
  gap: number
  /** 줄 간격(글씨 크기 배수). */
  lineHeight: number
  /** 누를 수 있는지. 페이지가 열려 있는 동안에만 켠다. */
  interactive: boolean
}
