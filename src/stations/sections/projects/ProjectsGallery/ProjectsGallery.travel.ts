import { useGalleryFocusStore } from '../../../../state/useGalleryFocusStore'
import { useSceneTransitionStore } from '../../../../state/useSceneTransitionStore'
import { enterLobbyFromGallery } from '../ProjectsLobby/ProjectsLobby.travel'

/**
 * 로비와 전시 공간을 오가는 일.
 *
 * 두 장면은 라우트가 달라 서로를 알지 못하므로, 넘어가며 정리할 것을 여기 한자리에 모은다.
 * 옮기는 것 자체는 덮개(`SceneTransition`)가 **다 덮인 뒤에** 한다.
 */

/**
 * 로비 → 전시 공간. 통로로 걸어 들어가기 시작할 때 부른다.
 * 조여드는 시간은 그 걸음에 맞춰 부르는 쪽이 준다.
 */
export function enterGallery(seconds?: number): void {
  useSceneTransitionStore.getState().close('gallery', seconds)
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
  useSceneTransitionStore.getState().close('lobby')
}

/**
 * 좌상단 뒤로 가기와 ESC가 타는 길.
 *
 * 액자를 확대해 보고 있으면 **그것부터 닫고**, 아니면 로비로 나간다.
 * 나가는 문이 하나뿐이라 어느 쪽이든 같은 자리·같은 키로 되돌아간다.
 */
export function goBackFromGallery(): void {
  const focus = useGalleryFocusStore.getState()
  if (focus.focusedBay !== null) {
    focus.close()
    return
  }
  leaveGallery()
}
