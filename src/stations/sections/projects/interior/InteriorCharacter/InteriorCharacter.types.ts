export interface InteriorCharacterProps {
  /**
   * 남쪽(카메라 쪽) 이동 한계. 이 선보다 앞으로는 나오지 않는다.
   * 벽 없이 열린 면이 있는 방만 준다 — 사방이 막힌 방은 콜라이더가 이미 가둔다.
   */
  southLimit?: number
}
