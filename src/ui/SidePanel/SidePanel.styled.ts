import styled from 'styled-components'
import {
  HANDLE_HEIGHT,
  HANDLE_WIDTH,
  PANEL_WIDTH_VW,
  PANEL_Z,
  SLIDE_SECONDS,
} from './SidePanel.constants'

/**
 * 패널과 손잡이를 함께 담아 통째로 미끄러지는 자리.
 *
 * 손잡이를 패널 **오른쪽에 이어 붙여** 같이 움직인다. 접히면 패널이 화면 왼쪽 밖으로 나가고
 * 손잡이만 가장자리에 남는다. 자리를 따로 잡으면 접힘·펼침마다 두 값을 맞춰야 한다.
 */
export const Slider = styled.div<{ $open: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  z-index: ${PANEL_Z};
  height: 100%;
  display: flex;
  align-items: center;
  transform: translateX(${({ $open }) => ($open ? '0' : `-${PANEL_WIDTH_VW}vw`)});
  transition: transform ${SLIDE_SECONDS}s ease;

  /* 마우스 없는 기기에서는 패널이 화면을 가득 채우므로 접는 거리도 그만큼이다. */
  @media (pointer: coarse) {
    transform: translateX(${({ $open }) => ($open ? '0' : '-100vw')});
  }
`

/**
 * 3D 위에 떠 있는 종이 한 장. 화면 높이를 다 쓴다.
 *
 * **안쪽 크기의 기준이 되는 컨테이너다.** 글자·여백을 px로 적으면 패널 폭은 화면을 따라 늘어나는데
 * 내용만 그대로라 넓은 화면에서 성기고 좁은 화면에서 넘친다. 안쪽은 `cqw`(이 폭의 %)로 적어
 * 패널이 몇 퍼센트든, 폰에서 화면을 가득 채우든 같은 인상이 나온다.
 */
export const Panel = styled.aside`
  container-type: inline-size;
  width: ${PANEL_WIDTH_VW}vw;
  height: 100%;
  display: flex;
  flex-direction: column;
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  font-family: ${({ theme }) => theme.fonts.body};
  box-shadow: 0 0 40px rgba(0, 0, 0, 0.28);

  /* 손가락으로 쓰는 기기에서는 30%가 글을 읽기에 너무 좁아 화면을 가득 채운다. */
  @media (pointer: coarse) {
    width: 100vw;
  }
`

/** 가장자리에 튀어나온 손잡이. 눌러서 펼치고 접는다. */
export const Handle = styled.button`
  width: ${HANDLE_WIDTH}px;
  height: ${HANDLE_HEIGHT}px;
  display: grid;
  place-items: center;
  padding: 0;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-left: none;
  border-radius: 0 8px 8px 0;
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  box-shadow: 4px 0 14px rgba(0, 0, 0, 0.18);
  opacity: 0.85;
  transition: opacity 0.15s ease;

  &:hover {
    opacity: 1;
  }
`

/**
 * 펼친 동안 바깥을 받는 면. 눌러서 닫는다.
 *
 * 패널보다 아래에 깔되 3D 위에는 얹혀, 패널이 열린 동안에는 씬을 조작하지 않는다.
 */
export const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: ${PANEL_Z - 1};
  background: rgba(20, 20, 28, 0.35);
`

/**
 * 패널 안에서 스크롤되는 자리.
 *
 * **프로필·구분선·화면 목록 셋을 같은 줄에 두고 사이를 고르게 나눈다**(`space-evenly`).
 * 구분선을 프로필에 붙이면 그 영역이 늘어날 때 선이 내용이 아니라 늘어난 끝을 따라간다.
 */
export const Body = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  padding: 0 3.5cqw;
  overflow-y: auto;
`

/** 프로필과 화면 목록을 가르는 선. 좌우를 들여 패널 폭보다 짧게 긋는다. */
export const Divider = styled.hr`
  align-self: center;
  width: calc(100% - 4.2cqw);
  height: 0;
  border: none;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`
