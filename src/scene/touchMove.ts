import { Raycaster, Vector2, type Camera, type Object3D } from 'three'

/**
 * 터치 조작이 탭인지 홀드인지 가르는 자리.
 *
 * 마우스 없는 기기에서는 누르고 있는 동안 그 지점으로 이동한다(우클릭 홀드와 같은 규칙).
 * 손가락은 버튼이 하나뿐이라 우클릭(이동)과 좌클릭(활성화)으로 갈리던 것이 한데 겹친다.
 * 그래서 인터랙션 대상 위에서는 닿는 순간 이동하지 않고 탭인지 홀드인지 가려낸다.
 * 짧게 눌렀다 떼면 이동하지 않으므로 그 탭이 스테이션·트리거 활성화에 쓰인다.
 *
 * 빈 바닥에서는 겹칠 것이 없으므로 기다리지 않고 곧바로 이동한다.
 * 인터랙션 대상은 각자 여기 등록한다.
 *
 * 홀드로 이동한 뒤에는 브라우저가 터치 종료 지점에서 마우스 이벤트를 합성해 발생시킨다.
 * 그 한 번을 활성화로 치지 않도록 잠시 표시를 남긴다.
 */

/**
 * 이보다 오래 누르고 있으면 이동으로 넘어간다(ms).
 * 탭의 상한으로 흔히 쓰는 값이 0.15~0.2초라 그 안에서 잡는다.
 * 손가락을 움직이면 시간과 무관하게 넘어가므로 지연은 가만히 누를 때만 생긴다.
 */
const TAP_MS = 150

/** 이보다 많이 움직이면 이동으로 넘어간다(px). */
const TAP_PX = 10

/** 합성 마우스 이벤트가 뒤따라오는 동안만 표시를 남겨 둔다(ms). */
const MARK_MS = 400

const _raycaster = new Raycaster()
const _pointer = new Vector2()

/** 지금 화면의 인터랙션 대상. 화면이 갈리면 그 화면의 것만 남는다. */
const targets = new Set<Object3D>()

let startedAt = 0
let startX = 0
let startY = 0
let draggedUntil = 0

/** 손가락이 닿았다. 탭인지 홀드인지는 여기서부터 잰다. */
export function beginTouchPress(x: number, y: number): void {
  startedAt = performance.now()
  startX = x
  startY = y
}

/** 지금 자리가 탭의 범위를 넘었는지. 넘었으면 이동을 시작한다. */
export function isTouchDragging(x: number, y: number): boolean {
  return performance.now() - startedAt > TAP_MS || Math.hypot(x - startX, y - startY) > TAP_PX
}

/** 홀드로 이동한 뒤 손가락을 뗐다. 뒤따라올 합성 마우스 이벤트를 거르도록 표시한다. */
export function endTouchDrag(): void {
  draggedUntil = performance.now() + MARK_MS
}

/** 방금 홀드로 이동한 뒤인지. 활성화 핸들러가 합성 이벤트를 거르는 데 쓴다. */
export function isAfterTouchDrag(): boolean {
  return performance.now() < draggedUntil
}

/**
 * 인터랙션 대상을 등록한다. 돌려주는 함수를 부르면 등록이 걷힌다.
 * 대상은 그룹 하나이고 그 아래 전부가 판정 범위다.
 */
export function registerTouchTarget(object: Object3D): () => void {
  targets.add(object)
  return () => {
    targets.delete(object)
  }
}

/** 화면 좌표(px)가 인터랙션 대상 위인지. 탭을 활성화로 넘길지 이동으로 쓸지 가른다. */
export function isOverTouchTarget(
  camera: Camera,
  canvas: HTMLCanvasElement,
  clientX: number,
  clientY: number,
): boolean {
  if (targets.size === 0) return false
  const rect = canvas.getBoundingClientRect()
  _pointer.set(
    ((clientX - rect.left) / rect.width) * 2 - 1,
    -((clientY - rect.top) / rect.height) * 2 + 1,
  )
  _raycaster.setFromCamera(_pointer, camera)
  for (const target of targets) {
    if (_raycaster.intersectObject(target, true).length > 0) return true
  }
  return false
}
