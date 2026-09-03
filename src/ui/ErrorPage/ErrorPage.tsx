import { MAIN_ROUTE } from '../../routes'
import { ActionButton, ActionLink, Message, Page } from './ErrorPage.styled'
import type { ErrorPageProps } from './ErrorPage.types'

/**
 * 화면을 내주지 못할 때 대신 그리는 안내.
 *
 * 없는 경로(`vercel.json`의 SPA rewrite로 오타 주소도 앱까지 온다)와
 * 렌더 중 에러(`AppErrorBoundary`)가 같은 화면을 쓴다 — 방문자에게는 둘 다 "여기서 막혔다"이므로
 * 화면을 나누면 만드는 쪽만 늘어난다. 문구와 돌아가는 길만 다르다.
 */
export function ErrorPage({ message, action }: ErrorPageProps) {
  return (
    <Page>
      <Message>{message}</Message>
      {action === 'home' ? (
        <ActionLink to={MAIN_ROUTE}>첫 화면으로 →</ActionLink>
      ) : (
        <ActionButton onClick={() => window.location.reload()}>새로고침 →</ActionButton>
      )}
    </Page>
  )
}
