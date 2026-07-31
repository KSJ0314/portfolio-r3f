import { useEffect } from 'react'
import { type Station as StationData } from '../../content/stations'
import { getStationEntry } from '../../stations'
import { useSceneReadyStore } from '../../state/useSceneReadyStore'

/**
 * 스테이션 한 개를 자기 위치에 놓는다.
 *
 * 비활성 상태의 모습은 레지스트리에 등록된 스테이션별 구현이 그린다.
 * 아직 등록되지 않은 스테이션은 **아무것도 그리지 않는다** — 종이 위에 놓을 그림이 정해지기 전이다.
 * 좌클릭 활성화는 Stations가 레이캐스트로 판정하고, 그 대상(id를 실은 면)은 구현이 둔다.
 */
export function Station({ data }: { data: StationData }) {
  const [x, z] = data.position
  const Inactive = getStationEntry(data.id)?.Inactive

  // 경계가 스테이션마다 있으므로 여기까지 왔으면 이 스테이션의 텍스처는 다 준비된 것이다.
  // 첫 화면 가림막이 어느 스테이션을 기다릴지 정하므로, 공통층은 자기 id만 알린다.
  const markReady = useSceneReadyStore((s) => s.markReady)
  useEffect(() => {
    markReady(`station:${data.id}`)
  }, [markReady, data.id])

  return <group position={[x, 0, z]}>{Inactive && <Inactive station={data} />}</group>
}
