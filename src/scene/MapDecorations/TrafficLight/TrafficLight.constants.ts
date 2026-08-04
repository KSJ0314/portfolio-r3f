import type { PaperStickerParams } from '../../../lib/PaperSticker'

export const TRAFFIC_LIGHT_URL = '/images/trafficLight.png'

/**
 * 세워 두는 종이라 판 안에 인쇄된 그림자는 쓰지 않는다 — 그림자는 바닥에 따로 깐다.
 * 오려낸 종이 테두리만 남긴다.
 */
export const TRAFFIC_LIGHT_PARAMS: Partial<PaperStickerParams> = {
  border: 0.02,
  shadowOpacity: 0,
}

/** 바닥 그림자가 종이와 겹쳐 깜빡이지 않도록 살짝 띄운다. 다른 바닥 장식과 같은 층이다. */
export const TRAFFIC_LIGHT_SHADOW_Y = 0.02

/**
 * 배치·그림자 기본값. 눈으로 맞춰야 하는 값이라 HUD로 조절한다.
 *
 * 좌표는 **횡단보도 우상단 꼭지점 기준 상대값**이라, 횡단보도를 옮기거나 키우면 따라온다.
 */
export const TRAFFIC_LIGHT_PLACEMENT = {
  /** 그림 세로의 월드 크기(테두리 여백 제외). 가로는 그림 비율에서 나온다. */
  height: 2,
  /** 횡단보도 우상단 꼭지점에서 떨어진 거리(월드 x, z). */
  offsetX: 0,
  offsetZ: 0.2,
  /** 세운 판의 y축 회전 보정(도). 0이면 화면을 정면으로 본다. */
  rotation: -17,
  /** 바닥 그림자가 뻗는 방향(도). 0이면 화면 안쪽(종이 뒤편)으로 눕는다. */
  shadowAngle: 2,
  /** 바닥 그림자의 길이 배수. 1이면 세운 높이 그대로 눕힌 길이다. */
  shadowLength: 0.75,
  /** 바닥 그림자의 진하기(0~1). */
  shadowOpacity: 0.12,
}
