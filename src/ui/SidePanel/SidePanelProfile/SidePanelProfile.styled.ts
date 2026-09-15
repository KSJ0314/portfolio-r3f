import styled from 'styled-components'
import { PHOTO_SIZE_CQW } from './SidePanelProfile.constants'

/**
 * 사이드바 머리 — 한 장의 프로필 카드.
 *
 * 안쪽 여백이 사진을 오른쪽 테두리에서 띄운다. 구분선은 여기 붙이지 않는다 —
 * 패널이 머리·구분선·화면 목록 셋을 같은 줄에 놓고 사이를 나눈다.
 *
 * 크기는 패널 폭 대비(`cqw`)다. 테두리·그림자만 px로 두는데, 선 두께는 굵기가 아니라
 * 한 줄이라는 사실이 중요해 화면 크기를 따라갈 이유가 없다.
 *
 * **카드 자체가 Intro 화면으로 가는 버튼이다.** 안의 연락처 줄은 전파를 멈춰 제 동작만 한다.
 */
export const Head = styled.button`
  display: flex;
  flex-direction: column;
  width: 100%;
  text-align: left;
  cursor: pointer;
  gap: 2.8cqw;
  padding: 5.6cqw 3.5cqw;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 2.1cqw;
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
`

/** 한 줄 소개. 머리에서 가장 먼저 읽히도록 맨 위에 두고 크게 쓴다. */
export const Tagline = styled.p`
  font-family: ${({ theme }) => theme.fonts.hand};
  font-size: 4.2cqw;
  line-height: 1.35;
  text-align: center;
`

/** 연락처와 사진이 나란히 서는 줄. 사진은 오른쪽 끝에 붙는다. */
export const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2.8cqw;
`

/**
 * 둥글게 자른 프로필 사진. 비율이 달라도 가운데를 채워 자른다.
 * 오른쪽으로 더 들여 둔다 — 카드 여백을 키우면 왼쪽 연락처까지 함께 들어간다.
 */
export const Photo = styled.img`
  flex-shrink: 0;
  margin-right: 2.1cqw;
  width: ${PHOTO_SIZE_CQW}cqw;
  height: ${PHOTO_SIZE_CQW}cqw;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.background};
`

export const Contacts = styled.ul`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.7cqw;
  list-style: none;
`

/**
 * 연락처 한 줄. 전화·메일은 복사하고 깃허브는 새 탭으로 연다.
 *
 * **글씨 길이만큼만 누를 수 있다.** 줄 전체를 차지하면 옆의 빈 자리를 눌러도 복사돼,
 * 무엇을 누른 것인지 알 수 없다.
 */
export const Contact = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 1.4cqw;
  padding: 0.7cqw 1.4cqw;
  border: none;
  border-radius: 1.1cqw;
  background: none;
  color: ${({ theme }) => theme.colors.text};
  font-family: ${({ theme }) => theme.fonts.body};
  font-size: 2.1cqw;
  text-align: left;
  cursor: pointer;
  opacity: 0.85;
  transition: background 0.15s ease, opacity 0.15s ease;

  &:hover {
    opacity: 1;
    background: ${({ theme }) => theme.colors.background};
  }
`

/**
 * 아이콘 자리.
 *
 * 그림마다 원래 크기가 달라 칸을 고정하고 그 안에서 같은 크기로 맞춘다.
 * 그러지 않으면 깃허브 마크만 커 보이고 줄 머리도 어긋난다.
 */
export const ContactIcon = styled.span`
  display: grid;
  place-items: center;
  width: 2.8cqw;
  height: 2.8cqw;
  flex-shrink: 0;
  opacity: 0.6;

  & > svg {
    width: 100%;
    height: 100%;
  }
`

/** 연락처 글씨. 긴 주소가 줄을 밀지 않게 넘치면 줄인다. */
export const ContactLabel = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`
