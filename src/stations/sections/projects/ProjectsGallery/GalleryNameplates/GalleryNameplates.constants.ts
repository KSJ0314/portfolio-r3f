/**
 * 전시 칸의 이름판 메시. 칸 부품 하나에 한 장이라, 칸을 복제하면 그 수만큼 생긴다.
 * 이름판 재질(`M_LecternGold`)은 고정 핀·누를 판과 함께 쓰므로 재질이 아니라 메시로 짚는다.
 */
export const GALLERY_NAMEPLATE_MESH = 'Plate_Label'

/**
 * 이름판의 금색 판 재질. 고정 핀·누를 판도 같은 것을 쓴다.
 * 이 재질을 쓰는 것은 모두 이름판의 부품이라 함께 밝아져도 된다.
 */
export const GALLERY_NAMEPLATE_PLATE_MATERIAL = 'M_LecternGold'

/** 글씨 판 재질. 자기 환경맵을 물릴 때 이 이름으로 짚는다. */
export const GALLERY_NAMEPLATE_TEXT_MATERIAL = 'M_NameplateText'

/**
 * 이름판에 주는 환경광 세기. 자기 환경맵을 물려 **방 전체 환경광과 무관하게** 이 값으로 밝힌다
 * (바닥을 어둡게 남기는 것과 같은 방법이고 방향만 반대다).
 *
 * 금색 판과 글씨에 **같은 값**을 건다. 판만 올리면 글씨가 어둠에 그대로 남고, 글씨만 올리면
 * 짙은 잉크가 밝아져 새긴 자국이 아니라 얹은 글씨로 보인다. 지금 글씨가 묻히는 것은 판과 잉크가
 * 둘 다 검정에 눌려 서로 구분되지 않기 때문이라, 같은 배수로 올리면 원래 인상 그대로 읽힌다.
 */
export const GALLERY_NAMEPLATE_ENV_INTENSITY = 0.8

/**
 * 갈라낸 **앞면**에 주는 재질 이름. 원본을 복제해 이 이름으로 두고 세기만 달리 건다.
 */
export const GALLERY_NAMEPLATE_FRONT_MATERIAL = 'M_LecternGold_Front'

/**
 * 앞면으로 볼 기준 — 삼각형 법선의 z(로컬 좌표).
 *
 * **정면을 그대로 보는 면만 들인다.** 모서리를 깎아 둔 면은 비스듬히 누워 있어도 옆면이고,
 * 스치는 각이라 이미 밝다. 기준을 느슨하게 잡으면 그 면들이 앞면으로 딸려 들어와 함께 밝아진다.
 */
export const GALLERY_NAMEPLATE_FRONT_THRESHOLD = 0.99

/**
 * 갈라낸 **앞면의 마감**.
 *
 * 환경맵(`RoomEnvironment`)은 실제 방이 아니라 손으로 배치한 상자이고 **좌우로 크게 기울어**
 * 있다(왼쪽 벽의 빛나는 판이 오른쪽보다 여섯 배쯤 밝다). 금속은 확산광이 없어 보이는 것이 전부
 * 반사라, 맺히는 반사를 그대로 두면 같은 판이라도 선 자리에 따라 좌우 밝기가 갈린다.
 *
 * 거칠기를 올리면 반사가 넓게 뭉개져 어느 한 방향을 또렷이 비추지 않고 평균을 담는다.
 * 거칠기 텍스처는 뗀다 — 부분적으로 매끈한 자리가 남으면 거기에만 반사가 다시 맺힌다.
 *
 * `metalness`는 주지 않으면 모델 값(금속) 그대로다. 거칠기로 모자라면 이것을 낮춰 확산광을 들인다.
 */
export const GALLERY_NAMEPLATE_FRONT_FINISH: {
  roughness: number
  dropRoughnessMap: boolean
  metalness?: number
} = {
  roughness: 0.5,
  dropRoughnessMap: true,
}

/**
 * **앞면에만** 주는 환경광 세기.
 *
 * 앞면은 관객 쪽을 향해 세워진 넓은 면이라 정면에서 보면 비추는 쪽이 벽 없는 남쪽이어서 어둡고,
 * 옆면·모서리는 스치는 각이라 밝은 금색으로 남는다. 통째로 올리면 이미 밝은 옆면까지 함께
 * 오르므로 앞면만 갈라 여기서 더 높인다.
 */
export const GALLERY_NAMEPLATE_FRONT_ENV_INTENSITY = 0.5

/**
 * 글씨 판을 이름판 앞면에서 띄우는 거리(월드).
 *
 * 누를 판(`Plate_Label_Hit`)이 이름판 앞면과 같은 평면에 놓여 있어, 그보다 앞으로 나와야
 * 글씨가 가려지지 않는다.
 */
export const GALLERY_NAMEPLATE_LIFT = 0.006

/**
 * 글씨를 그리는 캔버스의 가로(픽셀). 세로는 **잰 이름판의 비율**에서 나온다.
 * 캔버스 비율이 판 비율과 어긋나면 글자가 눌리거나 늘어난다.
 */
export const GALLERY_NAMEPLATE_CANVAS_WIDTH = 1024

/** 이름판 비율을 알 수 없을 때 쓰는 값. 모델의 이름판이 대략 이 비율이다. */
export const GALLERY_NAMEPLATE_FALLBACK_ASPECT = 4.4

/**
 * 판 안에서 글씨가 들어갈 영역 — 판 크기 대비 비율(한쪽 여백).
 * 모델의 누를 판이 차지하는 안쪽 넓이에 맞춰 둔다.
 */
export const GALLERY_NAMEPLATE_MARGIN = { x: 0.03, y: 0.11 }

/**
 * 글자 크기 — 안전 영역 높이 대비 비율. 이름이 길어 폭을 넘으면 여기서 더 줄여 맞춘다.
 * 손글씨는 글자가 기준선 위아래로 퍼져 1에 가깝게 두면 위아래가 잘린다.
 */
export const GALLERY_NAMEPLATE_TEXT_SIZE = 0.78

/**
 * 금색 판에 새긴 글씨 색. 검정은 새긴 자국이 아니라 붙인 스티커처럼 보여 짙은 갈색으로 둔다.
 * 바탕은 칠하지 않는다 — 비워 둬야 밑의 금색이 그대로 비친다.
 */
export const GALLERY_NAMEPLATE_INK = '#3b3226'
