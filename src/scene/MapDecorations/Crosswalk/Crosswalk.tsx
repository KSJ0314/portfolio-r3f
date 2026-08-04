import { useCallback, useEffect, useRef, useState } from 'react'
import { MathUtils } from 'three'
import { Crayon } from '../../../lib/Crayon'
import { useCameraStore } from '../../../state/useCameraStore'
import { useMapDecorationsStore } from '../../../state/useMapDecorationsStore'
import { type StationPhase, useStationStore } from '../../../state/useStationStore'
import { moveToStand, walkToStand } from '../../../stations/registry'
import { useAfterStation } from '../MapDecorations.hooks'
import {
  CROSSWALK,
  CROSSWALK_AFTER_STATION,
  CROSSWALK_STROKES,
  CROSSWALK_Y,
} from './Crosswalk.constants'

/**
 * 종이 위에 놓이는 횡단보도 — career 쪽으로 건너가라고 알리는 길목이다.
 *
 * **Skills를 한 번 열었다 닫은 뒤**에 크레파스로 긋듯 그어진다. 한 번 나온 뒤에는 계속 종이에 남는다.
 *
 * 순서는 **카메라 복귀와 캐릭터 되돌아오기를 함께 → 도착하면 긋기**다.
 * 닫는 방법이 근접 이탈이기도 해서, 닫히는 시점에 캐릭터는 이미 멀리 걸어가 있을 수 있다.
 * 그 자리에서 바로 그으면 그리는 것이 화면 밖이라 보이지도 않는데 이동만 막힌다.
 * 걷는 시간은 거리에 따라 달라지므로 지연(delay)이 아니라 **도착 신호**를 보고 넘어간다.
 *
 * 그어지는 동안에는 이동을 잠근다 — 보라고 만든 연출이라 그 사이 걸어 나가면 놓친다.
 */
export function Crosswalk() {
  const { scale, x, z, rotation, seconds } = useMapDecorationsStore((s) => s.crosswalk)
  const redraw = useMapDecorationsStore((s) => s.crosswalkRedraw)
  const markDrawn = useMapDecorationsStore((s) => s.markCrosswalkDrawn)
  const returned = useAfterStation(CROSSWALK_AFTER_STATION)
  const [drawing, setDrawing] = useState(false)

  const started = useRef(false)
  const locked = useRef(false)
  const cleanup = useRef<() => void>(() => {})

  // 잠금은 거는 것과 푸는 것을 짝지어 둔다. 정리 함수를 나중에 붙이면 그 사이에 언마운트될 때 남는다.
  const acquireLock = useCallback(() => {
    if (locked.current) return
    locked.current = true
    useCameraStore.getState().lockMovement()
  }, [])

  const releaseLock = useCallback(() => {
    if (!locked.current) return
    locked.current = false
    useCameraStore.getState().unlockMovement()
  }, [])

  // 언마운트될 때 잠금이 남지 않게 한다 — 풀 기회를 놓치면 이동이 영영 막힌다.
  // 여기서는 잠금만 푼다. 중단된 것을 "다 그었다"고 알리면 신호등이 먼저 서 버린다.
  useEffect(
    () => () => {
      cleanup.current()
      releaseLock()
    },
    [releaseLock],
  )

  // 닫히기 시작하는 순간 잠그고 자리로 되돌아 걷게 해, 카메라 복귀와 같이 진행되게 한다.
  //
  // 잠금이 여기서부터 걸려야 한다 — 영역 밖으로 걸어 나가 닫히는 경우에는 우클릭을 누른 채이고,
  // 그러면 매 프레임 목표점이 커서로 덮어써져 되돌려 보낸 자리가 곧바로 지워진다.
  // 다만 연출 이동으로 보내지는 않는다 — 그러면 팔로우가 되살아나 복귀 트윈과 부딪힌다.
  useEffect(() => {
    const check = (s: { activeId: string | null; phase: StationPhase }) => {
      if (locked.current || s.activeId !== CROSSWALK_AFTER_STATION || s.phase !== 'exiting') return
      if (!moveToStand(CROSSWALK_AFTER_STATION)) return
      acquireLock()
    }

    const unsubscribe = useStationStore.subscribe(check)
    // 구독은 다음 변화부터 알리므로 지금 상태를 한 번 본다.
    check(useStationStore.getState())
    return unsubscribe
  }, [acquireLock])

  useEffect(() => {
    if (!returned || started.current) return
    started.current = true

    // 닫히는 순간을 놓쳤으면 여기서 잠근다.
    acquireLock()

    // 자리를 등록하지 않은 스테이션은 데려올 곳이 없으니 기다리지 않고 곧장 긋는다.
    if (!walkToStand(CROSSWALK_AFTER_STATION)) {
      const timer = window.setTimeout(() => setDrawing(true), 0)
      cleanup.current = () => window.clearTimeout(timer)
      return
    }

    let unsubscribe = () => {}
    unsubscribe = useCameraStore.subscribe((s) => {
      // 자리에 닿으면 Character가 walking을 끈다. 이펙트 몸통이 아니라 구독 콜백이라 여기서 상태를 바꾼다.
      if (s.walking) return
      unsubscribe()
      setDrawing(true)
    })
    cleanup.current = unsubscribe
  }, [returned, acquireLock])

  // 다 그으면 잠금을 풀고 차례를 넘긴다. 다시 그리기(HUD)로 연출이 재생되면 그 신호도 다시 낸다.
  useEffect(() => {
    if (!drawing) return
    const timer = window.setTimeout(() => {
      releaseLock()
      markDrawn()
    }, seconds * 1000)
    return () => window.clearTimeout(timer)
  }, [drawing, redraw, seconds, releaseLock, markDrawn])

  if (!drawing) return null

  const width = CROSSWALK.size * scale
  const height = CROSSWALK.height * scale

  return (
    <group position={[x, CROSSWALK_Y, z]} rotation={[0, MathUtils.degToRad(rotation), 0]}>
      <Crayon
        // 다시 그리기(HUD)는 새로 마운트해 연출을 처음부터 재생한다.
        key={redraw}
        drawing={CROSSWALK_STROKES}
        // 판 중심을 상단 중앙에서 세로 반크기만큼 밀어 그 점이 좌표에 오게 한다.
        // 눕히면 로컬 +y가 월드 -z라, 아래로 미는 값이 +z다.
        position={[0, 0, height / 2]}
        rotation={[-Math.PI / 2, 0, 0]}
        size={width}
        height={height}
        strokeWidth={CROSSWALK.strokeWidth * scale}
        color={CROSSWALK.color}
        roughness={CROSSWALK.roughness}
        opacity={CROSSWALK.opacity}
        patchiness={CROSSWALK.patchiness}
        wobbleRatio={CROSSWALK.wobbleRatio}
        edge={CROSSWALK.edge}
        // 그린 그대로를 고정한다 — 스튜디오에서 뽑은 값(Crayon 기본값이 바뀌어도 유지).
        margin={1}
        reveal={seconds}
        // 바닥 장식일 뿐이라 클릭·이동 판정에서 뺀다.
        raycast={() => null}
      />
    </group>
  )
}
