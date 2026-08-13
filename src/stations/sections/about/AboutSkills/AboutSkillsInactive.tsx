import { useMemo } from 'react'
import { Line } from '@react-three/drei'
import { ClickMarker } from '../../../../scene/ClickMarker'
import { CLICK_MARKER_MOTION } from '../../../../scene/ClickMarker/ClickMarker.constants'
import { useAfterStation } from '../../../../scene/useAfterStation'
import { usePointerCursor } from '../../../../scene/usePointerCursor'
import { useSkillsPageStore } from '../../../../state/useSkillsPageStore'
import { useStationStore } from '../../../../state/useStationStore'
import type { StationInactiveProps } from '../../../registry'
import { INK, SKILLS_CENTER } from './AboutSkills.constants'
import { SkillsBox } from './SkillsBox'

/** 바닥과 겹쳐 깜빡이지 않도록 살짝 띄운다. 클릭 판정 면 < 테두리 순으로 얹는다. */
const AREA_Y = 0.005
const OUTLINE_Y = 0.01

/**
 * `about-skills` 비활성 상태 — 종이 위 Skills 영역.
 *
 * 이 영역이 곧 클릭 판정 범위다. 안쪽 어디를 눌러도 활성화된다.
 * 종이 위에는 공구함 그림이 오려 붙인 스티커로 놓이고, 범위 테두리는 개발용 HUD에서 켤 때만 그린다.
 * 스킬 목록은 인터랙션 UI 단계(8-2)에서 채운다.
 *
 * 마운트 자리는 배치 좌표(SKILLS_CENTER)이지만, 영역 위치는 store의 좌상단+크기로 정해지므로
 * 그 차이만큼 그룹을 옮겨 실제 영역에 놓는다(HUD로 좌표를 바꾸면 영역·근접·클릭이 함께 따라온다).
 */
export function AboutSkillsInactive({ station }: StationInactiveProps) {
  const area = useSkillsPageStore((s) => s.area)
  const topLeft = useSkillsPageStore((s) => s.topLeft)
  const box = useSkillsPageStore((s) => s.box)
  const showOutline = useSkillsPageStore((s) => s.showOutline)
  const phase = useStationStore((s) => s.phase)
  // 누를 수 있는 동안에만 손가락 커서를 붙인다. 열려 있는 동안에는 페이지를 읽는 화면이다.
  const cursor = usePointerCursor(phase === 'idle')
  // 한 번 열어본 뒤에는 누를 수 있다는 것을 이미 아니까 표시를 다시 내지 않는다.
  const visited = useAfterStation(station.id)

  const { width, height } = area
  const halfWidth = width / 2
  const halfHeight = height / 2

  // 영역 중심(월드) = 좌상단 + 반크기. 마운트 자리(배치 좌표 = SKILLS_CENTER)와의 차이만큼 안에서 옮긴다.
  const offsetX = topLeft.x + halfWidth - SKILLS_CENTER[0]
  const offsetZ = topLeft.z + halfHeight - SKILLS_CENTER[1]

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
      {/* 클릭 판정 면. 포인터 핸들러는 커서뿐이라 우클릭 이동은 바닥으로 통과하고, 좌클릭 활성화만 Stations가 잡는다. */}
      <mesh
        position={[0, AREA_Y, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        userData={{ stationId: station.id }}
        {...cursor}
      >
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* 종이에서 오려 붙인 공구함 그림. 활성화되면 스스로 로고 자리로 물러난다. */}
      <SkillsBox stationId={station.id} />

      {/* 공구함 위에 뜨는 클릭 표시. 자리는 공구함을 따라가므로 그림을 옮기면 함께 따라온다.
          열려 있는 동안에는 누를 곳이 아니므로 걷힌다. */}
      <group position={[box.x, 0, box.z]}>
        <ClickMarker
          visible={!visited && phase === 'idle'}
          y={CLICK_MARKER_MOTION.y}
          size={CLICK_MARKER_MOTION.size}
          bob={CLICK_MARKER_MOTION.bob}
          bobSeconds={CLICK_MARKER_MOTION.bobSeconds}
          spinSeconds={CLICK_MARKER_MOTION.spinSeconds}
          fadeSeconds={CLICK_MARKER_MOTION.fadeSeconds}
        />
      </group>

      {/* 영역 테두리 — 범위 확인용. 내용을 채우는 8-2에서 표시 방식을 다시 정한다. */}
      {showOutline && <Line points={outline} color={INK} lineWidth={2} raycast={() => null} />}
    </group>
  )
}
