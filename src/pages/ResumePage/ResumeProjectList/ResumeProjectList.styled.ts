import styled from 'styled-components'

/** 프로젝트명과 그 오른쪽 팀 규모가 함께 서는 줄. 글자 크기가 달라 밑선을 기준으로 맞춘다. */
export const Title = styled.div`
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 8px;
`

/**
 * 항목에서 가장 굵은 글씨. 눌러서 그 프로젝트로 옮겨 간다.
 *
 * 글씨 길이만큼만 누를 수 있다. 줄 전체를 차지하면 옆의 빈 자리를 눌러도 걸려,
 * 무엇을 누른 것인지 알 수 없다.
 */
export const Name = styled.button`
  padding: 0;
  border: none;
  background: none;
  color: inherit;
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.3;
  text-align: left;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }

  /* 종이에서는 누를 수 없다. 목차로 읽히도록 글씨만 남긴다. */
  @media print {
    cursor: auto;
  }
`

/** 팀 규모. 본문보다 물러나 있다. */
export const Team = styled.span`
  font-size: 12px;
  line-height: 1.4;
  color: #696969;
`

/** 세부 내용이 쌓이는 자리. */
export const Details = styled.ul`
  margin-top: 3px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  list-style: none;
`

/** 세부 내용 한 덩이. 적어 둔 줄바꿈을 그대로 살린다. */
export const Detail = styled.li`
  font-size: 12.5px;
  line-height: 1.45;
  color: #333;
  white-space: pre-line;
`
