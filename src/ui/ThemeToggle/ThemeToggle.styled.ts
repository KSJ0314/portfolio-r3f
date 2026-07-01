import styled from 'styled-components'

export const ToggleButton = styled.button`
  position: fixed;
  top: 16px;
  left: 16px;
  z-index: 10;
  padding: 8px 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  font-size: 14px;
  cursor: pointer;
  transition: background 0.3s ease, color 0.3s ease, border-color 0.3s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.accent};
  }
`
