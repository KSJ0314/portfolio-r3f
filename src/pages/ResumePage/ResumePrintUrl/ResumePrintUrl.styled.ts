import styled from 'styled-components'
import { PRINT_URL_GAP } from './ResumePrintUrl.constants'

/**
 * 인쇄에서만 머리 위 여백에 놓이는 주소.
 *
 * 머리를 기준으로 위로 올려 흐름에서 빠지므로 아래 내용이 밀리지 않는다.
 * 머리는 첫 블록이라 첫 장에만 있고, `fixed`와 달리 장마다 반복되지 않는다.
 */
export const PrintUrl = styled.a`
  display: none;

  @media print {
    display: block;
    position: absolute;
    left: 0;
    bottom: calc(100% + ${PRINT_URL_GAP}px);
    font-size: 12px;
    color: #696969;
    text-decoration: none;
    white-space: nowrap;
  }
`
