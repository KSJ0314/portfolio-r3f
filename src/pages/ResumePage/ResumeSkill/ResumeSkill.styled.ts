import styled from 'styled-components'

/** 한 줄 — 왼쪽 분류 이름과 오른쪽 기술 이름들. */
export const Item = styled.div`
  display: flex;
  gap: 18px;
`

/** 분류 이름. 폭이 기간 칸과 같아 위아래 영역과 세로줄이 맞는다. */
export const Label = styled.span`
  flex: 0 0 84px;
  font-size: 12.5px;
  line-height: 1.45;
  font-weight: 700;
`

/** 그 분류의 기술 이름들. 한 줄에 잇고 폭을 넘기면 접힌다. */
export const Names = styled.span`
  flex: 1 1 auto;
  min-width: 0;
  font-size: 12.5px;
  line-height: 1.45;
  color: #333;
`
