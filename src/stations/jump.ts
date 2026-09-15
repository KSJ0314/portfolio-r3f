import { create } from 'zustand'
import { createLogger } from '../lib/logger'
import type { ListShotTarget } from '../scene/ListBaker/ListBaker.types'
import { useCareerSequenceStore } from '../state/useCareerSequenceStore'
import { useSkillsSequenceStore } from '../state/useSkillsSequenceStore'
import { useSkillsViewStore } from '../state/useSkillsViewStore'
import { useStationStore } from '../state/useStationStore'
import { getStation } from '../content/stations'
import { teleportToStand } from './registry'

const log = createLogger('station:jump')

/**
 * 구운 화면을 눌러 그 자리로 바로 가는 일.
 *
 * 맵 안의 스테이션은 **연출 없이** 연다 — 캐릭터를 그 자리로 옮기고 곧바로 활성으로 둔다.
 * 스테이션 구현들은 마운트 시점에 이미 활성이면 카메라를 최종 자세로 바로 적용하므로
 * (첫 화면 Intro가 그 경로를 쓴다) 걷기·회전이 재생되지 않는다.
 *
 * 전시 칸은 라우트가 갈리고 도착한 쪽이 이동·확대 상태를 처음으로 되돌리므로, 목적지를 남겨 두고
 * 도착한 쪽이 꺼내 쓴다 — 로비가 돌아올 자리를 남기는 것(`ProjectsLobby.travel`)과 같은 방식이다.
 */

/**
 * 마지막 닫힘이 바로 가기였는지.
 *
 * 맵 장식(횡단보도·자동차)은 앞 스테이션이 닫히면 캐릭터를 제 앞으로 불러 그어지는 것을 보여준다.
 * 바로 가기는 이미 가려던 자리에 데려다 놓은 뒤라, 그대로 두면 방문자가 누른 화면에서 끌려 나온다.
 * **건너뛰는 것은 부르는 이동뿐이고** 장식이 나타나고 그어지는 것은 그대로다.
 */
let jumped = false

/** 바로 가기로 캐릭터를 옮겼는지. 장식이 부르는 이동을 건너뛸지 판단할 때 본다. */
export function didJumpToStation(): boolean {
  return jumped
}

// 평소처럼 눌러서 열면 표시를 내린다. 진입 애니메이션이 도는 것은 그 길뿐이라 이것으로 가른다.
// 그 뒤의 닫힘은 바로 가기가 아니므로 장식이 평소대로 캐릭터를 부른다.
useStationStore.subscribe((state) => {
  if (state.phase === 'entering') jumped = false
})

interface PendingJumpState {
  /** 다음 장면이 꺼내 갈 목적지. 한 번 쓰고 비운다. */
  pending: ListShotTarget | null
  set: (target: ListShotTarget) => void
  clear: () => void
}

/**
 * 남겨 둔 목적지.
 *
 * 모듈 변수가 아니라 스토어인 것은 **이미 그 장면에 있을 때도 받아야 하기 때문**이다.
 * 전시 공간에서 다른 칸을 누르면 라우트가 갈리지 않으므로, 값이 바뀌는 것을 보고 열어야 한다.
 */
const usePendingJumpStore = create<PendingJumpState>((set) => ({
  pending: null,
  set: (target) => set({ pending: target }),
  clear: () => set({ pending: null }),
}))

/** 넘어가기 전에 목적지를 남긴다. 옮기는 것은 부르는 쪽이 덮개에게 시킨다. */
export function setPendingJump(target: ListShotTarget): void {
  usePendingJumpStore.getState().set(target)
}

/** 지금 남겨진 목적지. 꺼내 가는 쪽이 구독해 값이 바뀌는 것을 본다. */
export function usePendingJump(): ListShotTarget | null {
  return usePendingJumpStore((s) => s.pending)
}

/** 맵이 뜰 때 꺼내 간다. 스테이션 대상이 아니면 그대로 둔다 — 전시 공간이 가져갈 몫이다. */
export function takePendingStationJump(): ListShotTarget | null {
  const { pending, clear } = usePendingJumpStore.getState()
  if (pending?.kind !== 'station') return null
  clear()
  return pending
}

/** 전시 공간이 액자를 다 측정한 뒤 꺼내 간다. */
export function takePendingProjectJump(): ListShotTarget | null {
  const { pending, clear } = usePendingJumpStore.getState()
  if (pending?.kind !== 'project') return null
  clear()
  return pending
}

/**
 * 스테이션을 연출 없이 연다.
 *
 * 자리로 순간이동한 뒤 열어야 닫았을 때 카메라가 엉뚱한 곳으로 돌아가지 않는다 —
 * 항공뷰 복귀 자세는 캐릭터 자리에서 나온다.
 * 이미 열려 있던 것이 있으면 먼저 지운다. `activate`는 `idle`에서만 받는다.
 */
export function openStationAt(target: ListShotTarget): void {
  if (target.kind !== 'station') return

  const station = getStation(target.id)
  if (station) teleportToStand(station)

  // 기술 스택은 쪽이 있다. 여는 쪽이 정해 두면 목록이 그 쪽으로 뜬다.
  if (target.page === undefined) useSkillsViewStore.getState().reset()
  else useSkillsViewStore.getState().setPage(target.page)

  // 앞서 열려 있던 스테이션의 그림을 제자리로 돌려놓는다.
  // 곧바로 닫으면 종료 분기가 돌지 않아 그림을 물린 신호를 내릴 주체가 없고, 맵은 그대로 떠 있어
  // 다시 마운트되며 되돌아오지도 않는다. 옮겨 가는 길이라 트윈 없이 제자리에 앉힌다.
  useSkillsSequenceStore.getState().setLogoTurn(false, true)
  useCareerSequenceStore.getState().setLogoTurn(false, true)

  jumped = true
  log('%s 열기 — 연출 없이 바로', target.id)
  const store = useStationStore.getState()
  store.closeImmediately()
  store.openImmediately(target.id)
}
