import { Link } from 'react-router-dom'
import styled, { css } from 'styled-components'

/**
 * 잘못 들어왔거나 그리지 못했을 때의 화면. 씬이 없으므로 바닥이 쓰는 모눈종이를 CSS 배경으로 직접 깐다.
 * 칸 크기는 맵에서 보이는 것에 맞춘다 — 텍스처 한 장이 8유닛이고 직교 카메라 zoom이 유닛당 픽셀이라,
 * 한 장은 `8 × 85 = 680px`이다(`PAPER_TILE_SIZE` · `Experience`의 zoom).
 */
export const Page = styled.div`
  position: fixed;
  inset: 0;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  background: url('/textures/paper/grid-paper.png') repeat;
  background-size: 680px 680px;
  color: ${({ theme }) => theme.colors.text};
  text-align: center;
`

/** 안내 문구. 이 화면에 담는 것은 이 한 줄뿐이라 크게 둔다. */
export const Message = styled.p`
  margin: 0;
  font-family: ${({ theme }) => theme.fonts.hand};
  font-size: 44px;
`

/** 돌아가는 길. 링크(라우트 이동)와 버튼(새로고침) 둘 다 같은 모양이라 스타일을 나눠 쓴다. */
const actionStyle = css`
  margin-top: 40px;
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;

  font-family: ${({ theme }) => theme.fonts.hand};
  font-size: 22px;
  color: ${({ theme }) => theme.colors.text};
  opacity: 0.75;
  text-decoration: none;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 1;
  }
`

export const ActionLink = styled(Link)`
  ${actionStyle}
`

export const ActionButton = styled.button`
  ${actionStyle}
`
