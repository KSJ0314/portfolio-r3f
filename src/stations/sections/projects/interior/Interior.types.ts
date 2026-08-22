/** 모델에서 잰 트리거 하나 — 중심(월드)과 크기. */
export interface InteriorTrigger {
  x: number
  y: number
  z: number
  width: number
  height: number
  depth: number
}

/** 불러온 재질을 덮어쓰는 값. 방마다 정해 넘긴다. */
export interface InteriorMaterialOverrides {
  /** 거칠기를 이 값으로 덮어쓴다. 1이 가장 거칠고 정반사가 넓게 퍼져 시야에 덜 흔들린다. */
  roughness: number
  /** 거칠기 텍스처를 뗄지. 텍스처가 부분적으로 매끈하면 그 자리에 정반사가 몰린다. */
  dropRoughnessMap: boolean
  /** 환경 반사 세기(0~1+). 0이면 환경광이 확산광으로만 들어온다. */
  envMapIntensity: number
  /**
   * 노멀맵 세기. 1이면 모델 그대로, 0이면 표면 요철을 무시한다.
   *
   * 확산광은 시야와 무관한데도 빛이 세로로 눌려 보이는 것은 노멀맵이 표면 법선을 한쪽으로
   * 쏠리게 만들기 때문이다. 0으로 두면 미세한 결은 없어지지만 빛이 제대로 번진다.
   */
  normalScale: number
}
