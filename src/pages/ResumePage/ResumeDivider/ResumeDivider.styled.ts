import styled from 'styled-components'

/**
 * 얇고 연한 구분선. 항목 사이처럼 경계만 알리면 되는 자리에 쓴다.
 *
 * 색은 곁글씨(`#696969`)보다 더 물러나 있어 글을 읽는 데 끼어들지 않는다.
 * 위아래 여백은 두지 않는다 — 긋는 쪽이 자기 간격 안에 놓는다.
 */
export const ResumeDivider = styled.hr`
  border: none;
  border-top: 1px solid #e4e4e4;
`
