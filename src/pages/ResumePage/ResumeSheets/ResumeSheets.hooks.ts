import { useEffect, useLayoutEffect, useState, type RefObject } from 'react'
import { A4_HEIGHT_MM, A4_WIDTH_MM } from '../ResumePage.constants'

/**
 * 블록들을 A4 한 장에 들어가는 만큼씩 나눠 페이지를 만든다.
 *
 * 블록 높이는 미리 알 수 없어(글자 수·줄바꿈·글꼴에 따라 달라진다) 화면 밖에 한 번 그려 측정한다.
 * 한 장을 넘길 블록은 쪼개지 않고 통째로 다음 장에서 시작한다.
 * `data-break`를 단 블록은 자리가 남아도 새 장에서 시작한다.
 *
 * 데이터가 늦게 와 내용이 늘거나 글꼴이 뒤늦게 적용되면 높이가 달라지므로 그때마다 다시 잰다.
 */
export function usePagination(measureRef: RefObject<HTMLElement | null>): number[][] {
  const [pages, setPages] = useState<number[][]>([])
  // 다시 재야 하는 일이 생기면 이 값을 올려 아래 측정을 다시 돌린다.
  const [revision, setRevision] = useState(0)

  useLayoutEffect(() => {
    const root = measureRef.current
    if (!root) return

    const blocks = Array.from(root.querySelectorAll<HTMLElement>('[data-block]'))
    if (blocks.length === 0) {
      setPages([])
      return
    }

    // 장의 세로는 A4 비율에서 나오고, 안쪽 높이는 거기서 위아래 여백을 뺀 값이다.
    // 여백은 상수로 다시 계산하지 않고 실제 적용된 값을 읽어, 스타일을 바꿔도 어긋나지 않는다.
    const style = getComputedStyle(root)
    const paddingTop = parseFloat(style.paddingTop)
    const paddingBottom = parseFloat(style.paddingBottom)
    const sheetHeight = (root.offsetWidth * A4_HEIGHT_MM) / A4_WIDTH_MM
    const available = sheetHeight - paddingTop - paddingBottom

    const next: number[][] = []
    let current: number[] = []
    let used = 0

    blocks.forEach((block, index) => {
      // 블록 사이 여백은 블록의 `padding-top`이라 이 높이에 이미 들어 있다.
      // 다만 장의 첫 블록은 그 여백을 두지 않으므로, 새 장을 열 때는 빼고 센다.
      const height = block.offsetHeight
      const alone = height - parseFloat(getComputedStyle(block).paddingTop)
      const breaks = block.dataset.break !== undefined
      if (current.length > 0 && (breaks || used + height > available)) {
        next.push(current)
        current = [index]
        used = alone
        return
      }
      current.push(index)
      used += current.length === 1 ? alone : height
    })
    if (current.length > 0) next.push(current)

    setPages(next)
  }, [measureRef, revision])

  // 폭이 바뀌면 줄 수가 달라지고, 데이터가 늦게 오면 내용이 늘어 높이가 달라진다.
  // 개수가 아니라 실제 크기를 보므로 블록 수가 그대로여도 잡힌다.
  useEffect(() => {
    const root = measureRef.current
    if (!root) return
    const observer = new ResizeObserver(() => setRevision((n) => n + 1))
    observer.observe(root)
    root.querySelectorAll<HTMLElement>('[data-block]').forEach((block) => observer.observe(block))
    return () => observer.disconnect()
  }, [measureRef])

  // 글꼴이 늦게 오면 기본 글꼴로 잰 높이가 남는다.
  useEffect(() => {
    let alive = true
    void document.fonts.ready.then(() => {
      if (alive) setRevision((n) => n + 1)
    })
    return () => {
      alive = false
    }
  }, [])

  return pages
}
