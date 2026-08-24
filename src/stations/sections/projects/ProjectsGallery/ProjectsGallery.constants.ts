import { DRACO_DECODER_PATH } from '../../../../lib/draco'
import type { InteriorMaterialOverrides } from '../interior'
import {
  GALLERY_NAMEPLATE_ENV_INTENSITY,
  GALLERY_NAMEPLATE_FRONT_ENV_INTENSITY,
  GALLERY_NAMEPLATE_FRONT_MATERIAL,
  GALLERY_NAMEPLATE_PLATE_MATERIAL,
} from './GalleryNameplates/GalleryNameplates.constants'

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

/**
 * 조립한 방을 늘리는 배율. 1이면 만든 그대로다.
 *
 * 모델 파일은 손대지 않고 조립한 뒤 늘린다 (DECISIONS 032).
 * 로비는 높이를 건드리지 않지만 여기는 세 축을 모두 연다 — 복도라 폭·깊이·천장 높이의 비가
 * 곧 공간의 인상이다. 칸을 다 늘어놓은 뒤에 걸므로 칸 사이가 벌어지거나 겹치지 않는다.
 *
 * **비균등 배율이라 둥근 것은 눌린다.** 눈에 거슬릴 만큼 늘려야 한다면
 * 블렌더에서 방 자체를 고치는 편이 낫다.
 */
export const GALLERY_MODEL_SCALE = { x: 0.7, y: 0.7, z: 1.5 }

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
 *
 * 손으로 맞춘 값은 **모델 좌표**라 방 배율을 곱해 둔다.
 * 월드 값으로 박아 두면 방을 늘릴 때 문만 제자리에 남는다.
 */
export const GALLERY_START: readonly [number, number] = [
  0.4 * GALLERY_MODEL_SCALE.x,
  1.5 * GALLERY_MODEL_SCALE.z,
]

/**
 * 카메라가 바라보는 점의 높이와 깊이. 바닥이 평평해 캐릭터를 따라 오르내릴 일이 없다.
 *
 * 높이는 **바닥과 액자 윗변의 가운데**다. 벽이 6.2로 높고 작품은 y 2.67~5.04에 걸려 있어,
 * 발밑과 작품을 한 화면에 담으려면 그 사이를 봐야 한다.
 *
 * **모델 좌표다.** 방 배율은 여기서 굽지 않고 `GalleryCameraRig`가 읽는 순간에 곱한다 —
 * 이 값은 개발용 HUD가 만지는 튜닝 값이라, 배율을 구워 두면 HUD에 뜨는 값과 여기 적는 값이
 * 달라져 "HUD에서 맞춘 값을 상수에 반영한다"는 왕복이 깨진다.
 */
export const GALLERY_CAMERA_ANCHOR = { y: 3.0, z: 2 }

/**
 * 팔로우 오프셋(카메라 − 바라보는 점).
 *
 * 남쪽 면에 벽이 없어 카메라가 방 밖에서 들여다본다. 길이가 곧 얼마나 멀리서 보는지이고,
 * y·z의 비가 올려다보는 각도다.
 */
export const GALLERY_CAMERA_OFFSET: readonly [number, number, number] = [0, 1.5, 10]

/** 세로 화각(도). 복도라 깊이가 얕아 로비와 같은 값으로 둔다. */
export const GALLERY_CAMERA_FOV = 25

/** 바라보는 점을 화면 한가운데에서 비켜 놓는 정도(화면 반크기 대비 비율, -1~1). */
export const GALLERY_CAMERA_SHIFT = { x: 0, y: 0 }

/**
 * 카메라 절단면. 오프셋 길이에 방 너비를 더한 만큼을 넉넉히 감싼다.
 * 화면 기준 값이라 배율을 곱하지 않는다. 방을 크게 늘리면 `FAR`를 다시 본다.
 */
export const GALLERY_CAMERA_NEAR = 0.1
export const GALLERY_CAMERA_FAR = 120

/** 방 바깥 여백. 실내라 종이 밖 여백과 달리 어둡다. */
export const GALLERY_BACKGROUND = '#0b0b0e'

/** 환경광(IBL). 금속과 광택이 보이는 것은 전적으로 이것 덕이다. */
export const GALLERY_ENV = { blur: 0.08, intensity: 0.3 }

/** 환경광이 채우지 못하는 몫을 메우는 전체 등. 균일한 앰비언트가 아니라 반구광이다. */
export const GALLERY_FILL = { sky: '#beb377', ground: '#000000', intensity: 0 }

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
 * **자기 환경맵을 갖게** 할 재질 — 항목마다 세기를 따로 준다.
 *
 * 재질이 자기 환경맵을 가지면 씬 전체 환경광 세기를 타지 않으므로, 방보다 어둡게도 밝게도
 * 둘 수 있다. 반사 계산은 살아 있어 광택은 그대로다. 항목을 나눈 것은 어둡게 둘 것과 밝힐 것이
 * 함께 있기 때문이다.
 */
export const GALLERY_OWN_ENV: readonly { materials: readonly string[]; intensity: number }[] = [
  // 바닥. 방을 밝혀도 여기만 어둡게 남는다.
  { materials: ['M_DarkMarble.001'], intensity: 0.3 },
  // 이름판. 벽등이 닿지 않는 자리라 방 밝기로는 글씨가 묻힌다.
  {
    materials: [GALLERY_NAMEPLATE_PLATE_MATERIAL],
    intensity: GALLERY_NAMEPLATE_ENV_INTENSITY,
  },
  // 이름판 앞면. 정면에서 비추는 쪽이 어두워 옆면보다 훨씬 어둡게 나오므로 여기만 더 올린다.
  {
    materials: [GALLERY_NAMEPLATE_FRONT_MATERIAL],
    intensity: GALLERY_NAMEPLATE_FRONT_ENV_INTENSITY,
  },
]

/** 벽등 빛. 모델에 담겨 온 색·세기를 덮어쓴다. */
export const GALLERY_LIGHT_COLOR = '#ffcd88'
export const GALLERY_LIGHT_INTENSITY = 15

/**
 * 벽등 빛이 닿는 거리. glb에는 이 값이 없어 무한대로 들어오므로 여기서 잘라 준다.
 * 광원의 닿는 거리는 부모 배율을 타지 않는 월드 값이라, 방을 크게 늘리면 상대적으로 좁아진다.
 */
export const GALLERY_LIGHT_RANGE = 30

/** 거리에 따라 빛이 죽는 정도. 규격의 물리값은 2(역제곱)이고, 내리면 멀리까지 퍼진다. */
export const GALLERY_LIGHT_DECAY = 1.4

/**
 * 벽등을 벽에서 떼어 놓는 거리(월드). 벽에 파묻힌 점광원은 웅덩이가 얇은 띠가 된다.
 * 미는 대상이 광원의 로컬 좌표라 쓰는 쪽(`GalleryModel`)에서 방 배율로 나눠 넣는다.
 */
export const GALLERY_LIGHT_STANDOFF = 0.25
