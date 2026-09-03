import { Suspense, useLayoutEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { configureDracoDecoder } from '../../../../../lib/draco'
import { SceneArrival } from '../../../../../scene/SceneArrival'
import { SceneErrorBoundary } from '../../../../../scene/SceneErrorBoundary'
import { useInteriorStore } from '../../../../../state/useInteriorStore'
import { useLobbyTriggerStore } from '../../../../../state/useLobbyTriggerStore'
import { InteriorCharacter, InteriorEnvironment, InteriorInput } from '../../interior'
import { LobbyCameraRig } from '../LobbyCameraRig'
import { LobbyModel } from '../LobbyModel'
import { LobbyPassage } from '../LobbyPassage'
import { LobbyTriggers } from '../LobbyTriggers'
import {
  LOBBY_BACKGROUND,
  LOBBY_CAMERA_FAR,
  LOBBY_CAMERA_FOV,
  LOBBY_ENV,
  LOBBY_EXPOSURE,
  LOBBY_CAMERA_NEAR,
  LOBBY_CAMERA_OFFSET,
  LOBBY_FILL,
  LOBBY_SOUTH_LIMIT,
  LOBBY_STAIR_NAMES,
  LOBBY_START,
} from '../ProjectsLobby.constants'
import { isLobbyMovementBlocked, takeLobbyEntry } from '../ProjectsLobby.travel'

// 로비 모델이 Draco로 압축돼 있어, 받기 전에 디코더 자리를 잡아 둔다.
configureDracoDecoder()

/** 시작 자리에 팔로우 오프셋을 더한 것이 첫 카메라 자리다 — 그래야 첫 프레임부터 자세가 맞다. */
const CAMERA_POSITION: [number, number, number] = [
  LOBBY_START[0] + LOBBY_CAMERA_OFFSET[0],
  LOBBY_CAMERA_OFFSET[1],
  LOBBY_START[1] + LOBBY_CAMERA_OFFSET[2],
]

/**
 * 로비의 3D 장면 — 방을 세우고 돌아다니는 데 필요한 전부.
 *
 * 맵과 **다른 Canvas**다. 조작은 그대로 두되(우클릭 홀드 이동 + 팔로우) 세계가 통째로 갈리므로
 * 이동 상태·판정을 맵과 나눠 갖는다. 오가는 동안 화면이 끊기지 않게 덮는 것은
 * `ui/SceneTransition`이 라우트 밖에서 맡는다.
 */
export function LobbyScene() {
  // 들어올 때마다 정해진 자리에서 시작한다. 앞으로가기나 주소 직접 입력으로 들어오면 이동 상태가
  // 지난번 그대로다. 전시 공간에서 돌아왔으면 입구가 아니라 통로 앞이다.
  useLayoutEffect(() => {
    useInteriorStore.getState().reset(takeLobbyEntry())
    useLobbyTriggerStore.getState().reset()
  }, [])

  return (
    // 맵과 달리 **원근** 카메라다(R3F 기본). 종이 위를 내려다보는 맵은 원근 왜곡이 없어야 하지만,
    // 실내는 깊이가 보여야 방으로 읽힌다.
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
      <InteriorEnvironment blur={LOBBY_ENV.blur} intensity={LOBBY_ENV.intensity} />
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
        {/* 남쪽 면은 벽이 없어 바닥도 거기서 끝난다. 시작 자리보다 앞으로는 나오지 않는다. */}
        <InteriorCharacter southLimit={LOBBY_SOUTH_LIMIT} />
        <LobbyCameraRig />
        <InteriorInput blocked={isLobbyMovementBlocked} snapStairs={LOBBY_STAIR_NAMES} />
        {/* 누를 판은 모델에서 잰 트리거 자리에 서므로 모델이 준비된 뒤에 붙는다. */}
        <LobbyTriggers />
        {/* 통로 앞에 다 걸어가면 전시 공간으로 넘긴다. 리그가 자세를 마무리한 뒤에 돌아야
            덮개의 초점이 이번 프레임 화면과 맞으므로 리그보다 아래에 둔다. */}
        <LobbyPassage />
      </SceneErrorBoundary>
    </Canvas>
  )
}
