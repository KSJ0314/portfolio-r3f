import type { RefObject } from 'react'

export interface ResumeDownloadProps {
  /**
   * 스크롤바를 갖는 자리. 그 폭만큼 버튼을 안쪽으로 민다.
   *
   * 버튼은 창에 고정돼 창 오른쪽 끝을 기준으로 삼는데, 이력서는 종이를 쌓아 둔 자리가 스스로 스크롤한다.
   * 그 스크롤바가 버튼과 내용 사이에 끼어 우측 여백만 그만큼 좁아 보인다.
   */
  scrollHost: RefObject<HTMLElement | null>
}
