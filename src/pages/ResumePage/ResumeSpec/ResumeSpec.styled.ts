import styled from 'styled-components'

/** 자격증명과 그 오른쪽 발급 기관이 함께 서는 줄. 글자 크기가 달라 밑선을 기준으로 맞춘다. */
export const Title = styled.div`
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 8px;
`

/** 항목에서 가장 굵은 글씨. */
export const Spec = styled.h3`
  font-size: 14px;
  font-weight: 700;
  line-height: 1.3;
`

/** 발급 기관. 본문보다 물러나 있다. */
export const Organization = styled.span`
  font-size: 12px;
  line-height: 1.4;
  color: #696969;
`
