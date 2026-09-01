import { Vector3 } from 'three'
import { useCameraStore } from '../../../../state/useCameraStore'
import { useInteriorStore } from '../../../../state/useInteriorStore'
import { useLobbyGeometryStore } from '../../../../state/useLobbyGeometryStore'
import { useLobbyTriggerStore } from '../../../../state/useLobbyTriggerStore'
import { useProjectsSequenceStore } from '../../../../state/useProjectsSequenceStore'
import { useSceneTransitionStore } from '../../../../state/useSceneTransitionStore'
import { useStationStore } from '../../../../state/useStationStore'
import { preloadGalleryModel } from '../ProjectsGallery/GalleryModel'
import {
  PROJECTS_DOOR_FALLBACK_STAND,
  PROJECTS_ID,
} from '../ProjectsBuilding/ProjectsBuilding.constants'
import { projectsBuildingStand } from '../ProjectsBuilding/ProjectsBuilding.distance'
import {
  LOBBY_GROUND_LEVEL_MAX_Y,
  LOBBY_PASSAGE_ENTER,
  LOBBY_PASSAGE_STAND,
  LOBBY_PASSAGE_WALK_SPEED,
  LOBBY_START,
} from './ProjectsLobby.constants'

/**
 * 맵과 로비를 오가는 일.
 *
 * 두 장면은 라우트가 달라 서로를 알지 못하므로, 넘어가며 정리할 것을 여기 한자리에 모은다.
 * 옮기는 것 자체는 덮개(`SceneTransition`)가 **다 덮인 뒤에** 한다.
 */

const _point = new Vector3()

/**
 * 다음에 로비에 들어설 자리. 전시 공간에서 돌아오면 입구가 아니라 **통로 앞**이다.
 *
 * 로비가 언마운트되면 잰 값도 함께 사라져, 돌아온 쪽이 통로 자리를 물어볼 데가 없다.
 * 떠나는 쪽이 남겨 두고 들어서는 쪽이 한 번 쓰고 비운다.
 */
let nextEntry: readonly [number, number] | null = null

/** 전시 공간이 로비로 나올 때 부른다 — 통로 앞에서 시작하도록 자리를 남긴다. */
export function enterLobbyFromGallery(): void {
  nextEntry = LOBBY_PASSAGE_STAND
}

/** 로비가 들어설 자리를 가져간다. 남겨진 것이 없으면 건물 문 안쪽(입구)이다. */
export function takeLobbyEntry(): readonly [number, number] {
  const entry = nextEntry ?? LOBBY_START
  nextEntry = null
  return entry
}

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
  useSceneTransitionStore.getState().close('lobby')
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
  useSceneTransitionStore.getState().close('map')
}

/**
 * 통로로 걸어갈 수 있는 자리에 서 있는지.
 *
 * **1층에서 계단 난간 사이에 있을 때만** 받는다. 2층이나 계단 위에서 누르면 캐릭터가 난간을
 * 헤집으며 돌아가고, 그 길은 보여 줄 만한 그림이 아니다.
 * 난간 안쪽 폭은 모델에서 잰 값이라 아직 재지 않았으면(방이 뜨기 전) 어디에 서 있든 아니다.
 */
export function canWalkToPassage(): boolean {
  const { position, walking } = useInteriorStore.getState()
  if (walking) return false
  if (position.y > LOBBY_GROUND_LEVEL_MAX_Y) return false
  const { minX, maxX } = useLobbyGeometryStore.getState().corridor
  return position.x >= minX && position.x <= maxX
}

/**
 * 통로 안으로 걸어 들어가게 한다. 도착 뒤에 무엇을 할지는 기다리는 쪽(`LobbyPassage`)이 정한다.
 * 들어가는 구간이라 평소보다 빠른 걸음이다.
 */
export function walkIntoPassage(): void {
  // 걸어가는 동안 받아 둔다. 도착해서 시작하면 그만큼 덮개가 더 덮여 있다.
  preloadGalleryModel()
  useInteriorStore
    .getState()
    .walkTo(LOBBY_PASSAGE_ENTER[0], LOBBY_PASSAGE_ENTER[1], LOBBY_PASSAGE_WALK_SPEED)
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
