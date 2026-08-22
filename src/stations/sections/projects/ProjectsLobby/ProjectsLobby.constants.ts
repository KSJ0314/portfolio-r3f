import { DRACO_DECODER_PATH } from '../../../../lib/draco'
import { LOBBY_BOOK_TRIGGER } from './LobbyBook/LobbyBook.constants'

/** 로비 라우트. 맵(`/`)과 별개인 페이지다. */
export const LOBBY_ROUTE = '/projects'

/** 로비 모델 파일. 직접 만든 것이라 출처 표기(`content/credits.ts`) 대상이 아니다. */
export const LOBBY_MODEL_URL = '/assets/lobby.glb'

/** 이 모델만 Draco로 압축돼 있다. 자리는 앱 전체가 쓰는 self-host 디코더와 같다. */
export const LOBBY_DRACO_PATH = DRACO_DECODER_PATH

/**
 * 액자에 거는 사진 — 재질 이름 → 파일.
 *
 * 모델이 액자마다 전용 재질을 갖고 있어(`M_Artwork_*`, 각각 뒷판 한 메시에만 쓰인다)
 * 메시가 아니라 재질로 짚는다. 그림을 갈아 끼우려면 여기 경로만 바꾼다.
 */
export const LOBBY_ARTWORK: Record<string, string> = {
  M_Artwork_Left: '/images/lobby/left.jpg',
  M_Artwork_Right: '/images/lobby/right.jpg',
}

/**
 * 밟고 다니는 콜라이더. 나머지 콜라이더는 막는 것으로 다룬다.
 * `Collider_Stair_*`는 계단 모양이 아니라 1층에서 2층까지 이어진 **경사 슬래브**라,
 * 그 위에 얹으면 미끄러지듯 올라간다.
 */
export const LOBBY_WALKABLE_NAMES = [
  'Collider_Floor_Ground',
  'Collider_Floor_Passage',
  'Collider_Floor_Mezzanine',
  'Collider_Stair_L',
  'Collider_Stair_R',
]

/** 밟는 콜라이더 중 계단. 여기 올라선 목표점만 단 중앙으로 맞춘다. */
export const LOBBY_STAIR_NAMES = ['Collider_Stair_L', 'Collider_Stair_R']

/** 눈에 보이는 계단 한 단. 판정용 슬래브에는 단이 없어 이쪽을 재서 단 자리를 얻는다. */
export const LOBBY_STEP_MESH = /^Stair_(Left|Right)_Step_\d+$/

/** 머리 위라 이동과 무관한 콜라이더. 막는 목록에서 뺀다. */
export const LOBBY_OVERHEAD_NAMES = ['Collider_Ceiling', 'Collider_Passage_Ceiling']

/**
 * 아래로 늘려 바닥까지 잇는 콜라이더 — 이름 → 늘릴 높이.
 *
 * 난간은 계단을 따라 기울어 있어 깊은 쪽에서는 머리 위로 지나가고, 그 아래로 계단 옆이 뚫린다.
 * 모델에 없는 면을 새 상자로 만들면 기울기가 사라지므로 **있는 것을 그대로 내린다.**
 * 방을 늘리는 배율은 y를 건드리지 않아 모델 값이 곧 월드 값이다.
 */
export const LOBBY_BLOCKER_EXTEND_DOWN: Record<string, number> = {
  // 난간 꼭대기(y 3.05)에서 바닥 아래까지 닿는 길이.
  Collider_Rail_L: 3.4,
  Collider_Rail_R: 3.4,
}

/**
 * 모델을 좌우(x)·앞뒤(z)로 늘리는 배율. 1이면 만든 그대로다. 높이는 건드리지 않는다.
 *
 * 모델 파일은 손대지 않고 불러온 뒤 늘린다 (DECISIONS 032).
 * 좌우는 원점을 가운데 두고 양쪽으로 벌어지고, 앞뒤는 열린 남쪽 면이 z=0이라
 * 입구가 제자리에 있고 안쪽만 깊어진다.
 *
 * **비균등 배율이라 기둥·연단처럼 둥근 것은 눌린다.** 눈에 거슬릴 만큼 늘려야 한다면
 * 블렌더에서 방 자체를 넓히는 편이 낫다.
 */
export const LOBBY_MODEL_WIDTH_SCALE = 1
export const LOBBY_MODEL_DEPTH_SCALE = 2.5

/**
 * 깊이 배율에서 빼낼 것 — **한 줄이 한 덩어리**이고, 그 안에 이름 접두를 나열한다.
 *
 * 한 덩어리는 통째로 다뤄 조각끼리의 자리 관계가 유지된다. 조각마다 제 중심으로 되돌리면
 * 흩어지므로, 함께 움직여야 하는 것은 한 줄에 적는다.
 * 늘어나면 비율이 깨지는 것을 여기 적는다. 자리는 늘어난 그대로 두고 크기만 되돌린다.
 *
 * **액자(`Panel_Left`·`Panel_Right`)는 아직 넣지 않는다.** 그 액자는 벽면과 나란하지 않고
 * 평면상 기울어 있어(좌우 테두리가 x로 0.25 어긋나 있다), 원본 크기로 되돌리면 기울기가
 * 3.8°에서 9.5°로 서면서 한쪽 끝이 벽을 파고든다. 모델에서 액자를 벽면에 맞춘 뒤에 넣는다.
 */
export const LOBBY_KEEP_DEPTH_GROUPS: readonly (readonly string[])[] = [
  // 연단과 그 위의 책. 기둥·테두리가 둥글어 늘어나면 눌린 타원이 된다.
  // 누를 판·막는 상자가 책과 어긋나지 않도록 트리거도 같은 덩어리로 넣는다.
  ['Book_', 'Lectern_', 'Trigger_Book'],
]

/** 들어와 서는 자리(월드 x, z). 열려 있는 남쪽 면 바로 안쪽이다. */
export const LOBBY_START: readonly [number, number] = [0, -1.2]

/**
 * 남쪽(카메라 쪽) 이동 한계. 시작 자리보다 앞으로는 나오지 않는다.
 * 남쪽 면은 벽이 없어 바닥도 여기서 끝나고, 그 너머는 보여 줄 것도 없다.
 */
export const LOBBY_SOUTH_LIMIT = LOBBY_START[1]

/** 북쪽 통로 트리거. 이름을 여기 두어 쓰는 쪽이 문자열을 박지 않게 한다. */
export const LOBBY_PASSAGE_TRIGGER = 'Trigger_Passage'

/**
 * 통로 앞에 서는 자리(월드 x, z). 전시 공간을 오갈 때 이 자리에 선다.
 *
 * z는 **모델 좌표에 깊이 배율을 곱해** 둔다. 방을 늘리면 통로도 함께 멀어지므로 월드 값으로
 * 박아 두면 어긋난다. 통로 바닥(모델 z −5.1~−3.8) 안쪽이다.
 */
export const LOBBY_PASSAGE_STAND: readonly [number, number] = [0, -3.92 * LOBBY_MODEL_DEPTH_SCALE]

/**
 * 실내 팔로우 오프셋(카메라 − 캐릭터).
 *
 * **방위는 정면**이다 — 남쪽 벽만 없으므로 비스듬히 보면 옆벽이 방 안을 가린다.
 * 정면에서 보면 열린 면으로 그대로 들여다보인다.
 *
 * 맵(직교)과 달리 여기는 원근 카메라라 **거리가 크기를 바꾼다.**
 * y·z의 비가 내려다보는 각도이고, 길이가 곧 얼마나 멀리서 보는지다.
 */
export const LOBBY_CAMERA_OFFSET: readonly [number, number, number] = [0, 0.7, 9]

/**
 * 카메라가 따라가는 범위. 캐릭터를 그대로 따라가지 않고 이만큼만 움직인다.
 *
 * `x`는 시작 자리 기준 좌우 한계다.
 * 깊이는 `followZ`를 **넘어선 만큼만** `followRate`배로 따라 들어간다 — 절반 지점에서 0이고,
 * 캐릭터가 거기서 더 깊이 들어간 만큼에만 비율이 걸린다. 절대 z에 비율을 거는 것이 아니다.
 */
export const LOBBY_CAMERA_LIMIT = {
  x: 0.8,
  /** 계단 z 범위(모델 -1.2~-3.8)의 가운데. 방을 늘리는 배율이 곱해져 화면 좌표가 된다. */
  followZ: -2.5 * LOBBY_MODEL_DEPTH_SCALE,
  followRate: 0.5,
}

/**
 * 세로 화각(도). 원근이 얼마나 세게 느껴지는지를 정한다 — 넓힐수록 깊이가 과장된다.
 * 실내라 벽이 벌어져 보이지 않을 만큼만 둔다.
 */
export const LOBBY_CAMERA_FOV = 30

/**
 * 캐릭터를 화면 한가운데에서 비켜 놓는 정도(화면 반크기 대비 비율, -1~1). 0이면 한가운데다.
 *
 * 팔로우 카메라는 캐릭터를 바라보므로 그냥 두면 캐릭터가 늘 정중앙에 박힌다.
 * 세로를 음수로 두면 캐릭터가 아래로 내려가 그만큼 앞쪽(방 안)이 더 보인다.
 */
export const LOBBY_CAMERA_SHIFT = { x: 0, y: -0.85 }

/**
 * 누를 수 있다는 표시를 띄울 트리거.
 * 통로 문처럼 생김새만으로 지나갈 곳이 읽히는 것은 표시를 두지 않는다.
 */
export const LOBBY_MARKED_TRIGGERS = [LOBBY_BOOK_TRIGGER]

/**
 * 트리거를 열었을 때의 화면 — 카메라가 서는 자리(트리거 중심 기준)와 구도.
 *
 * 대상마다 보는 각이 다르므로 이름으로 나눠 둔다. 여기 없는 트리거는 카메라가 돌지 않는다.
 * 연단 위 책은 남쪽(열린 면 쪽)에서 조금 위로 내려다본다.
 *
 * `shift`는 대상을 화면 한가운데에서 비켜 놓는 정도(화면 반크기 대비, -1~1)다.
 * 카메라가 대상을 바라보므로 이것이 없으면 대상이 늘 정중앙에 박힌다.
 */
export const LOBBY_TRIGGER_FOCUS: Record<
  string,
  { offset: readonly [number, number, number]; shift: { x: number; y: number } }
> = {
  [LOBBY_BOOK_TRIGGER]: { offset: [0, 0.75, 0.95], shift: { x: 0, y: -1 } },
}

/** 트리거를 보러 도는 데 걸리는 시간(초). 닫힐 때도 같다. */
export const LOBBY_TRIGGER_FOCUS_SECONDS = 1.2

/** 카메라 절단면. 오프셋 길이에 방 깊이를 더한 만큼을 넉넉히 감싼다. */
export const LOBBY_CAMERA_NEAR = 0.1
export const LOBBY_CAMERA_FAR = 60

/** 방 바깥 여백. 실내라 종이 밖 여백과 달리 어둡다. */
export const LOBBY_BACKGROUND = '#0b0b0e'

/**
 * 환경광(IBL). **금속과 광택이 보이는 것은 전적으로 이것 덕이다** — 금속은 확산광이 없어
 * 등을 아무리 넣어도 반사할 환경이 없으면 검게 남는다.
 *
 * `blur`는 구울 때의 흐림 정도(0에 가까우면 방 모서리가 또렷이 비친다),
 * `intensity`는 씬에 얹는 세기다. 굽는 밝기가 고정이라 이 값으로만 조절할 수 있다.
 */
export const LOBBY_ENV = { blur: 0.08, intensity: 0.6 }

/**
 * 환경광이 채우지 못하는 몫을 메우는 전체 등. 재질을 보여주는 주역은 환경광이고 이쪽은 거든다.
 *
 * 균일한 앰비언트가 아니라 **반구광**이다 — 앰비언트는 모든 면을 똑같이 밝혀 아무리 세게 줘도
 * 음영이 없어 재질이 납작해진다. 위(`sky`)와 아래(`ground`) 색을 갈라 두면 같은 비용에
 * 면 방향마다 밝기가 달라져 형태와 재질감이 산다. 그림자는 만들지 않아 부담도 없다.
 */
export const LOBBY_FILL = { sky: '#beb377', ground: '#000000', intensity: 0.2 }

/**
 * 벽등 빛 색. 모델에 담겨 온 색을 이것으로 덮어쓴다 —
 * 블렌더에서 다시 내보내지 않고 여기서 바꿀 수 있게 둔다.
 */
export const LOBBY_LIGHT_COLOR = '#ffd69e'

/**
 * 불러온 재질을 덮어쓰는 값. **금속(metalness ≥ 0.5)은 건드리지 않는다** —
 * 금속은 환경 반사가 있어야 보이므로 같이 눌러 버리면 검게 죽는다.
 *
 * 카메라에 따라 변하는 항은 정반사와 환경 반사뿐이다. 벽에 생기던 **가로 방향 번짐**이 그것이었고,
 * 아래 두 값으로 눌러 없앤다. 세로로 남는 번짐은 확산광 쪽이라 `normalScale`로 가른다.
 */
export const LOBBY_MATERIAL = {
  /** 거칠기를 이 값으로 덮어쓴다. 1이 가장 거칠고 정반사가 넓게 퍼져 시야에 덜 흔들린다. */
  roughness: 0.4,
  /** 거칠기 텍스처를 뗄지. 텍스처가 부분적으로 매끈하면 그 자리에 정반사가 몰린다. */
  dropRoughnessMap: false,
  /** 환경 반사 세기(0~1+). 0이면 환경광이 확산광으로만 들어온다. */
  envMapIntensity: 1,
  /**
   * 노멀맵 세기. 1이면 모델 그대로, 0이면 표면 요철을 무시한다.
   *
   * 확산광은 시야와 무관한데도 빛이 세로로 눌려 보이는 것은 노멀맵이 표면 법선을 한쪽으로
   * 쏠리게 만들기 때문이다. 0으로 두면 대리석의 미세한 결은 없어지지만 빛이 제대로 번진다.
   */
  normalScale: 0,
}

/**
 * **자기 환경맵을 갖게** 할 재질. 씬 전체 환경광(`LOBBY_ENV`)과 무관해진다.
 *
 * 재질이 자기 환경맵을 가지면 씬 환경광 세기를 타지 않는다. 그래서 `LOBBY_ENV`를 올려 방을
 * 밝혀도 이 재질은 그대로고, **반사 계산은 살아 있으니 광택은 유지된다.**
 * 반사할 환경은 씬과 같은 것을 쓰되 세기만 여기서 따로 정한다 — 그래서 벽등·밝은 면이
 * 또렷한 하이라이트로 비쳐 대리석으로 읽힌다.
 *
 * `intensity`가 0이면 반사가 없어져 광택도 사라진다.
 * `M_DarkMarble`은 1층 바닥·2층 바닥·계단이 함께 쓴다.
 */
export const LOBBY_OWN_ENV = { materials: ['M_DarkMarble'], intensity: 0.3 }

/**
 * 톤 매핑 노출. 1이 three 기본값이고 내리면 전체가 어두워진다.
 *
 * 흰 대리석은 조금만 세게 받아도 **밝기가 1을 넘어 잘린다.** 잘리면 밝은 쪽 계조가 통째로
 * 사라져 빛 웅덩이가 원형으로 번지지 않고 잘리는 경계선 모양(스치는 각도에서는 좁은 띠)으로 보인다.
 * 조명 세기를 낮추는 대신 노출로 내리면 빛끼리의 비율은 그대로 두고 계조만 화면 안으로 들어온다.
 */
export const LOBBY_EXPOSURE = 0.45

/**
 * 벽등을 벽에서 떼어 놓는 거리(월드). 방 가운데 쪽으로 이만큼 민다.
 *
 * 모델의 광원은 벽면에서 0.1~0.3밖에 안 떨어져 거의 파묻혀 있다. 점광원이 평면에 그만큼 붙으면
 * 입사각이 급격히 눕어 웅덩이가 원형이 아니라 **얇은 띠**가 된다(블렌더에서는 간접광이 그 주변을
 * 채워 줘 멀쩡해 보인다). 떼어 놓은 만큼 웅덩이가 둥글고 넓게 퍼진다.
 *
 * 벽등 여섯 개가 모두 좌우 벽에 붙어 방 안쪽을 향하므로, x의 부호를 보고 가운데로 민다.
 */
export const LOBBY_LIGHT_STANDOFF = 0.6

/**
 * 벽등이 드리우는 그림자. glb는 광원을 담아 와도 그림자 설정은 담기지 않아 여기서 얹는다.
 *
 * **한 번만 굽고 얼린다**(`LobbyModel`) — 계단·난간·연단은 움직이지 않으므로 다시 그릴 이유가 없다.
 * 다만 얼려도 픽셀마다 그림자를 *읽는* 비용은 남으므로, 드리우는 등의 개수가 곧 성능이다.
 */
export const LOBBY_SHADOW = {
  /**
   * 그림자를 쓸지. 꺼두면 어느 등도 드리우지 않아, 그림자를 넣기 전과 완전히 같은 상태가 된다.
   * (Canvas의 `shadows`는 켜져 있어도 드리우는 등이 없으면 비용이 들지 않는다.)
   */
  enabled: true,
  /**
   * 그림자를 드리울 벽등 이름. 여기 없는 등은 빛만 내고 그림자는 만들지 않는다.
   *
   * **개수가 곧 성능이다** — 그림자를 켠 포인트라이트 하나가 모든 재질의 셰이더에
   * 큐브맵 훑기를 한 겹씩 더한다. 여섯 개를 다 켜면 픽셀마다 여섯 번이라 감당이 안 된다.
   *
   * 입구 쪽 등을 고른 이유는 **바닥을 가로질러 비추는 것이 이 등**이기 때문이다.
   * 계단 옆 등(`Sconce_*_0`)은 계단 바로 위라 그 밑이 바닥이 아니라 계단이고,
   * 위층 등(`Sconce_*_1`)은 메자닌 위 깊숙한 자리라 1층 바닥에 빛이 닿지 않는다.
   */
  casters: ['Sconce_Front_Left_Light', 'Sconce_Front_Right_Light'],
  mapSize: 2048,
  /**
   * 그림자 카메라가 훑는 범위(월드). **가까운 쪽(`near`)을 너무 작게 두면 깊이값이 뭉개져**
   * 표면이 자기 자신을 그림자로 오인하고, 그 얼룩이 광원 근처에 네모나게 뭉쳐 보인다.
   * 등에서 이만큼 안쪽에 있는 것은 그림자를 만들지 않는데, 조명 기구는 어차피 제외돼 있어 무방하다.
   */
  cameraNear: 1,
  cameraFar: 28,
  /**
   * 그림자를 검사하는 지점을 표면 법선 쪽으로 띄우는 정도. **0으로 둔다.**
   *
   * 얼룩(그림자 여드름)을 막는 값이지만, 빛을 **스치듯 받는 면**에서는 이 띄움이 빛이 오는
   * 방향으로 크게 밀려 검사 지점이 가리는 물체를 지나쳐 버린다. 그러면 그 면만 그림자가 통째로
   * 샌다 — 벽(빛을 정면으로 받음)에는 나오는데 바닥(스치듯 받음)에는 안 나오던 원인이 이것이다.
   */
  normalBias: 0,
  /** 얼룩은 이쪽으로 잡는다. 깊이값을 밀어내는 것이라 면의 각도와 무관하다. */
  bias: -0.005,
  /** 가장자리를 푸는 정도(PCFSoft에서만 듣는다). */
  radius: 4,
}

/**
 * 제 그림자를 드리우지 않을 조명 기구 부품.
 * 전구·갓·팔이 그림자를 만들면 등이 스스로를 가려 벽에 검은 얼룩이 생긴다.
 */
export const LOBBY_FIXTURE_PART = /_Plate$|_Arm$|_Cup$|_Bulb$/

/** 벽등 세기. 모델에 담겨 온 값(약 11.9)을 덮어쓴다. */
export const LOBBY_LIGHT_INTENSITY = 8

/** 벽등 빛이 닿는 거리. glb에는 이 값이 없어 무한대로 들어오므로 여기서 잘라 준다. */
export const LOBBY_LIGHT_RANGE = 28

/**
 * 거리에 따라 빛이 죽는 정도. glTF 규격의 물리값은 2(역제곱)이고, 내리면 **멀리까지 퍼진다.**
 *
 * 닿는 거리(`RANGE`)만 늘려도 2에서는 이미 가까이서 다 죽어 잘 안 보인다.
 * 실제로 넓게 퍼지게 하는 손잡이는 이쪽이다.
 */
export const LOBBY_LIGHT_DECAY = 1.4
