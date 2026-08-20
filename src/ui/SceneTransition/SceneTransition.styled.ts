import styled from 'styled-components'
import { IRIS_COLOR } from './SceneTransition.constants'

/**
 * 덮개가 자리 잡는 판. 넘치는 그림자를 화면 안으로 자른다 — 그래서 칠하는 비용이 화면 한 장을 넘지 않는다.
 * 덮여 있는 동안에는 포인터를 막는다 — 보이지 않는 씬에 이동·클릭이 들어가면 안 된다.
 */
export const Curtain = styled.div<{ $active: boolean }>`
  position: fixed;
  inset: 0;
  z-index: 200;
  overflow: hidden;
  visibility: ${({ $active }) => ($active ? 'visible' : 'hidden')};
  pointer-events: ${({ $active }) => ($active ? 'auto' : 'none')};
`

/**
 * 뚫린 구멍. 칠하는 것은 원이 아니라 **그 바깥으로 퍼지는 그림자**라, 원이 작아질수록 화면이 덮인다.
 *
 * 움직이는 것은 지름(`width`·`height`)뿐이다. **배율로 키우면 안 된다** — `transform`은 그림자까지
 * 함께 확대해서, 열린 상태의 레이어가 화면 대각선 배만큼 커져 브라우저가 멎는다.
 * 게다가 배율이 0에 가까워지면 바깥을 칠하던 그림자도 같이 줄어 화면이 덮이는 대신 드러난다.
 *
 * 자리(`left`·`top`)는 조여들 중심이고 덮개가 매 프레임 채운다. 여기 적은 값은 알려주는 곳이 없을 때
 * 쓰는 화면 한가운데다. `translate`는 그 점에 구멍 가운데를 맞추는 고정 변환이라 애니메이션과 부딪히지 않는다.
 *
 * 퍼짐은 대각선(최대 약 113vmax)보다 넉넉해야 한다 — 중심이 구석으로 치우치면 반대쪽 모서리까지
 * 닿아야 하기 때문이다. 지름이 0이 되면 테두리 반지름도 0이지만 그림자 모서리는 퍼짐만큼 둥글게 남는다.
 */
export const Hole = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  box-shadow: 0 0 0 100vmax ${IRIS_COLOR};
`
