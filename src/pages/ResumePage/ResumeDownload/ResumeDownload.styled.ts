import styled, { createGlobalStyle } from 'styled-components'
import { CornerButton } from '../../../ui/CornerButton'
import {
  CORNER_BUTTON_MARGIN,
  CORNER_BUTTON_MARGIN_COARSE,
} from '../../../ui/CornerButton/CornerButton.constants'

/**
 * 내려받기 버튼. 크기·좁은 화면 대응은 공용 구석 버튼이 갖고, 여기서는 두 가지만 더한다.
 *
 * 하나는 인쇄에서 빼는 것이고, 다른 하나는 **스크롤바 폭(`$inset`)만큼 안쪽으로 미는 것**이다.
 * 이력서는 종이를 쌓아 둔 자리가 스스로 스크롤해, 창 오른쪽 끝을 기준으로 두면
 * 그 스크롤바가 끼어 우측 여백만 하단보다 좁아 보인다.
 * 공용 쪽에 이 규칙을 두면 이 화면 때문에 다른 화면의 버튼까지 함께 바뀐다.
 */
export const DownloadButton = styled(CornerButton)<{ $inset: number }>`
  right: ${({ $inset }) => CORNER_BUTTON_MARGIN + $inset}px;

  @media (pointer: coarse) {
    right: ${({ $inset }) => CORNER_BUTTON_MARGIN_COARSE + $inset}px;
  }

  @media print {
    display: none;
  }
`

/**
 * 이력서를 인쇄할 수 있게 푸는 전역 스타일. **이 화면에서만 마운트**해 다른 화면의 인쇄에 영향을 주지 않는다.
 *
 * `@page`는 컴포넌트 스코프에 담기지 않아 전역이라야 한다.
 */
export const ResumePrintStyle = createGlobalStyle`
  /*
   * 장이 A4 실치수 그대로 한 페이지를 채우게 한다. 기본 인쇄 여백이 남아 있으면 장이 넘쳐 두 쪽으로 갈린다.
   * 여백이 0이면 브라우저가 머리글·바닥글(날짜·주소) 자리를 만들지 못해 그것도 함께 빠진다.
   */
  @page {
    size: A4;
    margin: 0;
  }

  @media print {
    /*
     * 화면에서는 3D 씬이 창에 고정돼야 해서 높이를 창에 묶고 넘침을 막는다.
     * 그대로 두면 인쇄에서 첫 장만 남고 나머지가 잘린다.
     */
    html,
    body,
    #root {
      height: auto;
      overflow: visible;
    }

    body {
      background: #fff;
    }

    /* 바탕색을 지정한 그대로 찍는다. 기본은 배경을 빼므로 코드 표기 자리가 흰 판이 된다. */
    * {
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
    }
  }
`
