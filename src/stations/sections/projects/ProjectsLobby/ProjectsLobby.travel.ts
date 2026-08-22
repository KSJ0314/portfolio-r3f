import { Vector3 } from 'three'
import { useCameraStore } from '../../../../state/useCameraStore'
import { useLobbyTriggerStore } from '../../../../state/useLobbyTriggerStore'
import { useProjectsSequenceStore } from '../../../../state/useProjectsSequenceStore'
import { useSceneTransitionStore } from '../../../../state/useSceneTransitionStore'
import { useStationStore } from '../../../../state/useStationStore'
import {
  PROJECTS_DOOR_FALLBACK_STAND,
  PROJECTS_ID,
} from '../ProjectsBuilding/ProjectsBuilding.constants'
import { projectsBuildingStand } from '../ProjectsBuilding/ProjectsBuilding.distance'
import { LOBBY_ROUTE } from './ProjectsLobby.constants'

/**
 * 맵과 로비를 오가는 일.
 *
 * 두 장면은 라우트가 달라 서로를 알지 못하므로, 넘어가며 정리할 것을 여기 한자리에 모은다.
 * 옮기는 것 자체는 덮개(`SceneTransition`)가 **다 덮인 뒤에** 한다.
 */

const _point = new Vector3()

/**
 * 맵에서 볼 화면을 **건물 밖 문 앞에 선 상태**로 맞춘다.
 *
 * 스테이션은 닫히고, 문은 닫힌 것으로 두며, 캐릭터는 문 앞에 선다.
 * 문 자리는 모델에서 잰 값이라, 건물을 잰 적이 없으면(로비에서 새로고침) 어림값으로 보낸다.
 * 걷던 중이었으면 그 이동도 끝낸다 — 걸어 들어가는 도중에 맵을 떠나면 그 표시가 남는다.
 */
function standOutsideDoor(): void {
  useStationStore.getState().closeImmediately()
  const { setDoorClosed, setDoorOpened } = useProjectsSequenceStore.getState()
  setDoorOpened(false)
  setDoorClosed(true)

  const stand = projectsBuildingStand() ?? PROJECTS_DOOR_FALLBACK_STAND
  const camera = useCameraStore.getState()
  camera.endWalk()
  camera.teleportTo(_point.set(stand[0], 0, stand[1]))
}

/** 맵 → 로비. 건물 문으로 걸어 들어가기 시작할 때 부른다. */
export function enterLobby(): void {
  useSceneTransitionStore.getState().close(LOBBY_ROUTE)
}

/**
 * 로비 → 맵. ESC를 누르면 부른다(나가기 버튼도 이것을 쓴다).
 * 돌아가서 볼 화면을 미리 맞춰 두고 전환을 연다.
 *
 * 이미 전환 중이면 아무 일도 하지 않는다 — 연타해도 가던 곳이 바뀌지 않아야 한다.
 */
export function leaveLobby(): void {
  if (useSceneTransitionStore.getState().phase !== 'idle') return
  standOutsideDoor()
  useSceneTransitionStore.getState().close('/')
}

/**
 * 지금 로비에서 이동 입력을 받지 않을 사정이 있는지.
 * 트리거를 보고 있으면 카메라가 캐릭터를 떠나 있어 조준할 화면이 아니다.
 * (화면이 덮여 있는 동안 받지 않는 것은 실내 공통이라 여기서 보지 않는다.)
 */
export function isLobbyMovementBlocked(): boolean {
  return useLobbyTriggerStore.getState().activeId !== null
}

/**
 * 뒤로 가기 — 열어 둔 트리거가 있으면 닫고, 없으면 로비를 나간다.
 *
 * 좌상단 버튼과 ESC가 함께 쓴다. 각자 판단하면 나중에 한쪽만 고쳐져 어긋난다.
 */
export function goBack(): void {
  const { activeId, close } = useLobbyTriggerStore.getState()
  if (activeId) close()
  else leaveLobby()
}

/**
 * 맵이 뜰 때 실내에 있던 흔적을 걷는다. **주소가 맵이면 건물 밖에 서 있어야 한다.**
 *
 * 브라우저 뒤로가기는 주소만 되돌리고 앱 상태는 건드리지 않는다. 그대로 두면 스테이션이 활성인 채라
 * 맵이 뜨자마자 문이 다시 열리고 진입 연출이 통째로 재생돼 밖으로 나올 수가 없다.
 * 평소 흐름(나가기 → 맵)에서는 이미 닫혀 있어 아무 일도 하지 않는다.
 */
export function ensureOutsideBuilding(): void {
  if (useStationStore.getState().activeId !== PROJECTS_ID) return
  standOutsideDoor()
}
