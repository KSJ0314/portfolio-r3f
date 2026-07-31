import { useEffect } from 'react'

/**
 * 누를 수 있는 씬 요소에 손가락 커서를 붙인다.
 *
 * 씬 안의 메시는 DOM이 아니라 `cursor` 스타일을 걸 대상이 없으므로, 포인터가 얹힐 때
 * 문서 커서를 직접 바꾼다. 얹힌 채로 언마운트되면 되돌릴 기회가 없으므로 정리도 함께 건다.
 */
export function usePointerCursor() {
  useEffect(() => {
    return () => {
      document.body.style.cursor = ''
    }
  }, [])

  return {
    onPointerOver: () => {
      document.body.style.cursor = 'pointer'
    },
    onPointerOut: () => {
      document.body.style.cursor = ''
    },
  }
}
