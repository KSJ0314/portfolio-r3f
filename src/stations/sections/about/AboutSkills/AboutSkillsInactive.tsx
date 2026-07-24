import { useMemo } from 'react'
import { Line } from '@react-three/drei'
import { useSkillsPageStore } from '../../../../state/useSkillsPageStore'
import type { StationInactiveProps } from '../../../registry'

/** 바닥과 겹쳐 깜빡이지 않도록 살짝 띄운다. 클릭 판정 면 < 테두리 순으로 얹는다. */
const AREA_Y = 0.005
const OUTLINE_Y = 0.01

/** 종이에 적힌 선 색(AboutIntro와 같은 잉크색). */
const INK = '#3a3a3a'

/**
 * `about-skills` 비활성 상태 — 종이 위 Skills 영역.
 *
 * 이 영역이 곧 클릭 판정 범위다. 안쪽 어디를 눌러도 활성화된다.
 * 범위 테두리는 개발용 HUD에서 켤 때만 그린다 — 실제 내용(스킬 목록)은 인터랙션 UI 단계(8-2)에서 채운다.
 *
 * 마운트 자리는 station.position(배치 좌표)이지만, 영역 위치는 store의 좌상단+크기로 정해지므로
 * 그 차이만큼 그룹을 옮겨 실제 영역에 놓는다(HUD로 좌표를 바꾸면 영역·근접·클릭이 함께 따라온다).
 */
export function AboutSkillsInactive({ station }: StationInactiveProps) {
  const area = useSkillsPageStore((s) => s.area)
  const topLeft = useSkillsPageStore((s) => s.topLeft)
  const showOutline = useSkillsPageStore((s) => s.showOutline)

  const { width, height } = area
  const halfWidth = width / 2
  const halfHeight = height / 2

  // 영역 중심(월드) = 좌상단 + 반크기. 마운트 자리(station.position)와의 차이만큼 안에서 옮긴다.
  const offsetX = topLeft.x + halfWidth - station.position[0]
  const offsetZ = topLeft.z + halfHeight - station.position[1]

  const outline = useMemo<[number, number, number][]>(() => {
    // 닫힌 사각형이라 첫 점으로 돌아온다.
    return [
      [-halfWidth, OUTLINE_Y, -halfHeight],
      [halfWidth, OUTLINE_Y, -halfHeight],
      [halfWidth, OUTLINE_Y, halfHeight],
      [-halfWidth, OUTLINE_Y, halfHeight],
      [-halfWidth, OUTLINE_Y, -halfHeight],
    ]
  }, [halfWidth, halfHeight])

  return (
    <group position={[offsetX, 0, offsetZ]}>
      {/* 클릭 판정 면. 포인터 핸들러가 없어 우클릭 이동은 바닥으로 통과하고, 좌클릭 활성화만 Stations가 잡는다. */}
      <mesh
        position={[0, AREA_Y, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        userData={{ stationId: station.id }}
      >
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* 영역 테두리 — 범위 확인용. 내용을 채우는 8-2에서 표시 방식을 다시 정한다. */}
      {showOutline && <Line points={outline} color={INK} lineWidth={2} raycast={() => null} />}
    </group>
  )
}
