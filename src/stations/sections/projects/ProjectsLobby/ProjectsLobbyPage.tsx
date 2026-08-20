import { Suspense, useEffect, useLayoutEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { SceneArrival } from '../../../../scene/SceneArrival'
import { SceneErrorBoundary } from '../../../../scene/SceneErrorBoundary'
import { useLobbyStore } from '../../../../state/useLobbyStore'
import { useLobbyTriggerStore } from '../../../../state/useLobbyTriggerStore'
import { BackButton } from '../../../../ui/BackButton'
import { LobbyPageHUD } from '../../../../ui/DevHUD/LobbyPageHUD'
import { LobbyCameraRig } from './LobbyCameraRig'
import { LobbyCharacter } from './LobbyCharacter'
import { LobbyEnvironment } from './LobbyEnvironment'
import { LobbyInput } from './LobbyInput'
import { LobbyModel } from './LobbyModel'
import { LobbyTriggers } from './LobbyTriggers'
import {
  LOBBY_BACKGROUND,
  LOBBY_CAMERA_FAR,
  LOBBY_CAMERA_FOV,
  LOBBY_EXPOSURE,
  LOBBY_CAMERA_NEAR,
  LOBBY_CAMERA_OFFSET,
  LOBBY_FILL,
  LOBBY_START,
} from './ProjectsLobby.constants'
import { goBack } from './ProjectsLobby.travel'

/** 시작 자리에 팔로우 오프셋을 더한 것이 첫 카메라 자리다 — 그래야 첫 프레임부터 자세가 맞다. */
const CAMERA_POSITION: [number, number, number] = [
  LOBBY_START[0] + LOBBY_CAMERA_OFFSET[0],
  LOBBY_CAMERA_OFFSET[1],
  LOBBY_START[1] + LOBBY_CAMERA_OFFSET[2],
]

/**
 * 로비 페이지(`/projects`) — 건물 안이다.
 *
 * 맵과 **다른 라우트·다른 Canvas**다. 조작은 그대로 두되(우클릭 홀드 이동 + 팔로우 아이소메트릭)
 * 세계가 통째로 갈리므로 이동 상태·판정을 맵과 나눠 갖는다.
 * 오가는 동안 화면이 끊기지 않게 덮는 것은 `ui/SceneTransition`이 라우트 밖에서 맡는다.
 *
 * 나가는 방법은 좌상단 버튼과 ESC 두 가지다. 둘 다 같은 판단(`goBack`)을 탄다.
 */
export function ProjectsLobbyPage() {
  // 책을 보고 있으면 책을 닫는 버튼, 아니면 맵으로 나가는 버튼이다.
  const activeId = useLobbyTriggerStore((s) => s.activeId)

  // 들어올 때마다 입구에서 시작한다. 앞으로가기나 주소 직접 입력으로 들어오면 이동 상태가
  // 지난번 그대로다. 카메라 첫 자리도 시작 자리 기준이라 어긋나 있으면 화면이 튄다.
  useLayoutEffect(() => {
    useLobbyStore.getState().reset()
    useLobbyTriggerStore.getState().reset()
  }, [])

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
      {/* 맵과 달리 **원근** 카메라다(R3F 기본). 종이 위를 내려다보는 맵은 원근 왜곡이 없어야 하지만,
          실내는 깊이가 보여야 방으로 읽힌다. */}
      <Canvas
        // 벽등이 그림자를 드리운다. PCFSoft는 포인트라이트(큐브맵)에서 칸이 네모나게 뭉쳐 보여
        // 기본 PCF를 쓴다.
        shadows
        camera={{
          position: CAMERA_POSITION,
          fov: LOBBY_CAMERA_FOV,
          near: LOBBY_CAMERA_NEAR,
          far: LOBBY_CAMERA_FAR,
        }}
        // 흰 대리석이 밝기 1을 넘겨 잘리면 빛 웅덩이의 계조가 사라진다. 노출로 화면 안에 들인다.
        gl={{ toneMappingExposure: LOBBY_EXPOSURE }}
        style={{ position: 'fixed', inset: 0 }}
        onContextMenu={(e) => e.preventDefault()}
      >
        <color attach="background" args={[LOBBY_BACKGROUND]} />
        {/* 금속·광택이 보이게 하는 주역. 빛이 아니라 반사가 있어야 금속이 드러난다. */}
        <LobbyEnvironment />
        {/* 환경광이 못 채우는 몫을 메우는 전체 등. */}
        <hemisphereLight
          color={LOBBY_FILL.sky}
          groundColor={LOBBY_FILL.ground}
          intensity={LOBBY_FILL.intensity}
        />

        <SceneErrorBoundary>
          {/* 모델을 받는 동안 서스펜드한다. 그동안 화면은 덮개가 덮고 있다. */}
          <Suspense fallback={null}>
            <LobbyModel />
            {/* 모델과 같은 경계에 둔다 — 모델이 준비된 뒤에야 세기 시작해야 덮개가 빈 방을 보이지 않는다. */}
            <SceneArrival />
          </Suspense>
          <LobbyCharacter />
          <LobbyCameraRig />
          <LobbyInput />
          {/* 누를 판은 모델에서 잰 트리거 자리에 서므로 모델이 준비된 뒤에 붙는다. */}
          <LobbyTriggers />
        </SceneErrorBoundary>
      </Canvas>
      {/* 로비는 밝은 대리석이라 검정, 책을 볼 때는 화면이 어두워져 흰색이다. */}
      <BackButton
        label={activeId ? 'Back' : 'Go home'}
        color={activeId ? '#ffffff' : '#000000'}
        onClick={goBack}
      />

      {/* leva 튜닝 패널은 dev 전용이라 프로덕션 번들에서 빠진다. 맵과 라우트가 달라 따로 둔다. */}
      {import.meta.env.DEV && <LobbyPageHUD />}
    </>
  )
}
