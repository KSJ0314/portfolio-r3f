import { createGlobalStyle } from 'styled-components'

export const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html,
  body,
  #root {
    width: 100%;
    height: 100%;
  }

  body {
    font-family: ${({ theme }) => theme.fonts.body};
    background: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text};
    overflow: hidden;
    transition: background 0.6s ease, color 0.6s ease;
  }

  /*
   * 손가락으로 끌어 캐릭터를 움직이는 동안 브라우저가 그것을 스크롤·확대로 가져가지 않게 한다.
   * 씬 캔버스에만 걸어 다른 화면의 스크롤은 그대로 둔다.
   */
  canvas {
    touch-action: none;
  }
`
