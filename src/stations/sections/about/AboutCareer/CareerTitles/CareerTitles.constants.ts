/** 바닥과 겹쳐 깜빡이지 않도록 띄운다. 종이·트로피 밑동보다 위다. */
export const CAREER_TITLES_Y = 0.05

/** 칸마다 붙는 제목. 순서가 곧 칸 순서이고, 그 칸의 로고가 되는 그림도 같은 순서다. */
export const CAREER_COLUMN_TITLES = ['교육', '수상내역', '자격증'] as const

/** 로고 옆에 나란히 붙는 손글씨 제목의 배치. 눈으로 맞추는 값이라 HUD로 조절한다. */
export const CAREER_TITLE = {
  /** 글자 크기. */
  size: 0.5,
  /** 로고 오른쪽 끝에서 제목까지 띄우는 거리. */
  gap: 0.3,
  /** 세로 보정. 양수면 위로 올라간다. */
  offsetY: 0,
}
