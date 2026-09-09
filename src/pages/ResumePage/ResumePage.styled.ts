import styled from 'styled-components'

/**
 * 종이를 세로로 쌓아 두는 바탕. 종이 밖은 한 톤 어둡게 둬 장의 경계가 눈에 들어온다.
 *
 * 스크롤은 이 안에서 한다 — 전역 스타일이 `body`의 넘침을 막고 있고, 그것은 화면에 고정되는
 * 3D 씬의 규칙이라 이력서 때문에 걷지 않는다.
 */
export const Page = styled.main`
  position: relative;
  height: 100%;
  overflow-y: auto;
  padding: 32px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  background: #eceae6;
  color: ${({ theme }) => theme.colors.text};
  font-family: ${({ theme }) => theme.fonts.body};
  /* 한글은 어절 단위로 끊고, 끊을 자리가 없는 긴 문자열(주소 등)은 잘리지 않고 다음 줄로 넘긴다. */
  word-break: keep-all;
  overflow-wrap: anywhere;

  @media print {
    height: auto;
    overflow: visible;
    padding: 0;
    gap: 0;
    background: #fff;
  }
`
