import styled from 'styled-components'

/** 항목 하나의 자리. 내용을 채우기 전까지는 테두리로 자리만 보인다. */
export const Entry = styled.div`
  min-height: 40px;
  border: 1px dashed ${({ theme }) => theme.colors.border};
`
