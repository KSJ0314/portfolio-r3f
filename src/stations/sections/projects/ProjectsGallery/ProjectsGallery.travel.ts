import { useSceneTransitionStore } from '../../../../state/useSceneTransitionStore'
import { LOBBY_ROUTE } from '../ProjectsLobby/ProjectsLobby.constants'
import { enterLobbyFromGallery } from '../ProjectsLobby/ProjectsLobby.travel'
import { GALLERY_ROUTE } from './ProjectsGallery.constants'

/**
 * 로비와 전시 공간을 오가는 일.
 *
 * 두 장면은 라우트가 달라 서로를 알지 못하므로, 넘어가며 정리할 것을 여기 한자리에 모은다.
 * 옮기는 것 자체는 덮개(`SceneTransition`)가 **다 덮인 뒤에** 한다.
 */

/** 로비 → 전시 공간. 통로 앞에 다 걸어간 뒤에 부른다. */
export function enterGallery(): void {
  useSceneTransitionStore.getState().close(GALLERY_ROUTE)
}

/**
 * 전시 공간 → 로비. 문을 누르거나 좌상단 버튼·ESC로 부른다.
 *
 * 이미 전환 중이면 아무 일도 하지 않는다 — 연타해도 가던 곳이 바뀌지 않아야 한다.
 * 돌아가서 설 자리(통로 앞)를 미리 남겨 둔다.
 */
export function leaveGallery(): void {
  if (useSceneTransitionStore.getState().phase !== 'idle') return
  enterLobbyFromGallery()
  useSceneTransitionStore.getState().close(LOBBY_ROUTE)
}
