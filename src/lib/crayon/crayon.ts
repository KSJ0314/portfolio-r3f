import { GRAIN_SIZE, GRAIN_STEP } from './crayon.constants'
import type { CrayonPoint, CrayonStrokeParams } from './crayon.types'

/**
 * 크레파스 획 그리기.
 *
 * 크레파스는 선이 아니라 **왁스가 종이 결에 걸려 남은 알갱이 더미**다.
 * 그래서 매끈한 선을 긋지 않고, 경로를 촘촘히 훑으며 굵기 안쪽에 알갱이를 흩뿌린다.
 * 가장자리로 갈수록 찍힐 확률을 낮춰 테두리를 너덜하게 만들고,
 * 진하기를 저주파로 흔들어 눌린 구간과 뜬 구간을 만든다.
 *
 * 난수는 씨앗을 받아 매번 같은 그림이 나오게 한다(렌더할 때마다 모양이 바뀌면 안 된다).
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

/** 꺾은선을 일정 간격으로 다시 샘플링한다. */
function resample(points: readonly CrayonPoint[], step: number): CrayonPoint[] {
  const samples: CrayonPoint[] = []
  for (let i = 0; i < points.length - 1; i += 1) {
    const [x0, y0] = points[i]
    const [x1, y1] = points[i + 1]
    const length = Math.hypot(x1 - x0, y1 - y0)
    const count = Math.max(1, Math.round(length / step))
    for (let k = 0; k < count; k += 1) {
      const t = k / count
      samples.push([x0 + (x1 - x0) * t, y0 + (y1 - y0) * t])
    }
  }
  samples.push(points[points.length - 1])
  return samples
}

/**
 * 획의 양 끝에 둥근 마무리를 붙인다.
 * 끝점 바깥으로 반지름만큼 더 나가되 폭을 원의 단면(√(1-e²))으로 줄여, 잘린 단면이 아니라 반원으로 끝난다.
 */
function withRoundCaps(
  samples: readonly CrayonPoint[],
  radius: number,
  step: number,
): { point: CrayonPoint; widthScale: number }[] {
  // 굵기가 0이면 마무리를 붙일 것도 없다(반지름으로 나누다 NaN이 번진다).
  if (radius <= 0) return samples.map((point) => ({ point, widthScale: 1 }))

  const capped: { point: CrayonPoint; widthScale: number }[] = []
  const capSteps = Math.max(1, Math.round(radius / step))

  const outward = (from: CrayonPoint, toward: CrayonPoint): CrayonPoint => {
    const dx = from[0] - toward[0]
    const dy = from[1] - toward[1]
    const length = Math.hypot(dx, dy) || 1
    return [dx / length, dy / length]
  }

  const last = samples.length - 1
  const startDir = outward(samples[0], samples[Math.min(1, last)])
  const endDir = outward(samples[last], samples[Math.max(0, last - 1)])

  const cap = (origin: CrayonPoint, direction: CrayonPoint, reverse: boolean) => {
    const steps = []
    for (let i = 1; i <= capSteps; i += 1) {
      const extent = (i / capSteps) * radius
      steps.push({
        point: [origin[0] + direction[0] * extent, origin[1] + direction[1] * extent] as CrayonPoint,
        widthScale: Math.sqrt(Math.max(0, 1 - (extent / radius) ** 2)),
      })
    }
    return reverse ? steps.reverse() : steps
  }

  capped.push(...cap(samples[0], startDir, true))
  for (const point of samples) capped.push({ point, widthScale: 1 })
  capped.push(...cap(samples[last], endDir, false))

  return capped
}

export function drawCrayonStroke(
  ctx: CanvasRenderingContext2D,
  points: readonly CrayonPoint[],
  params: CrayonStrokeParams,
): void {
  if (points.length < 2) return

  const { width, color, opacity, roughness, patchiness, wobble, seed } = params
  const random = createRandom(seed)
  const half = width / 2
  const samples = withRoundCaps(resample(points, GRAIN_STEP), half, GRAIN_STEP)

  // 저주파 흔들림·농담의 위상. 씨앗마다 달라야 획이 서로 다르게 보인다.
  const wobblePhase = random() * Math.PI * 2
  const pressurePhase = random() * Math.PI * 2
  const patchPhase = random() * Math.PI * 2

  ctx.save()
  ctx.fillStyle = color

  for (let i = 0; i < samples.length; i += 1) {
    const t = i / (samples.length - 1)
    const { point, widthScale } = samples[i]
    if (widthScale <= 0) continue

    const [x, y] = point
    const [px, py] = samples[Math.max(0, i - 1)].point
    const [nx, ny] = samples[Math.min(samples.length - 1, i + 1)].point

    // 진행 방향과 그에 수직인 방향. 알갱이는 수직 방향으로 퍼진다.
    const dx = nx - px
    const dy = ny - py
    const length = Math.hypot(dx, dy) || 1
    const normalX = -dy / length
    const normalY = dx / length

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

  ctx.restore()
}
