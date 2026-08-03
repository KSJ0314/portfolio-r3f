import styled from 'styled-components'

export const MinimapPanel = styled.button`
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 10;
  width: 164px;
  height: 164px;
  padding: 0;
  border-radius: 50%;
  overflow: hidden;
  /* 누르면 월드맵이 열린다. */
  cursor: pointer;
  border: 2px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.22);
  transition: border-color 0.3s ease, background 0.3s ease, box-shadow 0.2s ease,
    transform 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.accent};
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.28);
    transform: scale(1.03);
  }
`

export const MinimapSvg = styled.svg`
  width: 100%;
  height: 100%;
  display: block;
`
