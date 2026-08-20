import { Arrow, Button } from './BackButton.styled'
import type { BackButtonProps } from './BackButton.types'

/**
 * 좌상단 뒤로 가기 버튼.
 *
 * 자리와 화살표는 버튼이 갖고, **무엇을 할지와 글씨색은 쓰는 쪽이 정한다.** 화면마다 돌아갈 곳이
 * 다르고 배경도 달라 한 색으로는 읽히지 않기 때문이다. 어느 화면에서나 같은 자리·같은 모양이라 방문자가 나가는 곳을 다시 찾지 않아도 된다.
 */
export function BackButton({ label, color, onClick }: BackButtonProps) {
  return (
    <Button type="button" onClick={onClick} aria-label={label} $color={color}>
      <Arrow aria-hidden>{'<'}</Arrow>
      {label}
    </Button>
  )
}
