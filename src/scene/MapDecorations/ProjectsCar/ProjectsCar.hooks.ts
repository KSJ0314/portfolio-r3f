import { useCallback, useEffect, useRef } from 'react'
import { Vector3 } from 'three'
import { turnCharacterTo } from '../../CharacterModel'
import { useCameraStore } from '../../../state/useCameraStore'
import { useMapDecorationsStore } from '../../../state/useMapDecorationsStore'
import { type StationPhase, useStationStore } from '../../../state/useStationStore'
import { PROJECTS_CAR_AFTER_STATION } from './ProjectsCar.constants'

const _point = new Vector3()

/** 캐릭터가 설 차 앞자리. 배치를 HUD로 옮기면 따라오도록 부를 때마다 스토어에서 구한다. */
function boardPoint(): Vector3 {
  const { startX, startZ, boardX, boardZ } = useMapDecorationsStore.getState().car
  return _point.set(startX + boardX, 0, startZ + boardZ)
}

/**
 * 스테이션을 닫으면 캐릭터를 **차 앞자리로** 데려온다.
 *
 * 닫는 방법이 근접 이탈이기도 해서, 닫히는 시점에 캐릭터는 이미 멀리 걸어가 있을 수 있다.
 * 그대로 두면 차가 화면 밖에서 나타나 보이지도 않는다.
 *
 * **닫히기 시작하면 카메라 복귀와 함께** 걸어오기 시작한다. 다만 그 구간에서는 카메라를 아직
 * 스테이션이 쥐고 있어 연출 이동으로 보내면 팔로우가 되살아나 복귀 트윈과 부딪힌다.
 * 그래서 그때는 평소 이동으로 보내고, 카메라를 돌려받은 뒤에 연출 이동으로 바꿔 도착을 신호로 받는다.
 *
 * 걸어오는 동안에는 이동을 잠근다 — 영역 밖으로 걸어 나가 닫는 경우엔 우클릭을 누른 채라,
 * 잠그지 않으면 보낸 목표점이 매 프레임 커서로 덮어써진다.
 *
 * **이미 데려온 뒤인지는 스토어(`carReturned`)에 둔다.** 로비를 다녀오면 맵이 다시 마운트돼
 * 컴포넌트에 든 기록이 사라지는데, 등장 조건은 스토어에 남아 곧바로 참이라 다시 걸어가게 된다.
 */
export function useReturnOnClose(returned: boolean): void {
  const sent = useRef(false)
  const started = useRef(false)
  const locked = useRef(false)
  const unsubscribe = useRef<() => void>(() => {})

  // 잠금은 거는 것과 푸는 것을 짝지어 둔다. 풀 기회를 놓치면 이동이 영영 막힌다.
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

  useEffect(
    () => () => {
      unsubscribe.current()
      releaseLock()
    },
    [releaseLock],
  )

  // 처음 닫을 때 한 번만 돈다. 잠금 여부로 막으면 첫 시퀀스가 끝나 잠금이 풀린 뒤
  // 두 번째 종료에서 다시 잠기는데, 그때는 풀어 줄 쪽이 없어 이동이 영영 막힌다.
  useEffect(() => {
    const check = (state: { activeId: string | null; phase: StationPhase }) => {
      if (sent.current || useMapDecorationsStore.getState().carReturned) return
      if (state.activeId !== PROJECTS_CAR_AFTER_STATION || state.phase !== 'exiting') return
      sent.current = true
      useCameraStore.getState().setTarget(boardPoint())
      acquireLock()
    }

    const unsub = useStationStore.subscribe(check)
    // 구독은 다음 변화부터 알리므로 지금 상태를 한 번 본다.
    check(useStationStore.getState())
    return unsub
  }, [acquireLock])

  useEffect(() => {
    if (!returned || started.current) return
    // 이미 데려온 뒤에 다시 마운트된 것(로비를 다녀옴)이면 그 자리에 그대로 둔다.
    if (useMapDecorationsStore.getState().carReturned) return
    started.current = true

    // 닫히는 순간을 놓쳤으면 여기서 잠근다.
    acquireLock()
    useCameraStore.getState().walkTo(boardPoint())

    unsubscribe.current = useCameraStore.subscribe((state) => {
      // 자리에 닿으면 Character가 walking을 끈다.
      if (state.walking) return
      unsubscribe.current()
      unsubscribe.current = () => {}
      // 차 앞에 서면 차 쪽으로 몸을 돌린다. 나타난 차를 등지고 서 있지 않게.
      const decorations = useMapDecorationsStore.getState()
      turnCharacterTo(decorations.car.startX, decorations.car.startZ)
      decorations.markCarReturned()
      releaseLock()
    })
  }, [returned, acquireLock, releaseLock])
}
