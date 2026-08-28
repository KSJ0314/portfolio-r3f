import type { DevicePerfTier } from '../../state/useDevicePerfStore'
import { BENCH_CANVAS, BENCH_GRAINS, STRAINED_MS } from './DevicePerfProbe.constants'

/** 한 번 재고 얻은 값. */
export interface DevicePerfMeasurement {
  tier: DevicePerfTier
  /** 정해진 양을 그리는 데 걸린 시간(ms). 이 값이 등급을 가른다. */
  elapsed: number
}

/**
 * 이 기기가 크레파스 알갱이를 얼마나 빨리 찍는지 잰다.
 *
 * **프레임 간격이 아니라 정해진 양의 일에 걸린 시간**을 본다. 프레임 간격은 화면 주사율에
 * 묶여 있어, 빠른 기기든 그 주사율을 겨우 내는 기기든 똑같은 값이 나와 성능을 가릴 수 없다.
 * 정해진 양을 시키면 빠른 기기는 짧게, 느린 기기는 길게 걸려 그대로 성능이 된다.
 *
 * 시키는 일은 크레파스가 실제로 하는 것과 같다 — 캔버스에 작은 사각형을 흩뿌리는 것이다.
 * 다만 그림이 아니라 빈 캔버스에 알갱이만 찍으므로 결과는 쓰지 않고 버린다.
 */
export function measureDevicePerf(): DevicePerfMeasurement {
  const canvas = document.createElement('canvas')
  canvas.width = BENCH_CANVAS
  canvas.height = BENCH_CANVAS
  const ctx = canvas.getContext('2d')
  // 캔버스를 못 만드는 환경이라면 판단할 근거가 없다. 지금 동작을 유지하는 쪽으로 둔다.
  if (!ctx) return { tier: 'smooth', elapsed: 0 }

  ctx.fillStyle = '#000000'

  const start = performance.now()
  // 좌표·알파를 함께 굴려야 실제로 그릴 때와 하는 일이 같다. 난수 대신 값을 굴리는 것은
  // 난수 생성 비용이 그리기 비용을 가리지 않게 하기 위함이다.
  let x = 0
  let y = 0
  for (let i = 0; i < BENCH_GRAINS; i += 1) {
    x = (x + 7.3) % BENCH_CANVAS
    y = (y + 3.1) % BENCH_CANVAS
    ctx.globalAlpha = 0.35 + 0.65 * ((i % 16) / 16)
    ctx.fillRect(x, y, 1.4, 1.4)
  }
  const elapsed = performance.now() - start

  return { tier: elapsed > STRAINED_MS ? 'strained' : 'smooth', elapsed }
}
