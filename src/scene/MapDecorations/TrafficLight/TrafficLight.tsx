import { MathUtils } from 'three'
import { PaperSticker } from '../../../lib/PaperSticker'
import { useCameraStore } from '../../../state/useCameraStore'
import { useMapDecorationsStore } from '../../../state/useMapDecorationsStore'
import { CROSSWALK } from '../Crosswalk/Crosswalk.constants'
import {
  TRAFFIC_LIGHT_PARAMS,
  TRAFFIC_LIGHT_SHADOW_Y,
  TRAFFIC_LIGHT_URL,
} from './TrafficLight.constants'

/**
 * 횡단보도 곁에 서 있는 신호등 — 오려낸 종이를 바닥에 눕히지 않고 세워 둔 것이다.
 *
 * **횡단보도를 다 그은 뒤**에 나타난다. 자리는 횡단보도 우상단 꼭지점 기준 상대 좌표라
 * 횡단보도를 옮기거나 키우면 따라온다.
 *
 * 세운 종이는 그 자체로는 서 있는지 누워 있는지 읽히지 않으므로 **바닥에 그림자를 따로 깐다.**
 * 판 안에 인쇄되는 그림자는 꺼 두고(`TRAFFIC_LIGHT_PARAMS`), 같은 그림을 검게 눌러 눕힌다.
 */
export function TrafficLight() {
  const { height, offsetX, offsetZ, rotation, shadowAngle, shadowLength, shadowOpacity } =
    useMapDecorationsStore((s) => s.trafficLight)
  const crosswalk = useMapDecorationsStore((s) => s.crosswalk)
  const followOffset = useCameraStore((s) => s.followOffset)
  // 횡단보도를 다 그은 뒤에 세운다 — 함께 나오면 눈이 어디를 볼지 정하지 못한다.
  // 캐릭터가 자리로 돌아오는 시간이 거리에 따라 달라져, 지연이 아니라 다 그었다는 신호를 본다.
  const revealed = useMapDecorationsStore((s) => s.crosswalkDrawn)

  if (!revealed) return null

  // 횡단보도 우상단 꼭지점. 좌표가 상단 중앙이고 가로는 기준 크기 × 배율이다.
  const cornerX = crosswalk.x + (CROSSWALK.size * crosswalk.scale) / 2
  const cornerZ = crosswalk.z

  // 카메라가 캐릭터를 바라보는 방향의 반대가 판이 향할 방향이다.
  // 판의 기본 법선이 +z이므로, 그 방향으로 돌리면 화면을 정면으로 본다.
  const facing = Math.atan2(followOffset.x, followOffset.z) + MathUtils.degToRad(rotation)

  return (
    <group position={[cornerX + offsetX, 0, cornerZ + offsetZ]} rotation={[0, facing, 0]}>
      {/* 세운 종이. 그림 밑변이 바닥에 닿도록 그림 높이의 절반만큼 올린다. */}
      <PaperSticker
        url={TRAFFIC_LIGHT_URL}
        height={height}
        params={TRAFFIC_LIGHT_PARAMS}
        position={[0, height / 2, 0]}
        // 장식일 뿐이라 클릭·이동 판정에서 뺀다.
        raycast={() => null}
      />

      {/* 바닥 그림자. 같은 그림을 검게 눌러 눕히고, 밑동에서 뒤로 뻗어 나가게 둔다.
          세운 종이와 굽는 입력이 같아 캐시에 적중하므로 텍스처를 다시 굽지 않는다. */}
      <group rotation={[0, MathUtils.degToRad(shadowAngle), 0]}>
        <PaperSticker
          url={TRAFFIC_LIGHT_URL}
          height={height}
          params={TRAFFIC_LIGHT_PARAMS}
          position={[0, TRAFFIC_LIGHT_SHADOW_Y, -(height * shadowLength) / 2]}
          rotation={[-Math.PI / 2, 0, 0]}
          // 눕힌 판을 세로로만 눌러 길이를 조절한다.
          scale={[1, shadowLength, 1]}
          color="#000000"
          opacity={shadowOpacity}
          // 바닥에 겹쳐 깔리는 것이라 깊이 버퍼를 건드리지 않는다.
          depthWrite={false}
          raycast={() => null}
        />
      </group>
    </group>
  )
}
