import styled from 'styled-components'
import {
  CORNER_BUTTON_GAP,
  CORNER_BUTTON_MARGIN,
  CORNER_BUTTON_SIZE,
} from './CornerButton.constants'

/**
 * 오른쪽 아래 구석에 나란히 놓이는 동그란 버튼.
 *
 * 자리는 `$slot`이 정한다 — 오른쪽에서 몇 번째인지이고 0이 맨 오른쪽이다.
 * 버튼마다 좌표를 직접 적으면 크기나 간격을 바꿀 때 서로 겹치므로, 자리를 여기서 계산한다.
 */
export const CornerButton = styled.button<{ $slot: number }>`
  position: fixed;
  right: ${({ $slot }) =>
    CORNER_BUTTON_MARGIN + $slot * (CORNER_BUTTON_SIZE + CORNER_BUTTON_GAP)}px;
  bottom: ${CORNER_BUTTON_MARGIN}px;
  z-index: 20;
  width: ${CORNER_BUTTON_SIZE}px;
  height: ${CORNER_BUTTON_SIZE}px;
  display: grid;
  place-items: center;
  padding: 0;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.22);
  transition: transform 0.15s ease, box-shadow 0.15s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.26);
  }
`
