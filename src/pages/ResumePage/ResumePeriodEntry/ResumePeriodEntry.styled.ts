import styled from 'styled-components'

/** 기간 칸의 폭(px). 고정이라 항목이 여럿이어도 오른쪽 내용의 왼쪽 끝이 가지런하다. */
const PERIOD_WIDTH = 84

/** 항목 하나 — 왼쪽 기간 칸과 오른쪽 내용 칸. */
export const Item = styled.article`
  display: flex;
  gap: 18px;
`

/** 기간 칸. 시작 아래에 종료를 두어 연도가 한 줄에서 밀리지 않게 한다. */
export const Period = styled.div`
  flex: 0 0 ${PERIOD_WIDTH}px;
  display: flex;
  flex-direction: column;
  gap: 1px;
  font-size: 12px;
  line-height: 1.4;
  color: #696969;
  white-space: nowrap;
`

/** 오른쪽 내용 칸. 안에 무엇이 쌓이는지는 쓰는 쪽이 정한다. */
export const Body = styled.div`
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
`
