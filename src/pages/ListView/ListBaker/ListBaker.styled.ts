import styled from 'styled-components'
import { BAKE_HEIGHT, BAKE_WIDTH } from '../ListView.constants'

/**
 * 굽는 캔버스를 두는 자리.
 *
 * 화면 밖으로 밀어 두되 크기는 굽는 크기 그대로 둔다 — 캔버스 크기가 곧 그림 해상도라
 * 숨기려고 접으면 아무것도 그려지지 않는다.
 */
export const Stage = styled.div`
  position: fixed;
  top: 0;
  left: -${BAKE_WIDTH + 100}px;
  width: ${BAKE_WIDTH}px;
  height: ${BAKE_HEIGHT}px;
  pointer-events: none;
`
