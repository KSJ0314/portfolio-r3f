import styled from 'styled-components'
import { FADE_SECONDS } from './SceneGate.constants'

/**
 * 첫 화면을 가리는 막. 로딩 연출은 폴리싱 단계에서 다시 만들 것이라 지금은 흰 화면만 덮는다.
 * 덮고 있는 동안에는 포인터를 막는다 — 보이지도 않는 씬에 이동·클릭이 들어가면 안 된다.
 * 걷히기 시작하면 통과시켜, 페이드 중에도 조작이 막히지 않게 한다.
 */
export const Cover = styled.div<{ $hidden: boolean }>`
  position: fixed;
  inset: 0;
  z-index: 100;
  background: #ffffff;
  opacity: ${({ $hidden }) => ($hidden ? 0 : 1)};
  transition: opacity ${FADE_SECONDS}s ease;
  pointer-events: ${({ $hidden }) => ($hidden ? 'none' : 'auto')};
`
