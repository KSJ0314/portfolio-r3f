import { useGLTF } from '@react-three/drei'
import { LOBBY_DRACO_PATH, LOBBY_MODEL_URL } from '../ProjectsLobby.constants'

/**
 * 로비 모델을 미리 받아 둔다(그리는 것 없음).
 *
 * 1.8MB라 앱이 뜰 때 받으면 첫 화면이 늦고, 전환을 시작한 뒤에 받기 시작하면 덮인 채로 오래 기다린다.
 * 그래서 건물 문 앞에 다가섰을 때 맵이 이것을 부른다.
 */
export function preloadLobbyModel(): void {
  useGLTF.preload(LOBBY_MODEL_URL, LOBBY_DRACO_PATH)
}
