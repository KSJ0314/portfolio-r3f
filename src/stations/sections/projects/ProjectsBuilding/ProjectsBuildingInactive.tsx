import { useEffect, useMemo, useRef } from 'react'
import { Line, useGLTF } from '@react-three/drei'
import { Box3, type Group, MathUtils, Vector3 } from 'three'
import gsap from 'gsap'
import { ClickMarker } from '../../../../scene/ClickMarker'
import { usePointerCursor } from '../../../../scene/usePointerCursor'
import { useBlockersStore } from '../../../../state/useBlockersStore'
import { useProjectsDoorStore } from '../../../../state/useProjectsDoorStore'
import { useProjectsPageStore } from '../../../../state/useProjectsPageStore'
import { useProjectsSequenceStore } from '../../../../state/useProjectsSequenceStore'
import { useStationStore } from '../../../../state/useStationStore'
import type { StationInactiveProps } from '../../../registry'
import { DoorGlow } from './DoorGlow'
import {
  PROJECTS_BLOCKER_ID,
  PROJECTS_BUILDING_URL,
  PROJECTS_CENTER,
  PROJECTS_ID,
  PROJECTS_MARKER_MOTION,
} from './ProjectsBuilding.constants'
import { disposeDoor, splitBuildingDoor } from './ProjectsBuilding.door'

/** 테두리가 바닥과 겹쳐 깜빡이지 않도록 살짝 띄운다. */
const OUTLINE_Y = 0.01

/** 테두리 색 — 범위 확인용이라 눈에 띄기만 하면 된다. */
const OUTLINE_COLOR = '#3a3a3a'

/**
 * `projects` 비활성 상태 — 종이 위에 선 건물. 이 건물이 곧 프로젝트 구역이다.
 *
 * 다른 스테이션과 달리 **영역 전체가 클릭 범위가 아니다.** 들어가는 곳은 문 하나뿐이라
 * 문 앞 구역에 들어와 문을 눌러야 활성화된다. 근접 판정도 그 구역으로 잰다.
 *
 * 마운트 자리는 배치 좌표(`PROJECTS_CENTER`)이지만 건물 자리는 store가 정하므로,
 * 그 차이만큼 그룹을 옮겨 실제 자리에 놓는다(HUD로 건물을 옮기면 문·구역·표시가 함께 따라온다).
 *
 * 모델은 경계 상자를 재 **세로 1**로 맞춰 두고 실제 크기는 배율로 준다 —
 * 그래야 HUD의 "세로크기"가 모델과 무관하게 월드 유닛을 뜻한다.
 * 캐릭터가 통과하지 못하도록 **자기 발자국을 막는 사각형으로 올리고**, 사라질 때 자기 것만 뺀다.
 * 누르는 곳은 문뿐이라 건물 자체는 레이캐스트에서 뺀다 — 우클릭 이동도 건물에 막히지 않는다.
 */
export function ProjectsBuildingInactive({ station }: StationInactiveProps) {
  const building = useProjectsPageStore((s) => s.building)
  const swing = useProjectsPageStore((s) => s.swing)
  const near = useProjectsPageStore((s) => s.near)
  const plate = useProjectsPageStore((s) => s.plate)
  const marker = useProjectsPageStore((s) => s.marker)
  const showOutline = useProjectsPageStore((s) => s.showOutline)
  const phase = useStationStore((s) => s.phase)
  const cursor = usePointerCursor()
  const door = useProjectsDoorStore((s) => s.door)
  const setDoor = useProjectsDoorStore((s) => s.setDoor)

  const { scene } = useGLTF(PROJECTS_BUILDING_URL)
  const setBlocker = useBlockersStore((s) => s.setBlocker)
  const removeBlocker = useBlockersStore((s) => s.removeBlocker)

  const { model, unitScale, base, size, leafParts } = useMemo(() => {
    const model = scene.clone(true)

    // 앞문 한 장을 본체에서 떼어내 따로 그린다. 남은 것은 원래 메시에 갈아끼운다.
    const split = splitBuildingDoor(model, swing.hingeRight)
    if (split) for (const rest of split.replaced) rest.mesh.geometry = rest.geometry

    model.traverse((object) => {
      object.raycast = () => null
    })

    const box = new Box3().setFromObject(model)
    const size = box.getSize(new Vector3())
    const center = box.getCenter(new Vector3())

    // 밑면을 바닥에 대고 가로·깊이 중심을 원점에 맞춘다(모델 원점이 어디에 있든 무관해진다).
    return {
      model,
      size,
      leafParts: split,
      unitScale: 1 / (size.y || 1),
      base: [-center.x, -box.min.y, -center.z] as [number, number, number],
    }
  }, [scene, swing.hingeRight])

  useEffect(() => {
    if (!leafParts) return
    return () => disposeDoor(leafParts)
  }, [leafParts])

  const scale = building.height * unitScale
  const open = useStationStore((s) => s.activeId === PROJECTS_ID && s.phase === 'active')

  // **활성인 동안에는 막지 않는다.** 걸어 들어간 뒤 도착해 연출 이동이 끝나면 밀어내기가 다시 걸려
  // 캐릭터가 건물 밖으로 밀려나기 때문이다. 닫힐 때는 이미 문 앞자리로 옮긴 뒤라 다시 막아도 갇히지 않는다.
  useEffect(() => {
    if (open) {
      removeBlocker(PROJECTS_BLOCKER_ID)
      return
    }
    // 돌아간 상자를 감싸는 축 나란한 상자로 잡는다. 0·90·180·270도에서는 실제 발자국과 같다.
    const angle = MathUtils.degToRad(building.rotation)
    const cos = Math.abs(Math.cos(angle))
    const sin = Math.abs(Math.sin(angle))
    const halfX = ((size.x * cos + size.z * sin) * scale) / 2
    const halfZ = ((size.x * sin + size.z * cos) * scale) / 2
    setBlocker(PROJECTS_BLOCKER_ID, {
      minX: building.x - halfX,
      maxX: building.x + halfX,
      minZ: building.z - halfZ,
      maxZ: building.z + halfZ,
    })
  }, [open, setBlocker, removeBlocker, size, scale, building.rotation, building.x, building.z])

  useEffect(() => () => removeBlocker(PROJECTS_BLOCKER_ID), [removeBlocker])

  // 문의 실제 자리·크기를 재서 올린다. 클릭 판·표시·근접 구역·서는 자리가 전부 이 값을 본다.
  // 모델 좌표를 그룹 안 좌표로 옮기고(base), 배율을 먹인 뒤 건물 회전을 적용한 것이 월드 오프셋이다.
  useEffect(() => {
    if (!leafParts) return
    const angle = MathUtils.degToRad(building.rotation)
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)

    const center = leafParts.box.getCenter(new Vector3())
    const doorSize = leafParts.box.getSize(new Vector3())
    const localX = (center.x + base[0]) * scale
    const localZ = (center.z + base[2]) * scale

    setDoor({
      x: localX * cos + localZ * sin,
      z: -localX * sin + localZ * cos,
      centerY: (center.y + base[1]) * scale,
      topY: (leafParts.box.max.y + base[1]) * scale,
      width: doorSize.x * scale,
      height: doorSize.y * scale,
      // 모델 앞면이 로컬 -z다. 건물을 돌리면 문이 보는 쪽도 함께 돈다.
      facingX: -sin,
      facingZ: -cos,
      scale,
    })
  }, [setDoor, leafParts, base, scale, building.rotation])

  // 문은 **카메라 전환이 끝난 뒤**(활성이 된 시점)에 열린다.
  // 다 닫히면 그것을 알린다 — 나갈 때 카메라가 그 신호를 보고 항공뷰로 돈다.
  const leaf = useRef<Group>(null)
  useEffect(() => {
    const group = leaf.current
    if (!group) return
    const { setDoorClosed, setDoorOpened } = useProjectsSequenceStore.getState()
    // 여닫기가 시작되면 반대쪽 신호부터 내린다. 기다리던 쪽이 낡은 값을 보고 먼저 움직이지 않도록.
    if (open) setDoorClosed(false)
    else setDoorOpened(false)

    const tween = gsap.to(group.rotation, {
      y: open ? MathUtils.degToRad(swing.angle) : 0,
      duration: swing.seconds,
      ease: 'power2.inOut',
      onComplete: () => {
        if (open) setDoorOpened(true)
        else setDoorClosed(true)
      },
    })
    return () => {
      tween.kill()
    }
  }, [open, swing.angle, swing.seconds])

  // 건물 실제 자리와 마운트 자리의 차이. 안쪽은 전부 건물 중심 기준으로 다룬다.
  const offsetX = building.x - PROJECTS_CENTER[0]
  const offsetZ = building.z - PROJECTS_CENTER[1]

  // 근접 구역은 잰 문 자리에서 문이 향하는 쪽으로 뻗는다. 거리·크기는 모델 좌표라 배율이 곱해진다.
  const outline = useMemo<[number, number, number][]>(() => {
    const forward = near.forward * door.scale
    const x = door.x + door.facingX * forward
    const z = door.z + door.facingZ * forward
    const halfWidth = (near.width * door.scale) / 2
    const halfDepth = (near.depth * door.scale) / 2
    // 닫힌 사각형이라 첫 점으로 돌아온다.
    return [
      [x - halfWidth, OUTLINE_Y, z - halfDepth],
      [x + halfWidth, OUTLINE_Y, z - halfDepth],
      [x + halfWidth, OUTLINE_Y, z + halfDepth],
      [x - halfWidth, OUTLINE_Y, z + halfDepth],
      [x - halfWidth, OUTLINE_Y, z - halfDepth],
    ]
  }, [near, door])

  return (
    <group position={[offsetX, 0, offsetZ]}>
      <group rotation={[0, MathUtils.degToRad(building.rotation), 0]} scale={scale}>
        <primitive object={model} position={base} />
        {leafParts && (
          <>
            {/* 문간을 채우는 빛. 문보다 안쪽에 있어 닫혀 있는 동안에는 문에 가려 보이지 않는다. */}
            <DoorGlow box={leafParts.box} hinge={leafParts.hinge} base={base} />
            {/* 경첩 자리에 놓고 그 축으로 돈다. 조각들은 원점이 경첩이도록 미리 옮겨져 있다. */}
            <group
              ref={leaf}
              position={[leafParts.hinge.x + base[0], base[1], leafParts.hinge.z + base[2]]}
            >
              {leafParts.parts.map((part, index) => (
                <mesh
                  key={index}
                  geometry={part.geometry}
                  material={part.material}
                  raycast={() => null}
                />
              ))}
            </group>
          </>
        )}
      </group>

      {/* 문 클릭 판. 자리는 건물 중심에서 떨어진 거리(모델 좌표)라 건물 크기를 따라가고,
          크기는 잰 문 대비 배수다. 향하는 쪽은 문이 보는 쪽에서 나온다.
          포인터 핸들러는 커서뿐이라 우클릭 이동은 그대로 바닥으로 통과하고,
          좌클릭 활성화만 Stations가 잡는다. */}
      <mesh
        position={[plate.x * door.scale, plate.y * door.scale, plate.z * door.scale]}
        rotation={[0, Math.atan2(door.facingX, door.facingZ), 0]}
        userData={{ stationId: station.id }}
        {...cursor}
      >
        <planeGeometry args={[door.width * plate.width, door.height * plate.height]} />
        {/* 평소엔 보이지 않는다. 범위를 눈으로 볼 수 있게 테두리 표시를 켤 때만 드러낸다. */}
        <meshBasicMaterial
          color={OUTLINE_COLOR}
          transparent
          opacity={showOutline ? 0.25 : 0}
          depthWrite={false}
        />
      </mesh>

      {/* 문 위에 뜨는 클릭 표시. 자리는 건물 중심에서 떨어진 거리(모델 좌표)라 건물 크기를 따라간다.
          열려 있는 동안에는 누를 곳이 아니므로 걷힌다. */}
      <group position={[marker.x * door.scale, 0, marker.z * door.scale]}>
        <ClickMarker
          visible={phase === 'idle'}
          y={marker.y * door.scale}
          size={marker.size * door.scale}
          bob={PROJECTS_MARKER_MOTION.bob}
          bobSeconds={PROJECTS_MARKER_MOTION.bobSeconds}
          spinSeconds={PROJECTS_MARKER_MOTION.spinSeconds}
          fadeSeconds={PROJECTS_MARKER_MOTION.fadeSeconds}
        />
      </group>

      {/* 근접 판정 구역 — 범위 확인용이라 HUD에서 켤 때만 그린다. */}
      {showOutline && (
        <Line points={outline} color={OUTLINE_COLOR} lineWidth={2} raycast={() => null} />
      )}
    </group>
  )
}

// 필요해진 순간에 받기 시작하면 그때 서스펜드가 걸려 이미 떠 있던 것들이 사라졌다 돌아온다.
useGLTF.preload(PROJECTS_BUILDING_URL)
