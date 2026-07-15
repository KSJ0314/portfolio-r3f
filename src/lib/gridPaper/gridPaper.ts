import type { GridPaperParams, GridPaperRenderOptions } from './gridPaper.types'

/**
 * 손그림 모눈종이 텍스처를 그린다. 앱(개발용 HUD 미리보기)과 생성 스크립트가 이 코드를 함께 쓴다.
 * 같은 코드를 써야 HUD에서 맞춘 값과 실제로 구워지는 PNG가 어긋나지 않는다.
 *
 * 바닥은 이 한 장을 수십 번 타일링하므로 가장자리가 정확히 맞물리는 **심리스** 이미지여야 한다.
 * 그래서 선의 떨림과 종이 결을 전부 "타일 크기를 주기로 갖는" 함수로만 만든다.
 * 사인파는 타일 폭을 정수 번 반복하면 끝에서 시작값으로 돌아오고,
 * 값 노이즈는 격자 인덱스를 타일 폭으로 나눈 나머지로 감아 반대편과 같은 난수를 쓰게 한다.
 */

/** 진하기·굵기가 오르내리는 주기(칸 기준). 선을 따라가며 농담이 변하는 속도를 정한다. */
const OPACITY_CYCLES_PER_CELL = [0.0625, 0.15625]
const PRESSURE_CYCLES_PER_CELL = [0.03125, 0.09375]

/** 떨림·농담을 이루는 사인파들의 가중치. 앞쪽이 완만한 큰 흐름, 뒤로 갈수록 잔떨림이다. */
const WOBBLE_WEIGHTS = [0.4, 0.3, 0.2, 0.1]
const VARIANCE_WEIGHTS = [0.6, 0.4]

/** 종이 결 노이즈의 격자 주기(텍스처 기준). 타일 폭을 나누어떨어져야 이음매가 안 생긴다. */
const GRAIN_PERIOD = 64

function hash(x: number, y: number, seed: number) {
  const s = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453123
  return s - Math.floor(s)
}

/**
 * 타일 경계에서 감기는 값 노이즈. 격자 인덱스를 period로 나눈 나머지로 읽어
 * 오른쪽 끝과 왼쪽 끝이 같은 난수를 참조하게 만든다 → 이어붙여도 이음매가 없다.
 */
function periodicNoise(x: number, y: number, period: number, seed: number) {
  const xi = Math.floor(x)
  const yi = Math.floor(y)
  const xf = x - xi
  const yf = y - yi
  const ux = xf * xf * (3 - 2 * xf)
  const uy = yf * yf * (3 - 2 * yf)

  const wrap = (v: number) => ((v % period) + period) % period
  const x0 = wrap(xi)
  const y0 = wrap(yi)
  const x1 = wrap(xi + 1)
  const y1 = wrap(yi + 1)

  const a = hash(x0, y0, seed)
  const b = hash(x1, y0, seed)
  const c = hash(x0, y1, seed)
  const d = hash(x1, y1, seed)

  return (a + (b - a) * ux) * (1 - uy) + (c + (d - c) * ux) * uy
}

/** 여러 주파수의 사인파를 가중 합산한다. t는 0~1로 정규화한 "선을 따라간 거리"다. */
function waves(t: number, seed: number, frequencies: number[], weights: number[]) {
  const tau = Math.PI * 2
  let sum = 0
  for (let i = 0; i < frequencies.length; i++) {
    sum += weights[i] * Math.sin(tau * frequencies[i] * t + seed * (1.7 + i * 1.4))
  }
  return sum
}

/**
 * 칸 기준 주기를 타일 기준 주기로 환산한다.
 * 심리스를 유지하려면 사인파가 타일 폭을 **정수 번** 반복해야 하므로 반올림한다.
 * (그래서 칸 수를 바꾸면 구불거림의 무늬가 미세하게 달라진다. 폭·주기 비율은 유지된다.)
 */
function toTileCycles(cyclesPerCell: number[], cells: number) {
  return cyclesPerCell.map((cycles) => Math.max(1, Math.round(cycles * cells)))
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}

function mix(a: number, b: number, t: number) {
  return a + (b - a) * t
}

/** '#rrggbb' → [r, g, b] (0~255). */
function toRgb(hex: string): [number, number, number] {
  const value = parseInt(hex.replace('#', ''), 16)
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255]
}

/**
 * 텍스처를 RGB 바이트 배열로 그린다(길이 size × size × 3).
 * PNG로 굽든 캔버스에 올리든 이 결과를 쓴다.
 */
export function renderGridPaper(
  params: GridPaperParams,
  { size, supersample }: GridPaperRenderOptions,
): Uint8ClampedArray {
  const { cells, lineWidthRatio, lineSoftness, wobbleRatio } = params
  const { lineOpacityMax, opacityVariance, pressureVariance, grainStrength } = params

  const paperColor = toRgb(params.paperColor)
  const lineColor = toRgb(params.lineColor)

  // 아래 픽셀 값은 전부 렌더 해상도(수퍼샘플 적용) 기준이다.
  const cellPx = (size / cells) * supersample
  const tilePx = cellPx * cells
  const lineWidth = cellPx * lineWidthRatio
  const wobbleAmplitude = cellPx * wobbleRatio

  const wobbleFrequencies = toTileCycles(params.wobbleCyclesPerCell, cells)
  const opacityFrequencies = toTileCycles(OPACITY_CYCLES_PER_CELL, cells)
  const pressureFrequencies = toTileCycles(PRESSURE_CYCLES_PER_CELL, cells)

  /** 선을 따라가며 좌우로 미는 흔들림. 완만한 굽이에 잔떨림을 얹어 울퉁불퉁하게 만든다. */
  const wobble = (t: number, seed: number) =>
    waves(t, seed, wobbleFrequencies, WOBBLE_WEIGHTS) * wobbleAmplitude

  /** 선의 진하기 변화. 손이 뜨는 구간에서 흐려져 한 번에 그은 선처럼 보이게 한다. */
  const opacity = (t: number, seed: number) => {
    const wave = waves(t, seed + 1.2, opacityFrequencies, VARIANCE_WEIGHTS)
    return lineOpacityMax * (1 - opacityVariance * (0.5 - wave * 0.5))
  }

  /** 굵기 변화(필압). 흔들림과 다른 위상을 써서 굵기와 떨림이 함께 놀지 않게 한다. */
  const pressure = (t: number, seed: number) => {
    const wave = waves(t, seed + 2.4, pressureFrequencies, VARIANCE_WEIGHTS)
    return 1 + wave * pressureVariance
  }

  /** 한 축의 선들이 이 픽셀을 얼마나 덮는지(0~1). coord는 선을 가로지르는 축, along은 따라가는 축. */
  const lineCoverage = (coord: number, along: number, seedBase: number) => {
    let coverage = 0
    const t = along / tilePx

    // 이웃한 선까지만 검사하면 충분하다(선 사이 간격이 굵기보다 훨씬 크므로).
    const nearest = Math.round(coord / cellPx)
    for (let i = nearest - 1; i <= nearest + 1; i++) {
      // 선마다 다른 떨림을 주되, 타일 경계에서 감아 반대편과 같은 선이 이어지게 한다.
      const index = ((i % cells) + cells) % cells
      const seed = seedBase + index * 13.37
      const center = i * cellPx + wobble(t, seed)
      const halfWidth = (lineWidth * pressure(t, seed + 0.5)) / 2

      // 가장자리를 굵기에 비례한 폭만큼 번지게 흐린다. 최소 1픽셀은 확보해 계단을 막는다.
      const fade = Math.max(0.5, halfWidth * lineSoftness)
      const distance = Math.abs(coord - center)
      const alpha = 1 - smoothstep(halfWidth - fade, halfWidth + fade, distance)
      coverage = Math.max(coverage, alpha * opacity(t, seed + 1.5))
    }

    return coverage
  }

  const hi = size * supersample
  const grainScale = GRAIN_PERIOD / size
  const samples = supersample * supersample
  const accumulator = new Float64Array(size * size * 3)

  for (let y = 0; y < hi; y++) {
    for (let x = 0; x < hi; x++) {
      // 종이 결 — 두 겹의 주기 노이즈로 미세한 얼룩을 만든다.
      const grain =
        (periodicNoise(x * grainScale, y * grainScale, GRAIN_PERIOD, 1) - 0.5) * 0.6 +
        (periodicNoise(x * grainScale * 4, y * grainScale * 4, GRAIN_PERIOD * 4, 2) - 0.5) * 0.4
      const shade = 1 + grain * grainStrength

      // 세로선과 가로선. 서로 다른 seed를 줘 떨림이 같은 모양으로 겹치지 않게 한다.
      const lines = Math.max(lineCoverage(x, y, 3), lineCoverage(y, x, 17))

      // 크게 그린 픽셀들을 결과 해상도 한 픽셀로 평균 낸다.
      const index = (Math.floor(y / supersample) * size + Math.floor(x / supersample)) * 3
      for (let i = 0; i < 3; i++) {
        accumulator[index + i] += mix(paperColor[i] * shade, lineColor[i], lines) / samples
      }
    }
  }

  return Uint8ClampedArray.from(accumulator, (value) => Math.round(value))
}
