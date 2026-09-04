import styled from 'styled-components'

/** 항목 하나. */
export const Item = styled.article`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

/** 제목과 그 오른쪽 기간이 함께 서는 줄. 글자 크기가 달라 밑선을 기준으로 맞춘다. */
export const Title = styled.div`
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 8px;
`

/** 항목에서 가장 굵은 글씨. */
export const Name = styled.h3`
  font-size: 18px;
  font-weight: 700;
  line-height: 1.3;
  margin-bottom: 8px;
`

/** 기간과 팀 규모. 본문보다 물러나 있다. */
export const Period = styled.span`
  font-size: 12px;
  line-height: 1.4;
  color: #696969;
`

/** 제목 위에 두는 노션 주소. 눌러서 새 탭으로 연다. */
export const Link = styled.a`
  font-size: 12px;
  line-height: 1.4;
  color: #696969;
  text-decoration: none;
`

/** 제목 아래 한 줄 소개. */
export const Tagline = styled.p`
  font-size: 12.5px;
  line-height: 1.45;
  color: #333;
`

/**
 * 요약. 왼쪽에 세로 막대를 세운 인용구다.
 * 문단 사이는 빈 줄이 아니라 간격으로 띄운다. 빈 줄을 그대로 두면 한 줄 높이를 그대로 차지한다.
 */
export const Summary = styled.blockquote`
  margin-top: 3px;
  padding-left: 10px;
  border-left: 2px solid #d0d0d0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 12.5px;
  line-height: 1.45;
  color: #444;
`

/** 요약의 한 문단. 안에서 접힌 줄은 줄 간격으로만 나뉜다. */
export const Paragraph = styled.p`
  white-space: pre-line;
`

/** 주요 업무와 성과가 나란히 서는 자리. 폭을 반씩 나눠 갖는다. */
export const Columns = styled.div`
  margin-top: 24px;
  display: flex;
  align-items: flex-start;
  gap: 18px;
`

/** 한 열 — 제목과 목록. */
export const Column = styled.div`
  flex: 1 1 0;
  min-width: 0;
`

/** 목록의 제목 줄. 왼쪽 세로 막대로 영역이 시작되는 자리를 보인다. */
export const ListTitle = styled.h4`
  padding-left: 9px;
  margin-bottom: 8px;
  border-left: 2px solid #222;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.3;
  color: #222;
`

/** 항목이 쌓이는 자리. 주요 업무와 성과가 함께 쓴다. */
export const List = styled.ul`
  margin-top: 3px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  list-style: none;
`

/** 목록 한 줄. 점은 글머리 기호가 아니라 그린 것이라 줄이 접혀도 들여쓰기가 유지된다. */
export const ListItem = styled.li`
  position: relative;
  padding-left: 11px;
  font-size: 12.5px;
  line-height: 1.45;
  color: #333;

  &::before {
    content: '•';
    position: absolute;
    left: 0;
    color: #999;
  }
`
