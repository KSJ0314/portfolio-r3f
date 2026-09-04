import { useRef } from 'react'
import { usePagination } from './ResumeSheets.hooks'
import { Block, MeasureSheet, Sheet } from './ResumeSheets.styled'
import type { ResumeSheetsProps } from './ResumeSheets.types'

/**
 * 블록들을 A4 장에 나눠 담아 쌓는다.
 *
 * 블록 높이는 글자 수·줄바꿈·글꼴에 따라 달라져 미리 알 수 없으므로,
 * 화면 밖에 한 번 그려 재고 그 높이로 장을 나눈다.
 */
export function ResumeSheets({ blocks }: ResumeSheetsProps) {
  const measureRef = useRef<HTMLDivElement>(null)
  const pages = usePagination(measureRef)

  return (
    <>
      {/* 높이를 재는 자리. 실제 장과 같은 폭·여백이라 여기서 잰 높이가 그대로 쓰인다. */}
      <MeasureSheet ref={measureRef} aria-hidden>
        {blocks.map(({ key, tight, node }) => (
          <Block key={key} $tight={tight} data-block>
            {node}
          </Block>
        ))}
      </MeasureSheet>

      {pages.map((indexes, page) => (
        <Sheet key={page}>
          {indexes.map((index) => {
            const { key, tight, node } = blocks[index]
            return (
              <Block key={key} $tight={tight}>
                {node}
              </Block>
            )
          })}
        </Sheet>
      ))}
    </>
  )
}
