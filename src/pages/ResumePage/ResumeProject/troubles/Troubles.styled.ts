import styled from 'styled-components'

/** 트러블슈팅 조각 하나. 안쪽 간격을 갖는다. */
export const Trouble = styled.div`
  display: flex;
  flex-direction: column;
  gap: 7px;
`

/** 트러블슈팅 제목. 노션의 H2 자리다. */
export const Title = styled.h4`
  font-size: 15px;
  font-weight: 700;
  line-height: 1.3;
  color: #222;
`

/** 문제 인식·해결 방안 같은 갈래 이름. 노션의 H3 자리다. */
export const Label = styled.h5`
  font-size: 13.5px;
  font-weight: 700;
  line-height: 1.35;
  color: #333;
`

/** 인용구. 제목 아래 회고와 본문 중간의 인용 줄이 함께 쓴다. */
export const Quote = styled.blockquote`
  padding-left: 10px;
  border-left: 2px solid #d0d0d0;
  font-size: 12px;
  line-height: 1.55;
  color: #444;
`

/** 굵은 한 줄. 정확도·속도·장점처럼 갈래 안에서 다시 묶는 자리다. */
export const Heading = styled.p`
  font-size: 12.5px;
  font-weight: 700;
  line-height: 1.45;
  color: #333;
`

/** 점 목록. */
export const Bullets = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 3px;
  list-style: none;
`

/** 번호 목록. 번호는 그린 것이 아니라 브라우저가 매긴다. */
export const Numbers = styled.ol`
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding-left: 17px;
  list-style: decimal;
`

/** 점 목록 한 줄. 점은 글머리 기호가 아니라 그린 것이라 줄이 접혀도 들여쓰기가 유지된다. */
export const Bullet = styled.li`
  position: relative;
  padding-left: 11px;
  font-size: 12.5px;
  line-height: 1.5;
  color: #333;

  &::before {
    content: '•';
    position: absolute;
    left: 0;
    color: #999;
  }
`

/** 번호 목록 한 줄. */
export const Numbered = styled.li`
  font-size: 12.5px;
  line-height: 1.5;
  color: #333;

  &::marker {
    color: #999;
  }
`

/** 한 항목 안에서 이어지는 줄(`⇒` 흐름). 앞 줄에 이어 붙는다. */
export const Sub = styled.span`
  display: block;
`

/** 굵은 글씨. */
export const B = styled.strong`
  font-weight: 700;
`

/** 이탤릭. 인용한 생각·말이 여기 담긴다. */
export const I = styled.em`
  font-style: italic;
`

/** 코드 표기. */
export const C = styled.code`
  padding: 0 3px;
  border-radius: 2px;
  background: #f0eeea;
  font-family: inherit;
  font-size: 0.95em;
`
