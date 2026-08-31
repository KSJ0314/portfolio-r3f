import { useEffect } from 'react'
import { useLobbyTriggerStore } from '../../state/useLobbyTriggerStore'
import { BackButton } from '../../ui/BackButton'
import { LobbyPageHUD } from '../../ui/DevHUD/LobbyPageHUD'
import { useCoarsePointer } from '../../ui/MobileNotice'
import { LobbyScene } from '../../stations/sections/projects/ProjectsLobby/LobbyScene'
import { goBack } from '../../stations/sections/projects/ProjectsLobby/ProjectsLobby.travel'

/**
 * 로비 페이지(`/projects`) — 건물 안이다.
 *
 * 방을 세우는 일은 씬(`LobbyScene`)이 하고, 여기는 그 씬과 화면 밖 요소만 얹는다.
 * 나가는 방법은 좌상단 버튼과 ESC 두 가지이고, 둘 다 같은 판단(`goBack`)을 탄다.
 */
export function ProjectsLobbyPage() {
  // 책을 보고 있으면 책을 닫는 버튼, 아니면 맵으로 나가는 버튼이다.
  const activeId = useLobbyTriggerStore((s) => s.activeId)
  const mobile = useCoarsePointer()

  // ESC는 좌상단 버튼과 같은 길을 탄다 — 열린 트리거를 먼저 닫고, 없을 때만 로비를 나간다.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') goBack()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <>
      <LobbyScene />
      {/* 로비는 밝은 대리석이라 검정, 책을 볼 때는 화면이 어두워져 흰색이다. */}
      <BackButton
        label={activeId ? 'Back' : 'Go home'}
        color={activeId ? '#ffffff' : '#000000'}
        onClick={goBack}
      />

      {/* leva 튜닝 패널은 dev 전용이고 좁은 화면에서는 두지 않는다. 맵과 라우트가 달라 따로 둔다. */}
      {import.meta.env.DEV && !mobile && <LobbyPageHUD />}
    </>
  )
}
