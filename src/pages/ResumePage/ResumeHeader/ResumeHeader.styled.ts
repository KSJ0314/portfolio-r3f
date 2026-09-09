import styled from 'styled-components'
import { PHOTO_HEIGHT } from './ResumeHeader.constants'

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
