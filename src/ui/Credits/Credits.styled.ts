import styled from 'styled-components'

export const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 30;
  display: grid;
  place-items: center;
  padding: 24px;
  background: rgba(20, 20, 28, 0.45);

  /*
   * 좁은 화면에서는 여백에 내줄 자리가 없다.
   * 높이는 dvh로 잡는다. inset은 주소창이 접힌 높이를 따르지 않아 패널이 화면보다 크게 잡힌다.
   */
  @media (pointer: coarse) {
    height: 100dvh;
    padding: 12px;
    /* 가운데 정렬은 칸을 자식 높이만큼 늘려 패널의 height가 화면을 넘는다. 칸을 그대로 채우게 한다. */
    place-items: stretch;
  }
`

export const Panel = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: min(680px, 100%);
  height: min(520px, 100%);
  padding: 20px;
  border-radius: 14px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
  font-family: ${({ theme }) => theme.fonts.body};

  /* 좁은 화면에서는 상한을 두지 않고 남은 자리를 그대로 쓴다. */
  @media (pointer: coarse) {
    width: auto;
    height: auto;
    /* 내용이 넘쳐도 패널이 늘어나지 않아야 Body가 줄어든다. */
    min-height: 0;
    gap: 10px;
    padding: 12px;
  }
`

export const Title = styled.h2`
  margin: 0;
  /* 우측 상단 닫기 버튼 자리를 비워 둔다. */
  padding-right: 32px;
  font-family: ${({ theme }) => theme.fonts.hand};
  font-size: 28px;
  font-weight: 400;

  /* 제목이 차지하는 높이만큼 목록과 미리보기가 줄어든다. */
  @media (pointer: coarse) {
    font-size: 20px;
  }
`

export const CloseButton = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  padding: 0;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  background: none;
  color: inherit;
  opacity: 0.55;
  transition: opacity 0.15s ease, background 0.15s ease;

  &:hover {
    opacity: 1;
    background: ${({ theme }) => theme.colors.background};
  }
`

/** 왼쪽 목록과 오른쪽 미리보기. 남는 높이를 둘이 나눠 갖는다. */
export const Body = styled.div`
  display: flex;
  gap: 16px;
  flex: 1;
  min-height: 0;
`

export const List = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 0 0 180px;
  margin: 0;
  padding: 0;
  overflow-y: auto;
  list-style: none;

  /* 목록 폭을 줄여 오른쪽 미리보기가 눌리지 않게 한다. */
  @media (pointer: coarse) {
    flex: 0 0 140px;
  }
`

/** 고른 항목만 테두리를 둬 표시한다. 목록이 짧아 다른 강조는 두지 않는다. */
export const ListItem = styled.button<{ $active: boolean }>`
  width: 100%;
  padding: 9px 12px;
  border-radius: 8px;
  cursor: pointer;
  text-align: left;
  font: inherit;
  font-size: 13px;
  color: inherit;
  border: 1px solid
    ${({ theme, $active }) => ($active ? theme.colors.accent : 'transparent')};
  background: ${({ theme, $active }) =>
    $active ? theme.colors.background : 'transparent'};
  transition: background 0.15s ease, border-color 0.15s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.background};
  }
`

export const Detail = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
  min-width: 0;
`

/**
 * 모델을 띄우는 자리. 캔버스가 부모를 꽉 채우므로 높이를 여기서 잡는다.
 * 커서는 상속되므로 여기 걸면 캔버스까지 따라온다 — 끌어서 돌릴 수 있다는 것을 손 모양으로 알린다.
 */
export const Preview = styled.div`
  position: relative;
  flex: 1;
  min-height: 0;
  border-radius: 10px;
  overflow: hidden;
  cursor: grab;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.background};

  &:active {
    cursor: grabbing;
  }
`

/** 모델을 불러오지 못했을 때 미리보기 자리를 채운다. 출처 글은 그대로 읽혀야 한다. */
export const PreviewFallback = styled.p`
  display: grid;
  place-items: center;
  height: 100%;
  margin: 0;
  padding: 0 16px;
  font-size: 12px;
  text-align: center;
  opacity: 0.5;
`

export const Info = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
  font-size: 13px;
  line-height: 1.6;
`

export const InfoTitle = styled.strong`
  font-size: 15px;
  font-weight: 600;
`

/** 제작자·라이선스처럼 곁들이는 줄. 제목보다 물러나 있다. */
export const InfoLine = styled.span`
  opacity: 0.7;
`

export const InfoLink = styled.a`
  color: inherit;
  text-decoration: underline;
  text-underline-offset: 2px;

  &:hover {
    opacity: 1;
  }
`
