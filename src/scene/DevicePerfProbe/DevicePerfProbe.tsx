import { useEffect, useRef } from 'react'
import { createLogger } from '../../lib/logger'
import { useDevicePerfStore } from '../../state/useDevicePerfStore'
import { useSceneReadyStore } from '../../state/useSceneReadyStore'
import { REQUIRED_KEYS } from '../../ui/SceneGate/SceneGate.constants'
import { BENCH_GRAINS, STRAINED_MS } from './DevicePerfProbe.constants'
import { measureDevicePerf } from './DevicePerfProbe.measure'

const log = createLogger('perf:device')

/**
 * 기기 성능을 재 등급을 정한다(그리는 것 없음).
 *
 * 크레파스처럼 굽는 것이 무거운 연출을 켤지 말지를 이 등급으로 가른다.
 * 재는 방법은 `DevicePerfProbe.measure`에 있다.
 *
 * **첫 화면이 다 뜬 뒤에 잰다.** 그 전에는 텍스처를 굽고 모델을 받느라 바빠 재는 일까지
 * 얹으면 첫 화면이 더 늦어진다. 재는 동안 한 프레임이 걸릴 수 있지만 한 번뿐이고,
 * 그 대가로 뒤에 나올 무거운 연출을 통째로 걷어낸다.
 */
export function DevicePerfProbe() {
  const ready = useSceneReadyStore((s) => REQUIRED_KEYS.every((key) => s.ready[key]))
  const done = useRef(false)

  useEffect(() => {
    if (!ready || done.current) return
    done.current = true
    const { tier, elapsed } = measureDevicePerf()
    log('%s — 알갱이 %d개에 %sms (기준 %dms)', tier, BENCH_GRAINS, elapsed.toFixed(1), STRAINED_MS)
    useDevicePerfStore.getState().setTier(tier)
  }, [ready])

  return null
}
