/**
 * 조여드는·열리는 데 걸리는 시간(초).
 *
 * 조여드는 쪽은 **부르는 쪽이 따로 정할 수 있고**(`close`의 인자) 여기 있는 것은 그 기본값이다.
 * 캐릭터가 걸어 들어가는 동안 함께 도는 구간이라, 장면마다 그 걸음이 다르면 시간도 달라야 한다.
 */
export const IRIS_CLOSE_SECONDS = 2
export const IRIS_OPEN_SECONDS = 0.9

/** 이징 — 가운데로 모일수록 빨라졌다가 마지막에 멎는다. */
export const IRIS_EASE = 'power2.inOut'

/**
 * 다 덮인 뒤 최소로 머무는 시간(초).
 * 도착이 곧바로 알려지면(캐시가 더울 때) 덮자마자 열려 깜빡인다.
 */
export const IRIS_MIN_COVER_SECONDS = 0.35

/**
 * 도착 신호를 이만큼 기다려도 오지 않으면 그냥 연다(초).
 * 알릴 주체가 없거나 실패한 화면에서 영영 까만 채로 갇히지 않게 한다.
 */
export const IRIS_MAX_COVER_SECONDS = 8

/** 덮는 색. 종이 밖 여백이 아니라 눈을 감는 연출이라 테마와 무관하게 검다. */
export const IRIS_COLOR = '#000000'
