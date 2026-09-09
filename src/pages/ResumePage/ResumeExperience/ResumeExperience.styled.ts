import styled from 'styled-components'

/** 회사명과 그 오른쪽 곁글씨가 함께 서는 줄. 글자 크기가 달라 밑선을 기준으로 맞춘다. */
export const Title = styled.div`
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 8px;
`

/** 항목에서 가장 굵은 글씨. */
export const Company = styled.h3`
  font-size: 14px;
  font-weight: 700;
  line-height: 1.3;
`

/** 부서명·고용형태·직무를 한 줄로 이은 곁글씨. 본문보다 물러나 있다. */
export const Meta = styled.span`
  font-size: 12px;
  line-height: 1.4;
  color: #696969;
`

/** 업무 내용이 쌓이는 자리. */
export const Tasks = styled.ul`
  margin-top: 3px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  list-style: none;
`

/** 업무 한 줄. 점은 글머리 기호가 아니라 그린 것이라 줄이 접혀도 들여쓰기가 유지된다. */
export const Task = styled.li`
  position: relative;
  padding-left: 11px;
  font-size: 12.5px;
  line-height: 1.7;
  color: #333;
  white-space: pre-line;

  &::before {
    content: '•';
    position: absolute;
    left: 0;
    color: #999;
  }
`
