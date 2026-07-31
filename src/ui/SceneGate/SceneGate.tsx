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

/** 저장에 성공했는지 돌려준다. 실패하면 횟수를 셀 수 없으므로 새로고침해서는 안 된다. */
function writeReloadCount(count: number): boolean {
  try {
    sessionStorage.setItem(RELOAD_COUNT_KEY, String(count))
    return true
  } catch {
    return false
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
  // 준비 상태를 그대로 구독한다. 이름은 올라가기만 하고 내려가지 않으므로 한 번 참이 되면 그대로다 —
  // 따로 잠글 필요가 없고, 구독을 거는 사이에 마지막 신호를 놓치는 일도 없다.
  const ready = useSceneReadyStore((s) => allReady(s.ready))
  const [forced, setForced] = useState(false)
  const [visible, setVisible] = useState(true)
  const uncovered = ready || forced

  useEffect(() => {
    if (ready) clearReloadCount()
  }, [ready])

  useEffect(() => {
    if (uncovered) return
    const timer = setTimeout(() => {
      const count = readReloadCount()
      // 저장이 막힌 환경(시크릿 모드 등)에서는 횟수가 늘 0이라 상한에 닿지 못한다.
      // 그대로 새로고침하면 무한히 되풀이하므로, 셀 수 없으면 재시도하지 않는다.
      if (count < MAX_RELOADS && writeReloadCount(count + 1)) {
        window.location.reload()
      } else {
        // 새로고침을 되풀이해도 안 되는 상황이다. 흰 화면에 갇히느니 그냥 걷는다.
        setForced(true)
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
