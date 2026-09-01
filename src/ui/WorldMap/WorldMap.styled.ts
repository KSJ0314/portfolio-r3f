import styled from 'styled-components'
import { DEFAULT_PAPER_STICKER_PARAMS } from '../../lib/PaperSticker'

const PAPER = DEFAULT_PAPER_STICKER_PARAMS.paperColor

export const WorldMapBackdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
`

/**
 * 오려 붙인 종이 한 장. 모눈은 안쪽에만 깔고 테두리는 종이색으로 남겨(`background-clip`)
 * 가위로 여백을 두고 오린 것처럼 보이게 한다. 밑에는 씬 안 스티커와 같은 톤의 옅은 그림자.
 */
export const WorldMapSheet = styled.div`
  position: relative;
  width: min(84vw, 84vh);
  height: min(84vw, 84vh);
  padding: 20px;
  border: 14px solid ${PAPER};
  border-radius: 2px;
  background-color: ${PAPER};
  background-image: url('/textures/paper/grid-paper.png');
  background-size: 480px 480px;
  background-repeat: repeat;
  background-clip: padding-box;
  box-shadow: 0 6px 14px rgba(58, 58, 58, 0.22);

  /*
   * 좁은 화면에서는 시트가 절반 이하로 줄어드는데 테두리와 여백은 그대로라 맵이 그만큼 눌린다.
   * 시트를 키우고 둘을 함께 줄인다. 높이는 주소창이 접힌 높이를 따르도록 dvh로 잰다.
   */
  @media (pointer: coarse) {
    width: min(94vw, 94dvh);
    height: min(94vw, 94dvh);
    padding: 10px;
    border-width: 8px;
  }
`

export const WorldMapTitle = styled.h2`
  position: absolute;
  top: 14px;
  left: 22px;
  margin: 0;
  font-family: ${({ theme }) => theme.fonts.hand};
  font-size: 28px;
  font-weight: 400;
  color: ${({ theme }) => theme.colors.text};

  /* 줄어든 시트에 견주면 기본 크기가 지도를 덮는다. */
  @media (pointer: coarse) {
    top: 8px;
    left: 12px;
    font-size: 18px;
  }
`

export const WorldMapClose = styled.button`
  position: absolute;
  top: 12px;
  right: 14px;
  width: 34px;
  height: 34px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
  font-family: ${({ theme }) => theme.fonts.hand};
  font-size: 24px;
  line-height: 1;
  color: ${({ theme }) => theme.colors.text};
  transition: background 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.border};
  }

  @media (pointer: coarse) {
    top: 6px;
    right: 8px;
    width: 26px;
    height: 26px;
    font-size: 18px;
  }
`

export const WorldMapSvg = styled.svg`
  width: 100%;
  height: 100%;
  display: block;
`

/** 스테이션 마커 묶음. 판정은 투명한 원이 받고, 얹힌 그림은 커서를 가로채지 않는다. */
export const StationMarker = styled.g`
  cursor: pointer;

  &:hover circle {
    stroke: ${({ theme }) => theme.colors.accent};
  }
`
