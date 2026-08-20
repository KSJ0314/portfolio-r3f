/** 스테이션 id — 프로젝트 구역 입구인 건물이다. 안에 놓일 전시대는 `project-*`가 따로 갖는다. */
export const PROJECTS_ID = 'projects'

/** `useBlockersStore`에 올릴 이름. 건물 발자국을 이 이름으로 넣고 뺀다. */
export const PROJECTS_BLOCKER_ID = 'projects-building'

/** 건물 모델 파일. 출처 표기(`content/credits.ts`)가 이 값을 가져다 쓴다. */
export const PROJECTS_BUILDING_URL = '/assets/projects.glb'

/** 배치 기본값. 눈으로 맞춰야 하는 값이라 HUD로 조절한다. */
export const PROJECTS_BUILDING_PLACEMENT = {
  /** 건물 높이의 월드 크기. 가로·깊이는 모델 비율에서 나온다. */
  height: 6,
  /** 밑면 중심(월드 x, z). 자동차가 내리는 자리 옆이다. */
  x: -15,
  z: 18,
  /**
   * y축 회전(도). 모델은 차양이 -z로 튀어나와 그쪽이 앞면으로 보이므로,
   * 180이면 앞면이 자동차가 오는 +z 쪽을 본다.
   */
  rotation: 180,
}

/**
 * 문을 아직 재지 못했을 때 대신 쓰는 문 앞자리(월드 x, z).
 *
 * 로비에서 새로고침한 뒤 맵으로 나오면 건물이 마운트된 적이 없어 문 자리를 모른다.
 * 그때 캐릭터를 원점에 두면 지도 반대편에서 시작하므로, 건물 앞 어림값으로 보낸다.
 */
export const PROJECTS_DOOR_FALLBACK_STAND: readonly [number, number] = [
  PROJECTS_BUILDING_PLACEMENT.x,
  PROJECTS_BUILDING_PLACEMENT.z + 4,
]

/** 건물이 놓인 자리(월드 x, z). `stations.ts`의 배치 좌표로 쓴다. */
export const PROJECTS_CENTER: readonly [number, number] = [
  PROJECTS_BUILDING_PLACEMENT.x,
  PROJECTS_BUILDING_PLACEMENT.z,
]

/**
 * 근접 판정 구역 — **잰 문 자리 기준**으로 문이 향하는 쪽에 놓인다.
 * 값은 모델 좌표라 건물 크기를 바꾸면 배율이 곱해져 함께 커진다.
 *
 * 건물 전체가 아니라 여기 들어와야 문을 누를 수 있다.
 * 공통층이 판정에 `NEAR_RADIUS`(2)를 더 얹으므로, 실제로 반응하는 범위는 이 사각형보다 그만큼 넓다.
 */
export const PROJECTS_NEAR = { forward: 0.3, width: 0.98, depth: 0.78 }

/**
 * 문이 열리는 방식. 카메라가 정면으로 돈 뒤에 열리고, 닫으면 되돌아온다.
 * 안쪽으로 열리게 하려면 경첩 쪽에 맞춰 각도 부호를 뒤집는다.
 */
export const PROJECTS_SWING = {
  /** 경첩이 오른쪽(+x) 모서리인지. 거짓이면 왼쪽이다. */
  hingeRight: true,
  /** 열렸을 때의 각도(도). 부호가 여는 방향이다. */
  angle: 80,
  /** 열리고 닫히는 데 걸리는 시간(초). */
  seconds: 0.8,
}

/**
 * 문에 붙는 클릭 판(세로로 선 사각형).
 *
 * 자리는 **건물 중심에서 떨어진 거리**이고 모델 좌표라 건물 크기를 바꾸면 배율이 곱해져 따라온다.
 * 크기는 잰 문 크기 대비 배수다. 판이 향하는 쪽은 문이 보는 쪽에서 나온다.
 */
export const PROJECTS_DOOR_PLATE = { x: -0.14, y: 0.135, z: 0.32, width: 3, height: 2 }

/**
 * 문 위에 뜨는 클릭 표시.
 *
 * 자리는 **건물 중심에서 떨어진 거리**이고 모델 좌표다. 문은 앞 벽면보다 안으로 들어가 있어
 * z를 앞으로 빼야 문틀에 파묻히지 않는다.
 */
export const PROJECTS_MARKER = { x: -0.25, y: 0.62, z: 0.5, size: 0.1 }

/** 표시가 흔들리고 도는 값 — 자동차 위의 것과 같은 인상으로 둔다. */
export const PROJECTS_MARKER_MOTION = {
  bob: 0.15,
  bobSeconds: 1.6,
  spinSeconds: 3,
  fadeSeconds: 0.4,
}

/** 항공뷰 ↔ 문 정면뷰 전환 시간(초)과 이징. */
export const PROJECTS_TURN_SECONDS = 1
export const PROJECTS_TURN_EASE = 'power2.inOut'

/**
 * 문 정면뷰 자세.
 *
 * 다른 스테이션은 바닥에 그려진 내용을 수직으로 내려다보지만, 여기서 볼 것은 **세워 둔 문**이라
 * 눈높이에서 정면으로 본다. 정면이 어느 쪽인지는 건물 회전에서 구하므로 건물을 돌리면 함께 돈다.
 */
export const PROJECTS_VIEW = {
  /** 문에서 카메라까지의 거리(수평). 직교 카메라라 배율이 아니라 잘리는 범위에만 관계한다. */
  distance: 12,
  /** 카메라 높이(월드 y). 보는 높이와의 차이가 곧 내려다보는 각도다. */
  height: 10,
  /** 바라보는 점의 높이(월드 y) — 문 한가운데쯤. */
  lookY: 3.5,
  /** 캐릭터가 들어갈 때 확대하는 배수. 1이면 그대로다. */
  zoom: 1.2,
  /** 확대에 걸리는 시간(초). */
  zoomSeconds: 2.5,
}

/**
 * 캐릭터가 건물 안으로 들어가 서는 깊이.
 *
 * 곧장 앞으로만 들어가므로 x는 선 자리를 그대로 두고 z만 쓴다.
 * 건물 중심 기준 모델 좌표라 건물 크기를 바꾸면 배율이 곱해져 따라온다.
 */
export const PROJECTS_ENTER = {
  z: 0.1,
  /** 들어갈 때의 걸음 속도(유닛/초). 평소(4)보다 느리게 둔다. */
  speed: 1.6,
}

