/**
 * 미리보기 카메라가 모델에 다가갈 수 있는 한계와 물러설 수 있는 한계.
 * 모델을 가장 긴 변 1로 맞춰 두므로(`CreditModel`) 어떤 모델을 띄워도 같은 값이 통한다.
 * 시작 거리는 약 2.6이고, 최소 거리에서는 모델이 화면을 넘겨 세부를 들여다볼 수 있다.
 */
export const PREVIEW_MIN_DISTANCE = 0.7
export const PREVIEW_MAX_DISTANCE = 4

/** 휠 한 칸이 움직이는 정도. 1이 기본이고, 낮출수록 천천히 감겨 원하는 배율에서 멈추기 쉽다. */
export const PREVIEW_ZOOM_SPEED = 2

/** 미리보기 카메라의 기본 자리. 항목이 `cameraYaw`를 주면 이 자리를 y축으로 그만큼 돌려 쓴다. */
export const PREVIEW_CAMERA_POSITION: readonly [number, number, number] = [1.5, 1.1, 2.2]

/**
 * 종이 스티커에 더 주는 배율.
 * 모델과 같이 가장 긴 변을 1로 맞추면, 기울여 둔 판이 눌려 보여 작게 느껴진다.
 */
export const FLAT_PREVIEW_SCALE = 2

/**
 * 미리보기에서 걷어내는 오브젝트의 이름 앞머리.
 * 판정(콜라이더)·트리거는 씬에서도 그리지 않는 것이라 실물에 속하지 않는다.
 */
export const PREVIEW_HIDDEN_PREFIXES = ['Collider_', 'Trigger_']

/**
 * 모델에 담겨 온 광원(벽등)을 미리보기에서 켜는 값. 개발용 HUD의 기본값이다.
 *
 * glTF에는 닿는 거리가 담기지 않아 무한대로 들어오므로 모델 크기에 맞춰 자른다.
 * 자르지 않으면 방 안이 통째로 타 여기 둔 조명을 낮춰도 겉면만 어두워진다.
 */
export const CREDIT_MODEL_LIGHT = { intensity: 0.05, range: 0.3 }

/**
 * 종이 스티커를 미리보기에 세우는 자세(도). 개발용 HUD의 기본값이다.
 * `tilt`는 눕힌 각(90이면 바닥에 완전히 눕는다), `spin`은 판 안에서 그림을 돌리는 각이다.
 *
 * 씬에서 종이 위에 눕는 그림이므로 여기서도 눕혀 두고, 보는 각도는 로비와 같이
 * 미리보기 카메라가 정한다.
 */
export const CREDIT_STICKER_POSE = { tilt: 60, spin: 10 }
