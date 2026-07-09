import styled from 'styled-components'

export const MinimapPanel = styled.div`
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 10;
  width: 164px;
  height: 164px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.22);
  transition: border-color 0.3s ease, background 0.3s ease;
`

export const MinimapSvg = styled.svg`
  width: 100%;
  height: 100%;
  display: block;
`
