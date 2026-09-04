import styled from 'styled-components'
import {
  A4_HEIGHT_MM,
  A4_WIDTH_MM,
  BLOCK_GAP,
  ITEM_GAP,
  SHEET_PADDING,
  SHEET_PADDING_MM,
  SHEET_WIDTH,
} from '../ResumePage.constants'

/**
 * A4 한 장.
 *
 * 화면에서는 폭을 고정하고 세로를 A4 비율로 따라가게 둔다 — 창 크기와 무관하게 여백·글자 비율이 같다.
 * 인쇄할 때만 실치수(mm)로 바꾸고 장마다 페이지를 끊는다.
 */
export const Sheet = styled.section`
  /* 쌓아 놓은 장이 스크롤 안에서 눌리지 않도록 줄어들지 않게 둔다. */
  flex: 0 0 auto;
  width: ${SHEET_WIDTH}px;
  aspect-ratio: ${A4_WIDTH_MM} / ${A4_HEIGHT_MM};
  padding: ${SHEET_PADDING}px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: 0 2px 12px rgb(0 0 0 / 8%);

  @media print {
    width: ${A4_WIDTH_MM}mm;
    height: ${A4_HEIGHT_MM}mm;
    aspect-ratio: auto;
    padding: ${SHEET_PADDING_MM}mm;
    border: none;
    box-shadow: none;
    break-after: page;
  }

  &:last-of-type {
    break-after: auto;
  }
`

/**
 * 페이지를 나누기 전에 블록 높이를 재는 자리.
 *
 * 장과 같은 폭·여백이라 여기서 잰 높이가 실제로 놓일 높이와 같다.
 * 화면 흐름에서 빼 두고 감춰, 재는 동안 방문자에게 보이지 않는다.
 */
export const MeasureSheet = styled(Sheet).attrs({ as: 'div' })`
  position: absolute;
  top: 0;
  left: 0;
  height: auto;
  aspect-ratio: auto;
  visibility: hidden;
  pointer-events: none;
  border: none;
  box-shadow: none;

  @media print {
    display: none;
  }
`

/**
 * 페이지를 나누는 단위. 잘리지 않고 통째로 한 장에 들어간다.
 *
 * 위 여백을 `margin`이 아니라 `padding`으로 두는 것은 측정한 높이에 여백이 함께 잡히게 하기 위함이다.
 * 장의 첫 블록은 위 여백을 두지 않으므로, 실제 높이는 측정값보다 작거나 같다.
 */
export const Block = styled.div<{ $tight?: boolean }>`
  flex: 0 0 auto;
  padding-top: ${({ $tight }) => ($tight ? ITEM_GAP : BLOCK_GAP)}px;

  &:first-child {
    padding-top: 0;
  }
`
