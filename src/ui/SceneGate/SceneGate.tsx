import { useEffect, useState } from 'react'
import { useSceneReadyStore } from '../../state/useSceneReadyStore'
import {
  MAX_RELOADS,
  READY_TIMEOUT,
  RELOAD_COUNT_KEY,
  REQUIRED_KEYS,
} from './SceneGate.constants'
import { Cover } from './SceneGate.styled'

/** 저장이 막힌 환경(시크릿 모드 등)에서도 조용히 동작하도록 감싼다. */
function readReloadCount(): number {
  try {
    const raw = sessionStorage.getItem(RELOAD_COUNT_KEY)
    const count = raw === null ? 0 : Number.parseInt(raw, 10)
    return Number.isFinite(count) && count > 0 ? count : 0
  } catch {
    return 0
  }
}

function writeReloadCount(count: number) {
  try {
    sessionStorage.setItem(RELOAD_COUNT_KEY, String(count))
  } catch {
    // 저장이 막혀 있으면 재시도 횟수를 세지 못한다. 아래에서 새로고침을 건너뛴다.
  }
}

function clearReloadCount() {
  try {
    sessionStorage.removeItem(RELOAD_COUNT_KEY)
  } catch {
    // 지우지 못해도 다음 세션에서 사라진다.
  }
}

/**
 * 첫 화면 가림막.
 *
 * 바닥·캐릭터·Intro가 모두 준비될 때까지 덮어, 준비되는 대로 하나씩 나타나 순서가 뒤집혀 보이는 것을 막는다.
 * **한 번 걷으면 다시 덮지 않는다** — 이후 스테이션을 열며 굽는 텍스처에까지 반응하면 안 된다.
 *
 * 제 시간에 준비되지 않으면 새로고침해 다시 시도하고, 정해진 횟수를 넘기면 그냥 걷는다.
 * 무한정 기다려 흰 화면에 갇히는 것도, 새로고침을 반복하는 것도 막기 위함이다.
 */
const allReady = (ready: Record<string, boolean>) => REQUIRED_KEYS.every((key) => ready[key])

export function SceneGate() {
  // 한 번 걷히면 되돌리지 않으므로 준비 상태를 구독해 리렌더하지 않고, 다 찼을 때만 스토어에서 받는다.
  const [uncovered, setUncovered] = useState(() => allReady(useSceneReadyStore.getState().ready))
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (uncovered) {
      clearReloadCount()
      return
    }
    return useSceneReadyStore.subscribe((state) => {
      if (!allReady(state.ready)) return
      clearReloadCount()
      setUncovered(true)
    })
  }, [uncovered])

  useEffect(() => {
    if (uncovered) return
    const timer = setTimeout(() => {
      const count = readReloadCount()
      if (count < MAX_RELOADS) {
        writeReloadCount(count + 1)
        window.location.reload()
      } else {
        // 새로고침을 되풀이해도 안 되는 상황이다. 흰 화면에 갇히느니 그냥 걷는다.
        setUncovered(true)
      }
    }, READY_TIMEOUT)
    return () => clearTimeout(timer)
  }, [uncovered])

  if (!visible) return null

  return (
    <Cover
      $hidden={uncovered}
      // 다 사라진 뒤에 트리에서 뺀다. 투명해진 채로 남겨두면 쓸데없이 한 겹이 계속 얹혀 있다.
      onTransitionEnd={() => setVisible(false)}
    />
  )
}
