import { CornerButton } from '../CornerButton'
import { PORTFOLIO_REPO_URL } from './GithubButton.constants'
import { GithubIcon } from './GithubButton.icons'

/**
 * 이 포트폴리오의 레포로 가는 구석 버튼.
 *
 * 크레파스 버튼 왼쪽에 서고, 스테이션이 열려 있는 동안에는 `MainPage`가 걷는다.
 */
export function GithubButton() {
  return (
    <CornerButton
      type="button"
      $slot={2}
      onClick={() => window.open(PORTFOLIO_REPO_URL, '_blank', 'noopener,noreferrer')}
      title="GitHub 저장소"
      aria-label="GitHub 저장소 열기"
    >
      <GithubIcon />
    </CornerButton>
  )
}
