import { useState } from 'react'
import { MOBILE_NOTICE, ROTATE_NOTICE, SHOW_MOBILE_NOTICE } from './MobileNotice.constants'
import { useCoarsePointer, usePortrait } from './MobileNotice.hooks'
import { Action, Body, Overlay, Title } from './MobileNotice.styled'

/**
 * 마우스 없는 기기를 덮는 안내.
 *
 * 화면마다 두지 않고 `App`에 하나만 둔다.
 * 라우트가 갈려도 살아남아야 하고 어느 화면에서나 같은 안내다.
 *
 * 두 겹이다. 안내 화면은 방문자가 닫고, 가로 회전 안내는 방향이 바뀌면 스스로 걷힌다.
 * 안내 화면은 `SHOW_MOBILE_NOTICE`로 제어한다.
 * 덮여 있는 동안에도 밑의 화면은 그대로 동작한다.
 */
export function MobileNotice() {
  const [read, setRead] = useState(false)
  const coarse = useCoarsePointer()
  const portrait = usePortrait()

  if (!coarse) return null

  if (SHOW_MOBILE_NOTICE && !read) {
    return (
      <Overlay>
        <Title>{MOBILE_NOTICE.title}</Title>
        <Body>{MOBILE_NOTICE.body}</Body>
        <Action type="button" onClick={() => setRead(true)}>
          {MOBILE_NOTICE.action}
        </Action>
      </Overlay>
    )
  }

  if (portrait) {
    return (
      <Overlay>
        <Title>{ROTATE_NOTICE.title}</Title>
        <Body>{ROTATE_NOTICE.body}</Body>
      </Overlay>
    )
  }

  return null
}
