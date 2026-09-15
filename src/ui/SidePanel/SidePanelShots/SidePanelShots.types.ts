import type { ListShotTarget } from '../../../scene/ListBaker/ListBaker.types'

export interface SidePanelShotsProps {
  /** 그림을 누르면 그 화면으로 데려간다. 어디에 있는지는 패널이 알므로 판단은 그쪽이 한다. */
  onJump: (target: ListShotTarget) => void
}
