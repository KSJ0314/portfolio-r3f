import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Vector3 } from 'three'
import { useInteriorStore } from '../../../../../state/useInteriorStore'
import { useLobbyGeometryStore } from '../../../../../state/useLobbyGeometryStore'
import { useSceneTransitionStore } from '../../../../../state/useSceneTransitionStore'
import { preloadGalleryModel } from '../../ProjectsGallery/GalleryModel'
import { enterGallery } from '../../ProjectsGallery/ProjectsGallery.travel'
import {
  LOBBY_CAMERA_LIMIT,
  LOBBY_PASSAGE_COVER_INSET,
  LOBBY_PASSAGE_IRIS_SECONDS,
  LOBBY_PASSAGE_TRIGGER,
} from '../ProjectsLobby.constants'
import { LOBBY_PASSAGE_PRELOAD_RANGE } from './LobbyPassage.constants'

const _screen = new Vector3()

/**
 * 통로를 통해 전시 공간으로 넘어가는 일.
 *
 * 누르는 것은 `LobbyTriggers`가 받아 캐릭터를 통로 안으로 걸려 보내고, 여기서 전환을 시작한다.
 * 시작하는 때는 캐릭터가 **카메라가 따라 들어가기 시작하는 깊이**를 지나는 순간이다 —
 * 화면이 통로로 당겨지는 것과 원이 조여드는 것이 한 동작으로 이어진다.
 * 거기까지 가지 못하고 걸음이 멎으면 그때 시작한다.
 *
 * 덮개가 조여드는 초점도 여기서 채운다 — 건물 문으로 들어갈 때와 같이 **통로 쪽으로** 모인다.
 * 덮개는 Canvas 밖에 있어 카메라를 모르므로 통로가 화면 어디에 있는지 매 프레임 알려 준다.
 *
 * **그리는 것은 통로 입구를 막는 검은 면 하나뿐이다.** 걸어 들어간 캐릭터를 감추는 코드는
 * 두지 않는다 — 면이 캐릭터보다 앞에 있어 깊이 검사만으로 가려진다(건물 문간과 같은 방식).
 * 통로 안쪽이 원래 검은 재질이라 이 면도 그 연장으로 보인다.
 */
export function LobbyPassage() {
  const walking = useInteriorStore((s) => s.walking)
  const trigger = useLobbyGeometryStore((s) => s.triggers[LOBBY_PASSAGE_TRIGGER])
  const passage = useLobbyGeometryStore((s) => s.passage)
  /** 지금 걷는 것이 통로로 가는 걸음인지. 다른 연출 이동과 섞이지 않게 따로 센다. */
  const heading = useRef(false)

  // 걷기 시작하면 표시해 둔다. 깊이를 지나기 전에 멎었으면(막혔거나 이미 다 왔거나) 그때 넘어간다.
  useEffect(() => {
    if (walking) {
      if (useSceneTransitionStore.getState().phase === 'idle') heading.current = true
      return
    }
    if (!heading.current) return
    heading.current = false
    enterGallery(LOBBY_PASSAGE_IRIS_SECONDS)
  }, [walking])

  // 통로에 다가서면 전시 공간 모델을 미리 받아 둔다. 전환을 시작한 뒤에 받기 시작하면
  // 덮인 채로 오래 기다린다(건물 문 앞에서 로비를 미리 받는 것과 같다).
  const preloaded = useRef(false)
  useFrame((state) => {
    if (!trigger) return

    if (!preloaded.current) {
      const { position } = useInteriorStore.getState()
      const gap = Math.hypot(position.x - trigger.x, position.z - trigger.z)
      if (gap <= LOBBY_PASSAGE_PRELOAD_RANGE) {
        preloaded.current = true
        preloadGalleryModel()
      }
    }

    // 카메라가 따라 들어가기 시작하는 깊이를 지나면 원이 조여들기 시작한다.
    // 그 뒤로도 걸음은 덮개 밑에서 이어져, 들어가는 것과 덮이는 것이 끊기지 않는다.
    if (heading.current && useSceneTransitionStore.getState().phase === 'idle') {
      if (useInteriorStore.getState().position.z <= LOBBY_CAMERA_LIMIT.followZ) {
        enterGallery(LOBBY_PASSAGE_IRIS_SECONDS)
      }
    }

    if (!heading.current && useSceneTransitionStore.getState().phase === 'idle') return

    // 투영은 카메라가 이번 프레임 자세를 행렬에 반영한 뒤라야 맞다. 리그가 마지막에
    // `updateMatrixWorld`로 마무리하므로 그 뒤에 도는 이 자리에서는 최신 자세다.
    _screen.set(trigger.x, trigger.y, trigger.z).project(state.camera)
    const focus = useSceneTransitionStore.getState().focus
    focus.x = _screen.x * 0.5 + 0.5
    focus.y = -_screen.y * 0.5 + 0.5
  })

  if (!passage) return null

  return (
    <mesh position={[passage.x, passage.y, passage.z - LOBBY_PASSAGE_COVER_INSET]}>
      <planeGeometry args={[passage.width, passage.height]} />
      {/* 조명을 받지 않는 검정. 톤 매핑까지 빼 통로 안쪽 재질과 같은 검정으로 남는다. */}
      <meshBasicMaterial color="#000000" toneMapped={false} />
    </mesh>
  )
}
