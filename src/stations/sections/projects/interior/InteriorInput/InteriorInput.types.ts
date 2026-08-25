export interface InteriorInputProps {
  /**
   * 지금 이동 입력을 받지 않을 사정이 있는지. 방마다 다르다(트리거를 보는 중 등).
   * 화면이 덮여 있는 동안 받지 않는 것은 공통이라 여기서 볼 필요가 없다.
   */
  blocked?: () => boolean
  /**
   * 찍었을 때 단 가운데로 맞출 바닥 콜라이더 이름. 계단이 있는 방만 준다.
   * 판정용 계단은 단이 없는 경사 슬래브라 찍은 자리 그대로 서면 단 사이에 걸친다.
   */
  snapStairs?: readonly string[]
}
