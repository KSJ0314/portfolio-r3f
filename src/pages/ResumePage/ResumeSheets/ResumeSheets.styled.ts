import styled from 'styled-components'
import {
  A4_HEIGHT_MM,
  A4_WIDTH_MM,
  BLOCK_GAP,
  ITEM_GAP,
  SHEET_PADDING,
  SHEET_SCREEN_SCALES,
  SHEET_WIDTH,
} from '../ResumePage.constants'

/** CSS 절대 단위 환산비. 규격이 `1in = 96px = 25.4mm`로 못 박고 있어 상수로 둘 수 있다. */
const PX_PER_MM = 96 / 25.4

/**
 * 인쇄에서 장에 거는 배율. 화면 좌표계(`SHEET_WIDTH`px)를 A4 폭에 맞춘다.
 *
 * 장 안쪽 치수를 mm로 옮기지 않고 통째로 줄이므로 글자·여백·선이 한 비율로 함께 줄어,
 * 화면에서 보는 그림이 그대로 종이에 앉는다.
 */
const PRINT_SCALE = (A4_WIDTH_MM * PX_PER_MM) / SHEET_WIDTH

/**
 * 화면 너비 구간별 `zoom` 규칙(`SHEET_SCREEN_SCALES`). 너비가 큰 구간이 뒤에 오므로 조건이 겹치면 뒤 규칙이 적용된다.
 * `@media screen`으로 한정해 인쇄 배율과 충돌하지 않는다.
 * `transform`은 레이아웃 크기가 그대로 남아 페이지 간격이 틀어지므로 `zoom`을 사용한다.
 */
const SCREEN_ZOOM = SHEET_SCREEN_SCALES.map(
  ({ minWidth, scale }) => `@media screen and (min-width: ${minWidth}px) { zoom: ${scale}; }`,
).join('\n')

/**
 * 인쇄에서 한 페이지 자리를 차지하고 페이지를 끊는 틀.
 *
 * `transform`은 그려지는 크기만 줄이고 **차지하는 자리는 원래대로 남긴다.** 장에 직접 페이지 끊김을 걸면
 * 브라우저가 줄기 전 크기로 자리를 잡아 한 장이 여러 페이지에 걸친다. 그래서 실치수를 갖는 틀을 밖에 두고,
 * 줄어든 장이 그 안에 앉는다.
 *
 * 화면에서는 `display: contents`로 없는 것처럼 두어 장이 지금처럼 그대로 쌓인다.
 */
export const SheetFrame = styled.div`
  display: contents;

  @media print {
    display: block;
    width: ${A4_WIDTH_MM}mm;
    height: ${A4_HEIGHT_MM}mm;
    /* 반올림으로 몇 분의 1px이 넘쳐 빈 페이지가 끼는 것을 막는다. */
    overflow: hidden;
    break-after: page;

    &:last-of-type {
      break-after: auto;
    }
  }
`

/**
 * A4 한 장.
 *
 * 화면에서는 폭을 고정하고 세로를 A4 비율로 따라가게 둔다 — 창 크기와 무관하게 여백·글자 비율이 같다.
 * 인쇄에서는 크기를 바꾸지 않고 통째로 줄인다. 안쪽 치수가 화면 좌표계 그대로라 비율이 어긋나지 않는다.
 */
export const Sheet = styled.section`
  /* 쌓아 놓은 장이 스크롤 안에서 눌리지 않도록 줄어들지 않게 둔다. */
  flex: 0 0 auto;
  /* 쪽 번호가 이 안의 아래 여백에 자리를 잡는다. */
  position: relative;
  width: ${SHEET_WIDTH}px;
  aspect-ratio: ${A4_WIDTH_MM} / ${A4_HEIGHT_MM};
  padding: ${SHEET_PADDING}px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: 0 2px 12px rgb(0 0 0 / 8%);

  ${SCREEN_ZOOM}

  @media print {
    border: none;
    box-shadow: none;
    /* 왼쪽 위를 기준으로 줄여야 틀의 모서리와 맞는다. 기본값(가운데)이면 안쪽으로 밀린다. */
    transform: scale(${PRINT_SCALE});
    transform-origin: top left;
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

  /* 화면 배율은 실제 페이지에만 적용한다. 측정용 요소에도 적용하면 측정 높이가 배율에 따라 달라진다. */
  @media screen {
    zoom: 1;
  }

  @media print {
    display: none;
  }
`

/**
 * 장 아래에 찍는 쪽 번호.
 *
 * **장의 아래 여백 안에 띄운다.** 본문 흐름에 두면 그만큼 담을 높이가 줄어드는데,
 * 페이지를 나누는 쪽은 여백을 뺀 높이를 다 쓸 수 있다고 보고 세므로 마지막 블록이 넘친다.
 */
export const PageNumber = styled.span`
  position: absolute;
  left: 0;
  right: 0;
  bottom: ${Math.round(SHEET_PADDING / 2)}px;
  text-align: center;
  font-size: 12px;
  line-height: 1;
  color: #696969;
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
