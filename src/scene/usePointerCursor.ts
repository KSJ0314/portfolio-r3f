import { useEffect } from 'react'

/**
 * 누를 수 있는 씬 요소에 손가락 커서를 붙인다.
 *
 * 씬 안의 메시는 DOM이 아니라 `cursor` 스타일을 걸 대상이 없으므로, 포인터가 얹힐 때
 * 문서 커서를 직접 바꾼다. 얹힌 채로 언마운트되면 되돌릴 기회가 없으므로 정리도 함께 건다.
 *
 * `enabled`를 끄면 핸들러가 빠져 그 메시는 R3F 이벤트 대상이 아니게 된다.
 * 이때 커서도 함께 되돌린다 — 포인터가 얹힌 채로 꺼지면 `onPointerOut`이 불릴 기회가 없어
 * 손가락 모양이 그대로 남는다.
 */
export function usePointerCursor(enabled = true) {
  useEffect(() => {
    if (enabled) return
    document.body.style.cursor = ''
  }, [enabled])

  useEffect(() => {
    return () => {
      document.body.style.cursor = ''
    }
  }, [])

  if (!enabled) return {}

  return {
    onPointerOver: () => {
      document.body.style.cursor = 'pointer'
    },
    onPointerOut: () => {
      document.body.style.cursor = ''
    },
  }
}
