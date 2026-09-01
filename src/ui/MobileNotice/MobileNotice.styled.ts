import styled from 'styled-components'

/**
 * 화면을 통째로 덮는 안내 자리.
 *
 * 굽는 동안 덮는 가림막(z-index 90)과 뒤로 가기 버튼(100)보다 위에 둔다.
 * 안내가 다른 요소보다 먼저 읽혀야 한다.
 */
export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 110;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 32px 24px;
  white-space: pre-line;
  word-break: keep-all;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  font-family: ${({ theme }) => theme.fonts.body};
`
  
  export const Title = styled.h1`
  text-align: center;
  font-size: 20px;
  font-weight: 700;
  line-height: 1.7;
`
  
  export const Body = styled.p`
  max-width: 32em;
  font-size: 15px;
  opacity: 0.75;
  line-height: 1.5;
`

export const Action = styled.button`
  margin-top: 8px;
  padding: 12px 24px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 15px;
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  font-family: inherit;
  font-size: 15px;
  cursor: pointer;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
`
