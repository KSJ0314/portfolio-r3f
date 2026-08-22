import { DRACO_DECODER_PATH } from '../../../../lib/draco'
import type { InteriorMaterialOverrides } from '../interior'

/** 전시 공간 라우트. 로비(`/projects`) 안쪽이라 그 아래에 둔다. */
export const GALLERY_ROUTE = '/projects/gallery'

/** 전시 공간 모델. 직접 만든 것이라 출처 표기(`content/credits.ts`) 대상이 아니다. */
export const GALLERY_MODEL_URL = '/assets/gallery.glb'

/** 로비 모델과 같이 Draco로 압축돼 있다. 자리는 앱 전체가 쓰는 self-host 디코더와 같다. */
export const GALLERY_DRACO_PATH = DRACO_DECODER_PATH

/**
 * 조립할 부품 그룹 이름.
 *
 * 이 모델은 완성된 방이 아니라 **전시 칸 한 개와 양 끝 마감, 벽등 한 벌**이다.
 * 칸을 몇 개 세울지는 Firestore가 정하므로 방을 코드에서 조립한다.
 */
export const GALLERY_PART = {
  bay: 'GRP_Bay',
  capLeft: 'GRP_CapLeft',
  capRight: 'GRP_CapRight',
  sconce: 'GRP_Sconce',
} as const

/** 로비로 돌아가는 문. 왼쪽 마감에 달려 있다. */
export const GALLERY_TO_LOBBY_TRIGGER = 'Trigger_ToLobby'

/** 밟고 다니는 콜라이더. 나머지 콜라이더는 막는 것으로 다룬다. 계단이 없어 전부 평평하다. */
export const GALLERY_WALKABLE_NAMES = [
  'Collider_Bay_Floor',
  'Collider_CapL_Floor',
  'Collider_CapR_Floor',
]

/** 머리 위라 이동과 무관한 콜라이더. 막는 목록에서 뺀다. */
export const GALLERY_OVERHEAD_NAMES = [
  'Collider_Bay_Ceiling',
  'Collider_CapL_Ceiling',
  'Collider_CapR_Ceiling',
]

/**
 * 전시 칸이 하나도 없을 때 세우는 개수.
 * 칸 수는 Firestore `projects` 문서 개수지만, 읽기가 실패해도 방은 서야 한다 — 빈 방은 방이 아니다.
 */
export const GALLERY_FALLBACK_BAYS = 1

/**
 * 들어와 서는 자리(월드 x, z). 왼쪽 마감의 문 안쪽이다.
 *
 * 방을 코드에서 조립하므로 첫 칸이 늘 `x = 0`에서 시작하고 왼쪽 마감은 그 왼쪽에 붙는다.
 * 칸이 몇 개든 이 자리는 그대로다.
 */
export const GALLERY_START: readonly [number, number] = [0.4, 1.5]

/**
 * 카메라가 바라보는 점의 높이와 깊이. 바닥이 평평해 캐릭터를 따라 오르내릴 일이 없다.
 *
 * 높이는 **바닥과 액자 윗변의 가운데**다. 벽이 6.2로 높고 작품은 y 2.67~5.04에 걸려 있어,
 * 발밑과 작품을 한 화면에 담으려면 그 사이를 봐야 한다.
 */
export const GALLERY_CAMERA_ANCHOR = { y: 2.55, z: 1.2 }

/**
 * 팔로우 오프셋(카메라 − 바라보는 점).
 *
 * 남쪽 면에 벽이 없어 카메라가 방 밖에서 들여다본다. 길이가 곧 얼마나 멀리서 보는지이고,
 * y·z의 비가 올려다보는 각도다.
 */
export const GALLERY_CAMERA_OFFSET: readonly [number, number, number] = [0, 0.2, 10]

/** 세로 화각(도). 복도라 깊이가 얕아 로비와 같은 값으로 둔다. */
export const GALLERY_CAMERA_FOV = 30

/** 바라보는 점을 화면 한가운데에서 비켜 놓는 정도(화면 반크기 대비 비율, -1~1). */
export const GALLERY_CAMERA_SHIFT = { x: 0, y: 0 }

/** 카메라 절단면. 오프셋 길이에 방 너비를 더한 만큼을 넉넉히 감싼다. */
export const GALLERY_CAMERA_NEAR = 0.1
export const GALLERY_CAMERA_FAR = 120

/** 방 바깥 여백. 실내라 종이 밖 여백과 달리 어둡다. */
export const GALLERY_BACKGROUND = '#0b0b0e'

/** 환경광(IBL). 금속과 광택이 보이는 것은 전적으로 이것 덕이다. */
export const GALLERY_ENV = { blur: 0.08, intensity: 0.6 }

/** 환경광이 채우지 못하는 몫을 메우는 전체 등. 균일한 앰비언트가 아니라 반구광이다. */
export const GALLERY_FILL = { sky: '#beb377', ground: '#000000', intensity: 0.2 }

/** 톤 매핑 노출. 흰 대리석이 밝기 1을 넘겨 잘리는 것을 화면 안으로 들인다. */
export const GALLERY_EXPOSURE = 0.45

/** 불러온 재질을 덮어쓰는 값. 로비와 같은 대리석·나무라 값도 같다. */
export const GALLERY_MATERIAL: InteriorMaterialOverrides = {
  roughness: 0.4,
  dropRoughnessMap: false,
  envMapIntensity: 1,
  normalScale: 0,
}

/**
 * **자기 환경맵을 갖게** 할 재질. 씬 전체 환경광과 무관해져, 방을 밝혀도 이것만 어둡게 남고
 * 반사 계산은 살아 있어 광택이 유지된다. 바닥이 이 재질이다.
 */
export const GALLERY_OWN_ENV = { materials: ['M_DarkMarble.001'], intensity: 0.3 }

/** 벽등 빛. 모델에 담겨 온 색·세기를 덮어쓴다. */
export const GALLERY_LIGHT_COLOR = '#ffd69e'
export const GALLERY_LIGHT_INTENSITY = 6

/** 벽등 빛이 닿는 거리. glb에는 이 값이 없어 무한대로 들어오므로 여기서 잘라 준다. */
export const GALLERY_LIGHT_RANGE = 18

/** 거리에 따라 빛이 죽는 정도. 규격의 물리값은 2(역제곱)이고, 내리면 멀리까지 퍼진다. */
export const GALLERY_LIGHT_DECAY = 1.4

/** 벽등을 벽에서 떼어 놓는 거리(월드). 벽에 파묻힌 점광원은 웅덩이가 얇은 띠가 된다. */
export const GALLERY_LIGHT_STANDOFF = 0.25
