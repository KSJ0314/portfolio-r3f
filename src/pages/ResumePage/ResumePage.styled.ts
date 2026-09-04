import styled from 'styled-components'
import {
  A4_HEIGHT_MM,
  A4_WIDTH_MM,
  BLOCK_GAP,
  ITEM_GAP,
  PHOTO_HEIGHT,
  SHEET_PADDING,
  SHEET_PADDING_MM,
  SHEET_WIDTH,
} from './ResumePage.constants'

/**
 * 종이를 세로로 쌓아 두는 바탕. 종이 밖은 한 톤 어둡게 둬 장의 경계가 눈에 들어온다.
 *
 * 스크롤은 이 안에서 한다 — 전역 스타일이 `body`의 넘침을 막고 있고, 그것은 화면에 고정되는
 * 3D 씬의 규칙이라 이력서 때문에 걷지 않는다.
 */
export const Page = styled.main`
  position: relative;
  height: 100%;
  overflow-y: auto;
  padding: 32px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  background: #eceae6;
  color: ${({ theme }) => theme.colors.text};
  font-family: ${({ theme }) => theme.fonts.body};

  @media print {
    height: auto;
    overflow: visible;
    padding: 0;
    gap: 0;
    background: #fff;
  }
`

/**
 * A4 한 장.
 *
 * 화면에서는 폭을 고정하고 세로를 A4 비율로 따라가게 둔다 — 창 크기와 무관하게 여백·글자 비율이 같다.
 * 인쇄할 때만 실치수(mm)로 바꾸고 장마다 페이지를 끊는다.
 */
export const Sheet = styled.section`
  /* 쌓아 놓은 장이 스크롤 안에서 눌리지 않도록 줄어들지 않게 둔다. */
  flex: 0 0 auto;
  width: ${SHEET_WIDTH}px;
  aspect-ratio: ${A4_WIDTH_MM} / ${A4_HEIGHT_MM};
  padding: ${SHEET_PADDING}px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: 0 2px 12px rgb(0 0 0 / 8%);

  @media print {
    width: ${A4_WIDTH_MM}mm;
    height: ${A4_HEIGHT_MM}mm;
    aspect-ratio: auto;
    padding: ${SHEET_PADDING_MM}mm;
    border: none;
    box-shadow: none;
    break-after: page;
  }

  &:last-of-type {
    break-after: auto;
  }
`

/**
 * 페이지를 나누기 전에 블록 높이를 재는 자리.
 *
 * 장과 같은 폭·여백이라 여기서 잰 높이가 실제로 놓일 높이와 같다.
 * 화면 흐름에서 빼 두고 감춰, 재는 동안 방문자에게 보이지 않는다.
 */
export const MeasureSheet = styled(Sheet).attrs({ as: 'div' })`
  position: absolute;
  top: 0;
  left: 0;
  height: auto;
  aspect-ratio: auto;
  visibility: hidden;
  pointer-events: none;
  border: none;
  box-shadow: none;

  @media print {
    display: none;
  }
`

/**
 * 페이지를 나누는 단위. 잘리지 않고 통째로 한 장에 들어간다.
 *
 * 위 여백을 `margin`이 아니라 `padding`으로 두는 것은 측정한 높이에 여백이 함께 잡히게 하기 위함이다.
 * 장의 첫 블록은 위 여백을 두지 않으므로, 실제 높이는 측정값보다 작거나 같다.
 */
export const Block = styled.div<{ $tight?: boolean }>`
  flex: 0 0 auto;
  padding-top: ${({ $tight }) => ($tight ? ITEM_GAP : BLOCK_GAP)}px;

  &:first-child {
    padding-top: 0;
  }
`

/** 사진과 글(한 줄 소개·자기소개·연락처)이 나란히 서는 머리. 아래 영역과는 여백으로 나눈다. */
export const Header = styled.header`
  display: flex;
  align-items: center;
  gap: 32px;
  padding-bottom: 32px;
`

/** 문서에서 가장 큰 글씨. 이 문장 안의 이름만 굵게 둔다. */
export const Tagline = styled.h1`
  font-size: 21px;
  font-weight: 400;
  line-height: 1.3;
  letter-spacing: -0.02em;

  strong {
    font-weight: 700;
  }
`

/** 자기소개. 왼쪽에 세로 막대를 세운 인용구이고, 막대는 영역 제목과 같은 색이다. */
export const Intro = styled.blockquote`
  padding-left: 12px;
  border-left: 3px solid ${({ theme }) => theme.colors.text};
  font-size: 13px;
  line-height: 1.7;
  color: #444;
  white-space: pre-line;
`

/** 연락처 줄이 쌓이는 자리. 자기소개 아래에 붙는다. */
export const ContactList = styled.ul`
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  gap: 5px;
  min-width: 0;
  list-style: none;
`

/** 연락처 한 줄 — 아이콘과 값. */
export const ContactItem = styled.li`
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 12.5px;
  color: #333;

  /* 아이콘은 글자 크기를 따라간다. */
  img {
    width: 13px;
    height: 13px;
    opacity: 0.55;
  }
`

/** 사진. 세로만 정하고 가로는 원본 비율을 따라간다. */
export const Photo = styled.img`
  flex: 0 0 auto;
  width: auto;
  height: ${PHOTO_HEIGHT}px;
  border: 1px solid ${({ theme }) => theme.colors.border};
`

/** 사진 오른쪽. 소개 덩어리는 위, 인적사항은 아래에 붙어 사진 높이를 채운다. */
export const HeaderText = styled.div`
  flex: 1 1 auto;
  align-self: stretch;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
  padding: 8px 0;
`

/** 한 줄 소개와 자기소개를 묶은 덩어리. */
export const HeaderIntro = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`

/**
 * 글이 들어갈 자리. 내용을 채우기 전까지 크기만 보이게 둔다.
 * `$w`는 글자 길이를 짐작한 폭이고 `$h`는 글자 크기다.
 */
export const TextSlot = styled.span<{ $w: number; $h: number }>`
  display: block;
  width: ${({ $w }) => $w}px;
  height: ${({ $h }) => $h}px;
  border: 1px dashed ${({ theme }) => theme.colors.border};
`

/** 제목과 그 아래 첫 항목을 함께 갖는 영역. 제목만 장 끝에 남지 않게 한 블록으로 묶는다. */
export const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

/** 영역 제목 자리. 머리와 같은 밑선으로 본문과 구분한다. */
export const SectionTitle = styled.h2`
  margin: 0;
  padding-bottom: 5px;
  border-bottom: 2px solid ${({ theme }) => theme.colors.text};
  font-size: 15px;
  line-height: 1.2;
`

/** 자기소개 본문. 문단 사이 빈 줄까지 그대로 살린다. */
export const CoverLetter = styled.div`
  font-size: 12.5px;
  line-height: 1.75;
  color: #333;
  white-space: pre-line;
`

/** 항목이 쌓이는 자리. */
export const SectionBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${ITEM_GAP}px;
`

/** 항목 하나의 자리. 내용을 채우기 전까지는 테두리로 자리만 보인다. */
export const Entry = styled.div`
  min-height: 40px;
  border: 1px dashed ${({ theme }) => theme.colors.border};
`

/** 기술 한 줄 — 왼쪽에 분류 이름, 오른쪽에 그 분류의 기술 목록. */
export const SkillRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  /* 목록 쪽이 남는 폭을 갖는다. */
  > *:last-child {
    flex: 1 1 auto;
  }
`
