import styled from 'styled-components'

export const Page = styled.main`
  min-height: 100vh;
  padding: 48px 24px;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  font-family: ${({ theme }) => theme.fonts.body};
`

export const Sheet = styled.div`
  max-width: 800px;
  margin: 0 auto;
`
