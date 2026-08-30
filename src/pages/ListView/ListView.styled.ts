import styled from 'styled-components'
import {
  CORNER_BUTTON_MARGIN,
  CORNER_BUTTON_SIZE,
} from '../../ui/CornerButton/CornerButton.constants'

/** 채워지는 게이지 색. 테마 토큰에 초록이 없어 여기 둔다. */
const GAUGE_COLOR = '#4caf7d'

/** 아직 누를 수 없을 때의 아이콘 색. 눌리는 색보다 물러나 있어야 기다리는 중임이 읽힌다. */
const ICON_WAITING_COLOR = '#c4c4c4'

/**
 * 내려받기 버튼. 구석 버튼과 같은 자리·같은 크기이고, **테두리가 준비된 만큼 채워진다.**
 *
 * 테두리만 칠하려고 두 겹을 쌓는다 — 안쪽은 버튼 바탕색으로 덮고(`padding-box`)
 * 테두리 자리에만 진행률을 그린다(`border-box`). 요소를 더 얹지 않아 아이콘 자리가 그대로다.
 */
export const DownloadButton = styled.button<{ $ratio: number }>`
  position: fixed;
  right: ${CORNER_BUTTON_MARGIN}px;
  bottom: ${CORNER_BUTTON_MARGIN}px;
  z-index: 20;
  width: ${CORNER_BUTTON_SIZE}px;
  height: ${CORNER_BUTTON_SIZE}px;
  display: grid;
  place-items: center;
  padding: 0;
  border: 2px solid transparent;
  border-radius: 50%;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text};
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.22);
  background:
    linear-gradient(${({ theme }) => theme.colors.surface}, ${({ theme }) => theme.colors.surface})
      padding-box,
    conic-gradient(${GAUGE_COLOR} ${({ $ratio }) => $ratio * 360}deg, ${({ theme }) => theme.colors.border} 0)
      border-box;
  transition: transform 0.15s ease, box-shadow 0.15s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.26);
  }

  &:disabled {
    cursor: default;
    color: ${ICON_WAITING_COLOR};
  }
`

/** 한 번에 한 장만 두고, 그림 바깥 빈 자리에 넘김 요소를 둔다. */
export const Viewer = styled.main`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 12px;
  background: ${({ theme }) => theme.colors.background};
`

/** 그림과 좌우 버튼이 나란히 서는 줄. */
export const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

/**
 * 그림이 놓이는 자리.
 * 좌우 버튼과 아래 인디케이터가 들어갈 만큼만 남기고 화면을 최대로 쓴다.
 * 세로 쪽은 그 줄들이 차지하는 높이를 빼고 16:9로 환산한 값이다.
 */
export const Frame = styled.div`
  position: relative;
  width: min(100vw - 140px, (100vh - 120px) * 16 / 9);
  aspect-ratio: 16 / 9;
`

export const Shot = styled.img`
  width: 100%;
  height: 100%;
  display: block;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  background: #ffffff;
`

/**
 * 그림 위에 얹는 링크.
 * 구운 그림에는 그림만 남으므로, 링크 자리에 투명한 판을 덮어 누를 수 있게 한다.
 */
export const LinkArea = styled.a`
  position: absolute;
  display: block;
`

/** 좌우 넘김 버튼. 갈 곳이 없으면 자리는 두고 흐리게 둔다 — 그림이 좌우로 흔들리지 않게. */
export const NavButton = styled.button`
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  padding: 0;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  transition: opacity 0.15s ease;

  &:disabled {
    opacity: 0.25;
    cursor: default;
  }
`

/** 그림 아래 줄 — 인디케이터와 쪽 번호. */
export const Bar = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`

export const Dots = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

/** 지금 보는 장만 채운다. */
export const Dot = styled.button<{ $active: boolean }>`
  width: 10px;
  height: 10px;
  padding: 0;
  border: 1px solid ${({ theme }) => theme.colors.text};
  border-radius: 50%;
  cursor: pointer;
  background: ${({ theme, $active }) => ($active ? theme.colors.text : 'transparent')};
  opacity: ${({ $active }) => ($active ? 1 : 0.4)};
`

export const Count = styled.p`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};
  opacity: 0.7;
`

/**
 * 굽는 동안 덮는 가림막. 준비되지 않은 화면이 먼저 보이지 않게 한다.
 * 좌상단 뒤로 가기 버튼(z-index 100)보다 아래에 둬, 굽는 중에도 나갈 수 있다.
 */
export const Cover = styled.div`
  position: fixed;
  inset: 0;
  z-index: 90;
  display: grid;
  place-items: center;
  gap: 12px;
  align-content: center;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  font-family: ${({ theme }) => theme.fonts.hand};
  font-size: 28px;
`

/** 몇 장까지 구웠는지. */
export const CoverProgress = styled.p`
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 15px;
  opacity: 0.6;
`
