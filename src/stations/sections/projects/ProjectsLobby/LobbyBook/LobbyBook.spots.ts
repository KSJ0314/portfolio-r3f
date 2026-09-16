import type { LobbyBookSpot } from './LobbyBook.types'

/**
 * 오른쪽 페이지에서 항목마다 글이 놓인 세로 구간.
 *
 * 그리는 쪽이 넣고 누르는 쪽이 꺼낸다. 스토어가 아니라 모듈 변수인 것은 **누르는 순간에만
 * 보기 때문**이다. 값이 바뀐다고 다시 그릴 것이 없어 구독할 이유가 없다.
 */
let spots: readonly LobbyBookSpot[] = []

/** 페이지를 다시 그릴 때마다 넣는다. 줄 수가 달라지면 자리도 달라진다. */
export function setBookSpots(next: readonly LobbyBookSpot[]): void {
  spots = next
}

/** 누른 지점(텍스처 세로 비율 0~1)에 놓인 항목. 글이 없는 자리면 없다. */
export function findBookSpot(v: number): LobbyBookSpot | null {
  return spots.find((spot) => v >= spot.top && v <= spot.bottom) ?? null
}
