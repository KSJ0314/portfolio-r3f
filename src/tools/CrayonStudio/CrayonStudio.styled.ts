import styled, { css } from 'styled-components'
import { PAPER_TILE_PX } from './CrayonStudio.constants'

/** 오른쪽 아래 구석에 놓이는 스튜디오 여는 버튼. */
export const LaunchButton = styled.button`
  position: fixed;
  right: 16px;
  bottom: 16px;
  z-index: 20;
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  padding: 0;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.22);
  transition: transform 0.15s ease, box-shadow 0.15s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.26);
  }
`

/** `$fullPage`는 단독 페이지(`/crayon`)용 — 뒤에 덮을 화면이 없어 어둡게 깔지 않고 여백도 두지 않는다. */
export const Backdrop = styled.div<{ $fullPage?: boolean }>`
  position: fixed;
  inset: 0;
  z-index: 30;
  display: grid;
  place-items: center;
  padding: ${({ $fullPage }) => ($fullPage ? '0' : '24px')};
  background: ${({ theme, $fullPage }) =>
    $fullPage ? theme.colors.background : 'rgba(20, 20, 28, 0.45)'};
`

/** 단독 페이지에서는 카드 테두리를 벗고 화면을 꽉 채운다. 남는 가로 여백은 양쪽으로 나눠 가운데 정렬. */
export const Panel = styled.div<{ $fullPage?: boolean }>`
  position: relative;
  display: flex;
  justify-content: center;
  gap: 20px;
  max-width: 100%;
  height: 100%;
  padding: 20px;
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  font-family: ${({ theme }) => theme.fonts.body};

  ${({ $fullPage, theme }) =>
    $fullPage
      ? css`
          width: 100%;
        `
      : css`
          border-radius: 14px;
          border: 1px solid ${theme.colors.border};
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
        `}
`

/**
 * 그리는 판. 실제 바닥과 같은 모눈종이를 깔아 종이 위에서 어떻게 보이는지 그대로 확인한다.
 * 모달에서는 1:1 정사각, 단독 페이지에서는 남는 공간을 전부 채운다(캔버스도 같은 비로 따라간다).
 */
export const Board = styled.div<{ $fullPage?: boolean }>`
  position: relative;
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-image: url('/textures/paper/grid-paper.png');
  background-repeat: repeat;
  background-size: ${PAPER_TILE_PX}px ${PAPER_TILE_PX}px;

  ${({ $fullPage }) =>
    $fullPage
      ? css`
          flex: 1 1 auto;
          min-width: 0;
        `
      : css`
          flex: 0 1 auto;
          aspect-ratio: 1;
          max-width: 60vw;
        `}
`

export const BoardCanvas = styled.canvas<{ $cursor: string }>`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  cursor: ${({ $cursor }) => $cursor};
  touch-action: none;
`

/** 그리기/지우개 전환. 아래쪽 버튼 묶음 바로 위에 붙도록 남는 공간을 여기서 밀어낸다. */
export const ToolRow = styled.div`
  display: flex;
  gap: 10px;
  margin-top: auto;
`

/** 도구 하나를 고르는 동그란 버튼. 고른 쪽만 테두리를 굵게 해 아이콘 색을 가리지 않는다. */
export const IconButton = styled.button<{ $active?: boolean }>`
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  padding: 0;
  border-radius: 50%;
  cursor: pointer;
  background: ${({ theme }) => theme.colors.surface};
  border: ${({ theme, $active }) =>
    $active ? `2px solid ${theme.colors.accent}` : `1px solid ${theme.colors.border}`};
  opacity: ${({ $active }) => ($active ? 1 : 0.5)};
  transition: opacity 0.15s ease, border-color 0.15s ease;

  &:hover {
    opacity: 1;
  }
`

/**
 * 이 안쪽에 그려야 알갱이가 잘리지 않는다는 표시. 여백은 지금 굵기·손떨림에서 계산해 받는다.
 * 판이 정사각이 아닐 수 있어 가로세로를 따로 받는다 — 같은 픽셀 여백이라도 축마다 비율이 다르다.
 */
export const SafeGuide = styled.div<{ $insetX: number; $insetY: number }>`
  position: absolute;
  inset: ${({ $insetY }) => $insetY * 100}% ${({ $insetX }) => $insetX * 100}%;
  pointer-events: none;
  border: 1px dashed ${({ theme }) => theme.colors.border};
  border-radius: 4px;
`

export const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  flex: 0 0 244px;
  width: 244px;
  overflow-y: auto;
`

export const Title = styled.h2`
  margin: 0;
  /* 우측 상단 닫기 버튼 자리를 비워 둔다. */
  padding-right: 32px;
  font-family: ${({ theme }) => theme.fonts.hand};
  font-size: 28px;
  font-weight: 400;
`

export const CloseButton = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  padding: 0;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  background: none;
  color: inherit;
  opacity: 0.55;
  transition: opacity 0.15s ease, background 0.15s ease;

  &:hover {
    opacity: 1;
    background: ${({ theme }) => theme.colors.background};
  }
`

/** 크레파스 속성을 한 덩어리로 묶는 칸. */
export const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  border-radius: 10px;
  border: 1px solid ${({ theme }) => theme.colors.border};
`

export const SectionHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 12px;
  font-weight: 600;
  opacity: 0.8;
`

export const ResetButton = styled.button`
  padding: 3px 8px;
  border-radius: 6px;
  cursor: pointer;
  font: inherit;
  font-size: 11px;
  font-weight: 400;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: inherit;
  opacity: 0.75;
  transition: opacity 0.15s ease;

  &:hover:not(:disabled) {
    opacity: 1;
  }

  &:disabled {
    opacity: 0.3;
    cursor: default;
  }
`

export const Field = styled.label`
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
`

export const FieldHead = styled.span`
  display: flex;
  justify-content: space-between;
  gap: 8px;
  opacity: 0.75;
`

export const Slider = styled.input`
  width: 100%;
  accent-color: ${({ theme }) => theme.colors.accent};
`

export const ColorRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

export const ColorInput = styled.input`
  width: 40px;
  height: 28px;
  padding: 0;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 6px;
  background: none;
  cursor: pointer;
`

export const TextInput = styled.input`
  flex: 1;
  min-width: 0;
  padding: 5px 8px;
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.background};
  color: inherit;
  font: inherit;
  font-size: 12px;
`

export const Buttons = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  padding-top: 4px;
`

export const Button = styled.button<{ $wide?: boolean; $primary?: boolean }>`
  grid-column: ${({ $wide }) => ($wide ? 'span 2' : 'auto')};
  padding: 8px 10px;
  border-radius: 8px;
  cursor: pointer;
  font: inherit;
  font-size: 12px;
  border: 1px solid ${({ theme, $primary }) => ($primary ? theme.colors.accent : theme.colors.border)};
  background: ${({ theme, $primary }) => ($primary ? theme.colors.accent : theme.colors.surface)};
  color: ${({ theme, $primary }) => ($primary ? '#ffffff' : theme.colors.text)};
  transition: filter 0.15s ease;

  &:hover:not(:disabled) {
    filter: brightness(0.96);
  }

  &:disabled {
    opacity: 0.4;
    cursor: default;
  }
`
