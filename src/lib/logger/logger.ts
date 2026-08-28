import createDebug from 'debug'

/**
 * 개발용 로그.
 *
 * 무엇이 언제 일어나는지를 콘솔에서 따라갈 수 있게 한다 — 에셋을 언제 받기 시작하는지,
 * 스테이션이 언제 열리고 닫히는지처럼 **한 번씩 일어나는 일**을 남긴다.
 * 매 프레임 도는 자리에는 두지 않는다. 초당 수백 줄이 쏟아져 콘솔을 쓸 수 없게 된다.
 *
 * 태그는 `영역:대상` 꼴이고(`asset:lobby` · `station:lifecycle`), 개발용 HUD의 "로그" 폴더에서
 * 영역을 골라 켜고 끈다. 고른 것은 `localStorage`에 남아 새로고침해도 유지된다.
 *
 * 앞 로그와의 시간 차(`+340ms`)가 함께 찍히므로 "언제 시작해 얼마나 걸렸나"가 그대로 보인다.
 */

/** 로그 영역. HUD가 이 목록으로 항목을 만든다. */
export const LOG_AREAS = [
  { key: 'asset', label: '에셋' },
  { key: 'station', label: '스테이션' },
  { key: 'scene', label: '장면' },
  { key: 'data', label: '데이터' },
  { key: 'perf', label: '성능' },
  { key: 'interior', label: '실내' },
  { key: 'deco', label: '맵 장식' },
] as const

export type LogArea = (typeof LOG_AREAS)[number]['key']

/** `debug`가 켜는 값을 담아 두는 자리. 그쪽이 정한 이름이라 그대로 쓴다. */
const STORAGE_KEY = 'debug'

/** 아무것도 하지 않는 로그. 프로덕션에서는 이것이 나가 호출이 남아도 비용이 없다. */
const noop = () => {}

function readStored(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    // 저장이 막힌 환경(시크릿 모드 등). 고른 것이 없는 것으로 다룬다.
    return null
  }
}

function writeStored(value: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, value)
  } catch {
    // 저장하지 못해도 이번 세션에는 걸린다.
  }
}

/** 영역 목록을 `debug`가 읽는 문자열로 바꾼다(`asset:*,perf:*`). */
const toPattern = (areas: readonly string[]) => areas.map((area) => `${area}:*`).join(',')

/**
 * 지금 켜져 있는 영역. HUD의 초깃값으로 쓴다.
 *
 * 저장된 것이 없으면 전부 켜진 상태다 — 개발 중에 매번 켜게 두면 로그를 두는 뜻이 없다.
 */
export function getEnabledLogAreas(): LogArea[] {
  const stored = readStored()
  if (stored === null) return LOG_AREAS.map((area) => area.key)
  return LOG_AREAS.filter((area) => stored.includes(`${area.key}:`)).map((area) => area.key)
}

/**
 * 고른 영역만 켠다. **새로고침 없이 즉시 반영되고**, 저장해 두어 다음에 열 때도 유지된다.
 * 하나도 고르지 않으면 전부 끈다.
 */
export function setEnabledLogAreas(areas: readonly LogArea[]): void {
  const pattern = toPattern(areas)
  writeStored(pattern)
  createDebug.enable(pattern)
}

// 저장된 것이 없으면 전부 켠 채로 시작한다. 저장까지 해 두어야 HUD가 켠 것과 같은 상태가 된다.
if (import.meta.env.DEV && readStored() === null) {
  setEnabledLogAreas(LOG_AREAS.map((area) => area.key))
}

/**
 * 태그를 가진 로그 함수를 만든다.
 *
 * 프로덕션에서는 빈 함수를 돌려준다 — `import.meta.env.DEV`가 상수로 접히므로
 * 번들러가 이쪽 갈래만 남기고 나머지를 걷어낸다.
 */
export function createLogger(namespace: string): (...args: unknown[]) => void {
  if (!import.meta.env.DEV) return noop
  return createDebug(namespace)
}
