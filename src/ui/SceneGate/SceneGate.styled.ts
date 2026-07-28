import styled from 'styled-components'
import { FADE_SECONDS } from './SceneGate.constants'

/**
 * 첫 화면을 가리는 막. 로딩 연출은 폴리싱 단계에서 다시 만들 것이라 지금은 흰 화면만 덮는다.
 * 걷히는 동안에도 클릭이 씬으로 통과해야 하므로 포인터를 막지 않는다.
 */
export const Cover = styled.div<{ $hidden: boolean }>`
  position: fixed;
  inset: 0;
  z-index: 100;
  background: #ffffff;
  opacity: ${({ $hidden }) => ($hidden ? 0 : 1)};
  transition: opacity ${FADE_SECONDS}s ease;
  pointer-events: none;
`
