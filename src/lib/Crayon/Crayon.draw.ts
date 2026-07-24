import { DEFAULT_CRAYON_PARAMS, GRAIN_SIZE, GRAIN_STEP, PATTERN_PERIOD } from './Crayon.constants'
import type {
  CrayonDrawing,
  CrayonPoint,
  CrayonSharedParams,
  CrayonStrokeParams,
} from './Crayon.types'

/**
 * 크레파스 획 그리기.
 *
 * 크레파스는 선이 아니라 **왁스가 종이 결에 걸려 남은 알갱이 더미**다.
 * 그래서 매끈한 선을 긋지 않고, 경로를 촘촘히 훑으며 굵기 안쪽에 알갱이를 흩뿌린다.
 * 가장자리로 갈수록 찍힐 확률을 낮춰 테두리를 너덜하게 만들고,
 * 진하기를 저주파로 흔들어 눌린 구간과 뜬 구간을 만든다.
 *
 * 난수는 씨앗을 받아 매번 같은 그림이 나오게 한다(렌더할 때마다 모양이 바뀌면 안 된다).
 *
 * 획은 점을 이어 붙이며 조금씩 그릴 수 있다(`createCrayonStrokePainter`).
 * 마우스로 긋는 동안 이미 그린 부분을 다시 건드리지 않아야 해서,
 * 무늬의 진행도를 획 전체 대비 비율이 아니라 **시작점부터 따라간 거리**로 잡는다.
 * 한 번에 그리는 `drawCrayonStroke`도 이 위에 얹혀 있어 결과가 서로 어긋나지 않는다.
 */

/** 씨앗을 받는 작은 난수 생성기(mulberry32). */
function createRandom(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** 획을 훑어가며 왁스를 찍는 지점 하나. */
interface StrokeSample {
  point: CrayonPoint
  /** 시작점부터 따라간 거리(px). 시작 마무리 구간은 음수다. */
  distance: number
  /** 굵기 배율. 둥근 마무리 구간에서 1보다 작아진다. */
  widthScale: number
}

/** 점을 이어 붙이며 그리는 획. 한 번 그린 구간은 다시 건드리지 않는다. */
export interface CrayonStrokePainter {
  /** 경로에 점을 잇고, 방향이 확정된 구간까지 그린다. */
  extend(points: readonly CrayonPoint[]): void
  /** 획을 끝낸다. 남은 구간과 끝의 둥근 마무리를 붙인다. */
  finish(): void
}

/**
 * 획 하나를 조금씩 그려 나가는 붓을 만든다.
 *
 * 마지막 샘플은 다음 점이 와야 진행 방향이 정해지므로 **한 칸 남겨 두고** 그린다.
 * 끝의 둥근 마무리도 획이 끝나야 위치가 정해지므로 `finish()`에서 붙인다.
 * 난수는 붓 하나가 계속 이어 쓰기 때문에, 나눠 그려도 한 번에 그린 것과 결과가 같다.
 */
export function createCrayonStrokePainter(
  ctx: CanvasRenderingContext2D,
  params: CrayonStrokeParams,
): CrayonStrokePainter {
  const { width, color, opacity, roughness, patchiness, wobble, seed } = params
  const random = createRandom(seed)
  const half = width / 2

  // 무늬 주기의 기준 길이. 굵기에 비례시켜 굵기를 바꿔도 상대적인 질감이 유지된다.
  const patternLength = Math.max(1e-6, width * PATTERN_PERIOD)

  // 저주파 흔들림·농담의 위상. 씨앗마다 달라야 획이 서로 다르게 보인다.
  const wobblePhase = random() * Math.PI * 2
  const pressurePhase = random() * Math.PI * 2
  const patchPhase = random() * Math.PI * 2

  /** 받은 원본 점. 여기를 일정 간격으로 훑어 샘플을 뽑는다. */
  const raw: CrayonPoint[] = []
  /** 마지막으로 뽑은 샘플의 자리 — raw의 몇 번째 구간에서 얼마나(0~1) 왔는지. */
  let segment = 0
  let segmentT = 0

  const samples: StrokeSample[] = []
  /** 여기까지는 이미 캔버스에 눌러 담았다. */
  let painted = 0
  /** 시작 마무리를 붙였는지. 방향을 알아야 하므로 샘플 두 개가 모일 때까지 미룬다. */
  let capped = false
  let done = false

  /** 경로를 따라 step만큼 나아간 지점. 남은 경로가 모자라면 null을 주고 자리를 옮기지 않는다. */
  const advance = (step: number): CrayonPoint | null => {
    let cursor = segment
    let cursorT = segmentT
    let remaining = step

    while (cursor < raw.length - 1) {
      const [ax, ay] = raw[cursor]
      const [bx, by] = raw[cursor + 1]
      const length = Math.hypot(bx - ax, by - ay)

      // 같은 자리에 점이 겹쳐 들어오면 길이가 0이다. 나눗셈을 피해 건너뛴다.
      if (length === 0) {
        cursor += 1
        cursorT = 0
        continue
      }

      const left = length * (1 - cursorT)
      if (left >= remaining) {
        cursorT += remaining / length
        segment = cursor
        segmentT = cursorT
        return [ax + (bx - ax) * cursorT, ay + (by - ay) * cursorT]
      }

      remaining -= left
      cursor += 1
      cursorT = 0
    }

    return null
  }

  /** 뽑을 수 있는 만큼 샘플을 뽑아 쌓는다. */
  const collect = () => {
    if (raw.length === 0) return
    if (samples.length === 0) samples.push({ point: raw[0], distance: 0, widthScale: 1 })

    for (;;) {
      const point = advance(GRAIN_STEP)
      if (!point) return
      const previous = samples[samples.length - 1]
      samples.push({ point, distance: previous.distance + GRAIN_STEP, widthScale: 1 })
    }
  }

  /**
   * 끝에 붙이는 둥근 마무리.
   * 끝점 바깥으로 반지름만큼 더 나가되 폭을 원의 단면(√(1-e²))으로 줄여, 잘린 단면이 아니라 반원으로 끝난다.
   */
  const buildCap = (origin: StrokeSample, toward: CrayonPoint, forward: boolean): StrokeSample[] => {
    const dx = origin.point[0] - toward[0]
    const dy = origin.point[1] - toward[1]
    const length = Math.hypot(dx, dy) || 1
    const outX = dx / length
    const outY = dy / length

    const steps = Math.max(1, Math.round(half / GRAIN_STEP))
    const cap: StrokeSample[] = []
    for (let i = 1; i <= steps; i += 1) {
      const extent = (i / steps) * half
      cap.push({
        point: [origin.point[0] + outX * extent, origin.point[1] + outY * extent],
        distance: origin.distance + (forward ? extent : -extent),
        widthScale: Math.sqrt(Math.max(0, 1 - (extent / half) ** 2)),
      })
    }

    // 시작 마무리는 바깥에서 안쪽으로 그어 들어온다.
    return forward ? cap : cap.reverse()
  }

  /** 샘플 하나에 왁스 알갱이를 흩뿌린다. */
  const paint = (index: number) => {
    const { point, distance, widthScale } = samples[index]
    if (widthScale <= 0) return

    const [x, y] = point
    const [px, py] = samples[Math.max(0, index - 1)].point
    const [nx, ny] = samples[Math.min(samples.length - 1, index + 1)].point

    // 진행 방향과 그에 수직인 방향. 알갱이는 수직 방향으로 퍼진다.
    const dx = nx - px
    const dy = ny - py
    const length = Math.hypot(dx, dy) || 1
    const normalX = -dy / length
    const normalY = dx / length

    // 무늬의 진행도. 따라간 거리 기준이라 뒤가 길어져도 앞의 무늬가 변하지 않는다.
    const t = distance / patternLength

    // 경로를 손으로 그은 듯 흔든다.
    const wobbleOffset =
      wobble * (Math.sin(t * 3.1 + wobblePhase) * 0.6 + Math.sin(t * 7.7 + wobblePhase * 2) * 0.4)
    const centerX = x + normalX * wobbleOffset
    const centerY = y + normalY * wobbleOffset

    // 눌린 구간과 뜬 구간.
    const pressure = 0.55 + 0.45 * (Math.sin(t * 5.3 + pressurePhase) * 0.5 + 0.5)
    // 왁스가 끊기는 구간.
    const coverage = 1 - patchiness * (0.5 + 0.5 * Math.sin(t * 17.1 + patchPhase))

    // 둥근 마무리 구간에서는 폭이 좁아지므로 알갱이 수도 함께 줄인다.
    const halfHere = half * widthScale
    const grains = Math.max(1, Math.round(width * 1.1 * widthScale))
    for (let g = 0; g < grains; g += 1) {
      if (random() > coverage) continue

      // -1(위 가장자리) ~ 1(아래 가장자리).
      const across = random() * 2 - 1
      // 가장자리로 갈수록 덜 찍힌다 → 테두리가 너덜해진다.
      if (random() < Math.abs(across) * roughness) continue

      const alongJitter = (random() - 0.5) * GRAIN_STEP * 2
      const grainX = centerX + normalX * across * halfHere + (dx / length) * alongJitter
      const grainY = centerY + normalY * across * halfHere + (dy / length) * alongJitter

      ctx.globalAlpha = Math.min(
        1,
        opacity * pressure * (0.35 + 0.65 * random()) * (1 - Math.abs(across) * 0.35),
      )
      ctx.fillRect(grainX, grainY, GRAIN_SIZE, GRAIN_SIZE)
    }
  }

  /** `limit` 직전까지의 샘플을 캔버스에 눌러 담는다. */
  const flush = (limit: number) => {
    if (painted >= limit) return

    ctx.save()
    ctx.fillStyle = color
    while (painted < limit) {
      paint(painted)
      painted += 1
    }
    ctx.restore()
  }

  /** 시작 마무리를 앞에 끼운다. 아직 아무것도 안 그렸을 때만 가능하다. */
  const capStart = () => {
    if (capped || samples.length < 2) return
    if (half > 0) samples.unshift(...buildCap(samples[0], samples[1].point, false))
    capped = true
  }

  return {
    extend(points) {
      if (done || points.length === 0) return

      raw.push(...points)
      collect()
      capStart()
      if (!capped) return

      // 마지막 샘플은 다음 점이 와야 진행 방향이 정해지므로 남겨 둔다.
      flush(samples.length - 1)
    },

    finish() {
      if (done) return
      done = true

      collect()

      // 마지막 원본 점을 정확히 찍는다. 샘플 간격에 딱 맞아떨어지지 않아 남은 자투리다.
      const tail = raw[raw.length - 1]
      const last = samples[samples.length - 1]
      if (tail && last) {
        const gap = Math.hypot(tail[0] - last.point[0], tail[1] - last.point[1])
        if (gap > 1e-6) samples.push({ point: tail, distance: last.distance + gap, widthScale: 1 })
      }

      // 점 하나로는 획이 되지 않는다.
      if (samples.length < 2) return

      capStart()
      if (half > 0) {
        const end = samples[samples.length - 1]
        samples.push(...buildCap(end, samples[samples.length - 2].point, true))
      }

      flush(samples.length)
    },
  }
}

/** 크레파스 획 하나를 캔버스에 그린다(점은 픽셀 좌표). */
export function drawCrayonStroke(
  ctx: CanvasRenderingContext2D,
  points: readonly CrayonPoint[],
  params: CrayonStrokeParams,
): void {
  if (points.length < 2) return

  const painter = createCrayonStrokePainter(ctx, params)
  painter.extend(points)
  painter.finish()
}

/**
 * 크레파스 그림(획 여러 개)을 캔버스에 굽는다.
 * 각 획의 0~1 정규화 좌표를 캔버스 크기로 스케일해, 획별 씨앗으로 `drawCrayonStroke`를 부른다.
 * 가로세로를 따로 받으므로 정사각이 아닌 캔버스에도 그릴 수 있다.
 * `params`는 획들이 공유하는 값이며 `DEFAULT_CRAYON_PARAMS`에 병합된다.
 * 씨앗은 획이 정하고, 색도 획이 갖고 있으면 그쪽이 공유 색을 이긴다(한 그림에 여러 색을 섞을 수 있다).
 */
export function drawCrayonDrawing(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  drawing: CrayonDrawing,
  params?: CrayonSharedParams,
): void {
  const shared = { ...DEFAULT_CRAYON_PARAMS, ...params }
  for (const stroke of drawing) {
    const points = stroke.points.map(([u, v]): CrayonPoint => [u * width, v * height])
    drawCrayonStroke(ctx, points, {
      ...shared,
      seed: stroke.seed,
      color: stroke.color ?? shared.color,
    })
  }
}
