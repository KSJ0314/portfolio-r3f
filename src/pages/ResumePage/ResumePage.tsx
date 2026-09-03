import { Page, Sheet } from './ResumePage.styled'

/**
 * 이력서 페이지(`/resume`) — 3D 없이 읽는 순수 문서 화면.
 *
 * 포트폴리오(`/portfolio`)와 주소를 나눠 제출하므로 서로의 코드를 끌어오지 않는다.
 * 내용은 아직 없고 라우팅과 코드 분할이 도는지 확인할 뼈대만 있다.
 */
export function ResumePage() {
  return (
    <Page>
      <Sheet>이력서</Sheet>
    </Page>
  )
}
