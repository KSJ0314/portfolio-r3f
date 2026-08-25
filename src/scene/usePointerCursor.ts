import { useCallback, useEffect, useRef } from 'react'

/**
 * 지금 손가락 커서를 요구하는 요소 수.
 * 커서는 문서 하나뿐이라 요소마다 따로 켜고 끄면 서로 덮어쓴다. 하나라도 얹혀 있으면 손가락이다.
 */
let hoverCount = 0

function applyCursor() {
  document.body.style.cursor = hoverCount > 0 ? 'pointer' : ''
}

/**
 * 누를 수 있는 씬 요소에 손가락 커서를 붙인다.
 *
 * 씬 안의 메시는 DOM이 아니라 `cursor` 스타일을 걸 대상이 없으므로, 포인터가 얹힐 때
 * 문서 커서를 직접 바꾼다.
 *
 * **되돌리는 것은 자기가 얹혀 있었을 때만 한다.** 조건 없이 지우면 갓 마운트된 요소의 정리가
 * 남이 얹혀 있는 커서까지 지운다(StrictMode는 마운트할 때 이펙트를 정리까지 한 번 더 돌린다).
 * 판이 겹쳐 둘에 함께 얹혔다가 한쪽에서 벗어날 때도 같은 일이 난다.
 *
 * `enabled`를 끄면 핸들러가 빠져 그 메시는 R3F 이벤트 대상이 아니게 된다.
 * 이때도 자기 몫을 되돌린다 — 얹힌 채로 꺼지면 `onPointerOut`이 불릴 기회가 없다.
 */
export function usePointerCursor(enabled = true) {
  /** 이 요소에 지금 포인터가 얹혀 있는지. 정리할 때 자기 몫만 내리려고 기억한다. */
  const hovering = useRef(false)

  const release = useCallback(() => {
    if (!hovering.current) return
    hovering.current = false
    hoverCount -= 1
    applyCursor()
  }, [])

  useEffect(() => {
    if (!enabled) release()
  }, [enabled, release])

  useEffect(() => release, [release])

  if (!enabled) return {}

  return {
    onPointerOver: () => {
      if (hovering.current) return
      hovering.current = true
      hoverCount += 1
      applyCursor()
    },
    onPointerOut: release,
  }
}
