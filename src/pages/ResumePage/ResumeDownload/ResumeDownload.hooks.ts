import { useEffect, useState, type RefObject } from 'react'

/**
 * 그 요소가 세로 스크롤바에 내주고 있는 폭. 스크롤바가 없으면 0이다.
 *
 * 상수로 둘 수 없는 값이다 — 스크롤바 폭은 운영체제·브라우저 설정에 따라 다르고,
 * 내용 위에 겹쳐 뜨는 환경(macOS 기본)에서는 아예 자리를 차지하지 않는다.
 */
export function useScrollbarWidth(host: RefObject<HTMLElement | null>): number {
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const el = host.current
    if (!el) return

    // 창을 줄이거나 내용이 늘어 스크롤바가 생기고 사라지면 폭이 달라지므로 크기를 구독한다.
    // 관찰을 걸면 곧바로 한 번 불리므로 첫 측정도 여기서 이뤄진다.
    const observer = new ResizeObserver(() => setWidth(el.offsetWidth - el.clientWidth))
    observer.observe(el)
    return () => observer.disconnect()
  }, [host])

  return width
}
