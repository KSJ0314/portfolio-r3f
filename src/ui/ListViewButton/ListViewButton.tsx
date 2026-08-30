import { useNavigate } from 'react-router-dom'
import { LIST_ROUTE, ListIcon } from '../../pages/ListView'
import { CornerButton } from '../CornerButton'

/**
 * 목록 보기로 가는 구석 버튼.
 *
 * 크레파스·출처 버튼 왼쪽에 나란히 서고, 스테이션이 열려 있는 동안에는 App이 걷는다.
 */
export function ListViewButton() {
  const navigate = useNavigate()

  return (
    <CornerButton
      type="button"
      $slot={0}
      onClick={() => navigate(LIST_ROUTE)}
      title="목록 보기"
      aria-label="목록 보기 열기"
    >
      <ListIcon />
    </CornerButton>
  )
}
