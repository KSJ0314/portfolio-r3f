import styled from 'styled-components'
import {
  CORNER_BUTTON_MARGIN,
  CORNER_BUTTON_SIZE,
} from '../../ui/CornerButton/CornerButton.constants'

/** 채워지는 게이지 색. 테마 토큰에 초록이 없어 여기 둔다. */
const GAUGE_COLOR = '#4caf7d'

/** 아직 누를 수 없을 때의 아이콘 색. 눌리는 색보다 물러나 있어야 기다리는 중임이 읽힌다. */
const ICON_WAITING_COLOR = '#c4c4c4'

/** 좁은 화면의 좌우 넘김 버튼 크기. 이미지가 쓸 수 있는 가로를 여기서 뺀다. */
const MOBILE_NAV_SIZE = 36

/** 좁은 화면에서 인디케이터 줄의 높이와 이미지와의 간격. 이미지 세로를 여기서 뺀다. */
const MOBILE_BAR_HEIGHT = 26
const MOBILE_BAR_GAP = 8

/** 좁은 화면에서 뒤로 가기 버튼이 차지하는 폭. 글씨 폭이라 재지 못하고 눈으로 맞춘 값이다. */
const MOBILE_BACK_WIDTH = 80

/** 좁은 화면의 뒤로 가기 글씨 크기. 기본값(24px)은 폰에서 이미지 자리를 많이 가져간다. */
const MOBILE_BACK_FONT = 16

/** 좁은 화면에서 뒤로 가기 버튼을 화면 모서리에 붙이는 거리. 기본값(24px)은 여기서만 줄인다. */
const MOBILE_BACK_INSET = 12

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

  /*
   * 마우스 없는 기기는 화면이 좁아 여백을 줄인다.
   * 높이를 화면에 맞춰 잠그고 남는 자리는 이미지 줄이 갖는다.
   * dvh라 주소창이 접혔다 펴져도 높이가 튀지 않는다.
   */
  @media (pointer: coarse) {
    height: 100dvh;
    min-height: 0;
    gap: 8px;
    padding: 4px;
  }
`

/**
 * 뒤로 가기 버튼을 감싸는 자리.
 *
 * 버튼은 자기 자리를 스스로 잡는 공용 컴포넌트다(`ui/BackButton`).
 * 이 페이지에서만 줄이려고 감싼 쪽에서 덮는다.
 * 공용 값을 고치면 로비·전시 공간까지 함께 움직인다.
 */
export const BackSlot = styled.div`
  @media (pointer: coarse) {
    & > button {
      top: ${MOBILE_BACK_INSET}px;
      left: ${MOBILE_BACK_INSET}px;
      font-size: ${MOBILE_BACK_FONT}px;
    }
  }
`

/**
 * 이미지 줄과 인디케이터를 함께 담는 자리.
 *
 * 좁은 화면에서 남는 높이를 전부 갖고, 그 크기가 곧 이미지가 쓸 수 있는 자리다.
 * 둘을 함께 담아야 인디케이터가 화면 바닥이 아니라 이미지 바로 밑에 붙는다.
 * 넓은 화면에서는 자리를 차지하지 않고 자식이 위 줄에 그대로 참여한다(`display: contents`).
 */
export const Stage = styled.div`
  display: contents;

  @media (pointer: coarse) {
    display: flex;
    flex: 1;
    min-height: 0;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: ${MOBILE_BAR_GAP}px;
    width: 100%;
    container-type: size;
  }
`

/** 그림과 좌우 버튼이 나란히 서는 줄. */
export const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  @media (pointer: coarse) {
    width: 100%;
    /*
     * 틈을 모두 같은 폭으로 둬 넘김 버튼이 이미지 양옆 여백의 가운데에 선다.
     * 가운데 정렬이면 이미지에 붙고 양끝 정렬이면 화면 끝에 붙는다.
     * space-around는 항목 양옆에 반 칸씩 붙이는 방식이라 버튼이 바깥으로 밀린다.
     * 간격을 두면 그만큼 또 밀리므로 여기서는 두지 않는다.
     */
    justify-content: space-evenly;
    gap: 0;
  }
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

  /*
   * 좁은 화면에서는 화면이 아니라 남은 자리(Stage)를 기준으로 잰다.
   * 화면 크기에서 상수를 빼면 화면비가 16:9에서 멀어질수록 한쪽이 남는다.
   * 세로에서 인디케이터 몫을 먼저 빼야 이미지가 그 줄을 밀어내지 않는다.
   */
  @media (pointer: coarse) {
    width: min(
      100cqw - ${(MOBILE_NAV_SIZE + MOBILE_BACK_WIDTH) * 2}px,
      (100cqh - ${MOBILE_BAR_HEIGHT + MOBILE_BAR_GAP}px) * 16 / 9
    );
  }
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

  @media (pointer: coarse) {
    width: ${MOBILE_NAV_SIZE}px;
    height: ${MOBILE_NAV_SIZE}px;
  }
`

/** 그림 아래 줄 — 인디케이터와 쪽 번호. */
export const Bar = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;

  /* 자기 높이를 먼저 챙긴다. 그러지 않으면 넓은 화면에서 이미지에 밀려 화면 밖으로 나간다. */
  @media (pointer: coarse) {
    flex-shrink: 0;
  }
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
