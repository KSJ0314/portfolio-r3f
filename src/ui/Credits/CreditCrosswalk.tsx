import { MathUtils } from 'three'
import { Crayon } from '../../lib/Crayon'
import { PaperSticker } from '../../lib/PaperSticker'
import {
  CROSSWALK,
  CROSSWALK_PLACEMENT,
  CROSSWALK_STROKES,
} from '../../scene/MapDecorations/Crosswalk/Crosswalk.constants'
import {
  TRAFFIC_LIGHT_PARAMS,
  TRAFFIC_LIGHT_PLACEMENT,
  TRAFFIC_LIGHT_URL,
} from '../../scene/MapDecorations/TrafficLight/TrafficLight.constants'

/**
 * 미리보기에 띄우는 횡단보도와 신호등.
 *
 * 맵에 놓인 그대로 — 바닥에 누운 횡단보도와 그 우상단 꼭지점 곁에 선 신호등이다.
 * 크기는 맵의 배치 배율로 나눠 **횡단보도 기준 크기 안에서의 비율**로 되돌린다.
 * 그래야 HUD로 맵 쪽 배율을 바꿔도 미리보기의 두 크기 관계가 그대로 유지된다.
 */
export function CreditCrosswalk() {
  const { size, height } = CROSSWALK
  // 신호등 세로는 맵에서 월드 크기로 잡혀 있다. 횡단보도 배율로 나눠 같은 기준에 올린다.
  const lightHeight = TRAFFIC_LIGHT_PLACEMENT.height / CROSSWALK_PLACEMENT.scale
  // 우상단 꼭지점에서 떨어진 거리도 같은 기준으로 되돌린다.
  const lightX = size / 2 + TRAFFIC_LIGHT_PLACEMENT.offsetX / CROSSWALK_PLACEMENT.scale
  const lightZ = -height / 2 + TRAFFIC_LIGHT_PLACEMENT.offsetZ / CROSSWALK_PLACEMENT.scale

  // 모델과 같이 가장 긴 변을 1로 맞춘다. 누운 횡단보도의 세로가 가장 길다.
  return (
    <group scale={1 / height}>
      <Crayon
        drawing={CROSSWALK_STROKES}
        size={size}
        height={height}
        strokeWidth={CROSSWALK.strokeWidth}
        color={CROSSWALK.color}
        roughness={CROSSWALK.roughness}
        opacity={CROSSWALK.opacity}
        patchiness={CROSSWALK.patchiness}
        wobbleRatio={CROSSWALK.wobbleRatio}
        edge={CROSSWALK.edge}
        rotation={[-Math.PI / 2, 0, 0]}
        // 맵과 같이 판을 그림에 꼭 맞춘다. 기본값을 쓰면 판이 그림보다 커져
        // 그 판으로 잡은 모서리가 실제 그림 모서리와 어긋나고, 신호등 자리가 밀린다.
        margin={1.1}
      />

      {/* 세워 둔 종이. 판 가운데가 원점이므로 반만큼 올려 바닥에 발을 붙인다.
          횡단보도에 나란히 서지 않고 비스듬히 튼다 — 맵에서 쓰는 회전 보정을 그대로 쓴다.
          **깊이 버퍼에 쓰지 않는다** — 판이 그림보다 크고 그 여백은 투명한데, 깊이를 쓰면
          투명한 자리가 뒤엣것을 잘라내 바닥의 횡단보도가 판 모양대로 파인다. */}
      <PaperSticker
        url={TRAFFIC_LIGHT_URL}
        height={lightHeight}
        params={TRAFFIC_LIGHT_PARAMS}
        position={[lightX - 0.05, lightHeight / 2 - 0.05, lightZ]}
        rotation={[0, MathUtils.degToRad(TRAFFIC_LIGHT_PLACEMENT.rotation), 0]}
        depthWrite={false}
      />
    </group>
  )
}
