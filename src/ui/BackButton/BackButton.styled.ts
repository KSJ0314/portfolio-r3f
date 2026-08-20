import styled from 'styled-components'

/**
 * 좌상단 뒤로 가기 버튼.
 *
 * **자리를 여기서 잡는다** — 어느 화면에서나 같은 자리에 서야 하므로 쓰는 쪽마다 적지 않는다.
 *
 * 전환 덮개(`ui/SceneTransition`, z-index 200)보다 아래에 둬, 오가는 동안에는 가려지고 눌리지도 않는다.
 * 개발용 leva 패널은 이 버튼 아래로 내려 두었다(`DevPanel`).
 *
 * **색은 쓰는 쪽이 정한다.** 화면마다 배경이 달라 한 색으로는 읽히지 않는다.
 *
 * 지금은 배경·테두리 없이 글자만이다. 아이콘은 나중에 화살표 자리를 바꿔 넣는다.
 */
export const Button = styled.button<{ $color: string }>`
  position: fixed;
  top: 24px;
  left: 24px;
  z-index: 100;

  display: flex;
  align-items: center;
  gap: 8px;

  padding: 8px 12px;
  border: none;
  background: none;
  cursor: pointer;

  font-family: ${({ theme }) => theme.fonts.hand};
  font-size: 24px;
  color: ${({ $color }) => $color};
  opacity: 0.75;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 1;
  }
`

/** 화살표. 아이콘으로 바꿀 때 이 자리만 갈아 끼운다. */
export const Arrow = styled.span`
  font-size: 0.8em;
  line-height: 1;
`
