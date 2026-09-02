/**
 * 누를 수 있다는 표시를 트리거 윗면에서 띄우는 높이.
 * 윗면 기준이라 트리거 크기가 바뀌어도 붙어 다닌다.
 */
export const LOBBY_TRIGGER_MARKER_GAP = 0.2

/**
 * 통로 표시를 트리거 남쪽 면에서 로비 쪽으로 더 빼는 거리.
 * 문틀을 감싼 상자의 중심에 두면 문 안쪽에 잠겨 보인다.
 */
export const LOBBY_PASSAGE_MARKER_FORWARD = 2

/** 통로 표시를 트리거 윗면에서 아래로 내리는 거리. 문틀 상자가 높아 그대로 두면 천장 가까이 뜬다. */
export const LOBBY_PASSAGE_MARKER_DROP = 0.4

/** 표시 원뿔 크기. 실내 축척이 맵보다 작아 맵(0.5)보다 작게 둔다. */
export const LOBBY_TRIGGER_MARKER_SIZE = 0.15

/** 위아래로 흔들리는 폭. 크기에 맞춰 맵보다 얕다. */
export const LOBBY_TRIGGER_MARKER_BOB = 0.03

/** 한 번 오르내리는 데 걸리는 시간(초). */
export const LOBBY_TRIGGER_MARKER_BOB_SECONDS = 1.6

/** 한 바퀴 도는 데 걸리는 시간(초). */
export const LOBBY_TRIGGER_MARKER_SPIN_SECONDS = 3

/** 나타나고 사라지는 데 걸리는 시간(초). */
export const LOBBY_TRIGGER_MARKER_FADE_SECONDS = 0.4
