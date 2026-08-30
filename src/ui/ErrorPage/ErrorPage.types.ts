export interface ErrorPageProps {
  /** 크게 쓰는 안내 한 줄. */
  message: string
  /**
   * 아래에 두는 돌아가는 길.
   * `home`은 첫 화면으로 가는 링크, `reload`는 새로고침이다.
   * 렌더가 깨진 경우는 라우트를 옮겨도 복구되지 않으므로 `reload`를 쓴다.
   */
  action: 'home' | 'reload'
}
