import styled from 'styled-components'
import { GAUGE_COLOR, ICON_WAITING_COLOR } from './SidePanelShots.constants'

export const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 1.7cqw;
`

/** 제목과 내려받기가 나란히 서는 줄. 버튼은 제목 바로 오른쪽에 붙는다. */
export const Head = styled.div`
  display: flex;
  align-items: center;
  gap: 1.7cqw;
`

export const Title = styled.h2`
  font-family: ${({ theme }) => theme.fonts.hand};
  font-size: 3.5cqw;
  font-weight: 400;
`

/** 아직 구우는 중일 때 자리를 지키는 안내. 그림 자리가 비었다 차면 목록이 흔들린다. */
export const Waiting = styled.p`
  display: grid;
  place-items: center;
  aspect-ratio: 16 / 9;
  border: 1px dashed ${({ theme }) => theme.colors.border};
  border-radius: 0.7cqw;
  font-size: 2.4cqw;
  opacity: 0.6;
`

/**
 * 그림이 놓이는 자리이자 **그 화면으로 가는 버튼**.
 *
 * 그림 위에 덮인 링크·복사 판이 이것보다 위에 있어, 그 자리를 누르면 이동이 아니라 링크가 걸린다.
 */
export const Frame = styled.button`
  position: relative;
  aspect-ratio: 16 / 9;
  /* 자리가 모자라면 눌리지 않고 패널이 스크롤된다. 눌리면 그림 비율이 깨진다. */
  flex-shrink: 0;
  display: block;
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
`

export const Shot = styled.img`
  width: 100%;
  height: 100%;
  display: block;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 0.7cqw;
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

/** 누르면 값을 복사하는 자리. 여는 자리와 같이 그림 위에 투명하게 덮는다. */
export const CopyArea = styled.button`
  position: absolute;
  display: block;
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
`

/** 복사했다고 알리는 표시. 누른 자리 위에 잠시 떠 있다가 사라진다. */
export const CopiedBadge = styled.span`
  position: absolute;
  transform: translate(-50%, -100%);
  padding: 0.7cqw 1.7cqw;
  border-radius: 1.1cqw;
  background: ${({ theme }) => theme.colors.text};
  color: ${({ theme }) => theme.colors.surface};
  font-size: 2.2cqw;
  white-space: nowrap;
  pointer-events: none;
`

/** 그림 아래 줄 — 좌우 넘김과 쪽 번호. */
export const Bar = styled.div`
  display: flex;
  align-items: center;
  gap: 1.7cqw;
`

/** 좌우 넘김 버튼. 갈 곳이 없으면 자리는 두고 흐리게 둔다 — 그림이 좌우로 흔들리지 않게. */
export const NavButton = styled.button`
  width: 5.6cqw;
  height: 5.6cqw;
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

  & > svg {
    width: 2.8cqw;
    height: 2.8cqw;
  }
`

/** 쪽 번호. 가운데를 채워 좌우 버튼을 양끝으로 민다. */
export const Count = styled.p`
  flex: 1;
  text-align: center;
  font-size: 2.4cqw;
  opacity: 0.7;
`

/**
 * 내려받기 버튼. **테두리가 준비된 만큼 채워진다.**
 *
 * 테두리만 칠하려고 두 겹을 쌓는다 — 안쪽은 버튼 바탕색으로 덮고(`padding-box`)
 * 테두리 자리에만 진행률을 그린다(`border-box`). 요소를 더 얹지 않아 아이콘 자리가 그대로다.
 */
export const DownloadButton = styled.button<{ $ratio: number }>`
  width: 4.5cqw;
  height: 4.5cqw;
  display: grid;
  place-items: center;
  padding: 0;
  border: 2px solid transparent;
  border-radius: 50%;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text};
  background:
    linear-gradient(${({ theme }) => theme.colors.surface}, ${({ theme }) => theme.colors.surface})
      padding-box,
    conic-gradient(
        ${GAUGE_COLOR} ${({ $ratio }) => $ratio * 360}deg,
        ${({ theme }) => theme.colors.border} 0
      )
      border-box;

  &:disabled {
    cursor: default;
    color: ${ICON_WAITING_COLOR};
  }

  & > svg {
    width: 2.4cqw;
    height: 2.4cqw;
  }
`
