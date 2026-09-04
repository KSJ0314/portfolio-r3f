import styled from 'styled-components'
import { ITEM_GAP } from '../ResumePage.constants'

/** 제목과 그 아래 항목들을 갖는 영역. */
export const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

/** 영역 제목 자리. 머리와 같은 밑선으로 본문과 구분한다. */
export const SectionTitle = styled.h2`
  margin: 0;
  padding-bottom: 5px;
  border-bottom: 2px solid ${({ theme }) => theme.colors.text};
  font-size: 15px;
  line-height: 1.2;
`

/** 항목이 쌓이는 자리. 제목선 안쪽으로 들인다. */
export const SectionBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${ITEM_GAP}px;
  padding: 2px 6px;
`
