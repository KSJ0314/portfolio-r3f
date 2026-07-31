/**
 * 첫 화면에 반드시 있어야 하는 것들. 이것들이 다 준비돼야 가림막을 걷는다.
 * 나머지(다른 스테이션의 그림 등)는 나중에 나타나도 무방하므로 기다리지 않는다.
 *
 * Intro는 글씨와 사진이 준비되는 시점이 달라 경계가 나뉘어 있으므로 둘 다 확인한다.
 */
export const REQUIRED_KEYS = ['ground', 'character', 'station:about-intro', 'intro-photo']

/** 이 시간 안에 준비되지 않으면 무언가 잘못된 것으로 본다(ms). */
export const READY_TIMEOUT = 3000

/** 시간을 넘겼을 때 새로고침해 다시 시도하는 최대 횟수. 넘으면 그냥 걷는다. */
export const MAX_RELOADS = 2

/** 재시도 횟수를 담아두는 키. 탭을 닫으면 사라져야 하므로 sessionStorage를 쓴다. */
export const RELOAD_COUNT_KEY = 'sceneGate.reloads'

/** 가림막이 사라지는 데 걸리는 시간(초). CSS 전환 시간과 같아야 한다. */
export const FADE_SECONDS = 0.3
