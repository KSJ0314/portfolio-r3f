import styled from 'styled-components'

/** 수상명과 그 오른쪽 기관명이 함께 서는 줄. 글자 크기가 달라 밑선을 기준으로 맞춘다. */
export const Title = styled.div`
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 8px;
`

/** 항목에서 가장 굵은 글씨. */
export const Award = styled.h3`
  font-size: 14px;
  font-weight: 700;
  line-height: 1.3;
`

/** 수여 기관. 본문보다 물러나 있다. */
export const Organization = styled.span`
  font-size: 12px;
  line-height: 1.4;
  color: #696969;
`

/**
 * 수상 내용이 쌓이는 자리.
 * 줄 간격을 좁힌 만큼 항목 사이를 벌려, 한 줄짜리 항목이 늘어설 때의 간격은 그대로다.
 * 여러 줄로 접히는 항목은 안쪽이 촘촘해져 한 덩어리로 읽힌다.
 */
export const Details = styled.ul`
  margin-top: 3px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  list-style: none;
`

/** 수상 내용 한 줄. 글머리 기호 없이 글만 둔다. */
export const Detail = styled.li`
  font-size: 12.5px;
  line-height: 1.45;
  color: #333;
  white-space: pre-line;
`
