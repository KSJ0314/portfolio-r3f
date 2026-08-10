/**
 * 미리보기 카메라가 모델에 다가갈 수 있는 한계와 물러설 수 있는 한계.
 * 모델을 가장 긴 변 1로 맞춰 두므로(`CreditModel`) 어떤 모델을 띄워도 같은 값이 통한다.
 * 시작 거리는 약 2.6이고, 최소 거리에서는 모델이 화면을 넘겨 세부를 들여다볼 수 있다.
 */
export const PREVIEW_MIN_DISTANCE = 0.7
export const PREVIEW_MAX_DISTANCE = 4

/** 휠 한 칸이 움직이는 정도. 1이 기본이고, 낮출수록 천천히 감겨 원하는 배율에서 멈추기 쉽다. */
export const PREVIEW_ZOOM_SPEED = 2
