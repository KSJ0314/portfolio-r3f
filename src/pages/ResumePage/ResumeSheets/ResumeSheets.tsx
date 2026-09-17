import { useRef } from 'react'
import { usePagination } from './ResumeSheets.hooks'
import { Block, MeasureSheet, PageNumber, Sheet, SheetFrame } from './ResumeSheets.styled'
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
        {blocks.map(({ key, tight, breakBefore, node }) => (
          <Block key={key} $tight={tight} data-block data-break={breakBefore ? '' : undefined}>
            {node}
          </Block>
        ))}
      </MeasureSheet>

      {pages.map((indexes, page) => (
        // 틀은 인쇄에서만 자리를 갖는다. 화면에서는 없는 것처럼 지나가 장이 그대로 쌓인다.
        <SheetFrame key={page}>
          <Sheet>
            {indexes.map((index) => {
              const { key, tight, anchor, node } = blocks[index]
              return (
                // 옮겨 올 자리는 여기에만 둔다. 높이를 재는 자리에도 두면 id가 둘이라
                // 화면 밖에 그려 둔 쪽으로 옮겨 간다.
                <Block key={key} id={anchor} $tight={tight}>
                  {node}
                </Block>
              )
            })}
            <PageNumber>
              {page + 1} / {pages.length}
            </PageNumber>
          </Sheet>
        </SheetFrame>
      ))}
    </>
  )
}
