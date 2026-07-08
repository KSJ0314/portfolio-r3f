import { useEffect, useRef } from 'react'
import { Grid } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { Plane, Raycaster, Vector2, Vector3 } from 'three'
import { useThemeStore } from '../../state/useThemeStore'
import { themes } from '../../theme/themes'
import { useCameraStore } from '../../state/useCameraStore'

/** 임시 바닥 크기. 이동 범위(CAMERA_BOUNDS)보다 크게 두어 가장자리가 화면에 안 보이게 한다.
 *  최종엔 바닥 전체 + 경계 투명벽으로 대체, 텍스처는 바닥 전체에 입힌다. */
const GROUND_SIZE = 200

/** 임시 바닥 색(테스트 가시성용 진한 초록). 실제 디자인/텍스처는 이후 단계에서 교체. */
const TEMP_GROUND_COLOR = '#5f9e46'

const _raycaster = new Raycaster()
const _groundPlane = new Plane(new Vector3(0, 1, 0), 0)
const _hit = new Vector3()

export function World() {
  const { camera } = useThree()
  const mode = useThemeStore((s) => s.mode)
  const theme = themes[mode]
  const setTarget = useCameraStore((s) => s.setTarget)
  const holding = useRef(false)
  const pointer = useRef(new Vector2())

  // 우클릭을 뗐을 때(캔버스 밖 포함) 이동 갱신 중단
  useEffect(() => {
    const stop = () => {
      holding.current = false
    }
    window.addEventListener('pointerup', stop)
    return () => window.removeEventListener('pointerup', stop)
  }, [])

  // 누르고 있는 동안 매 프레임 현재 커서 밑 바닥 지점을 목표로 갱신 → 계속 이동
  useFrame(() => {
    if (!holding.current) return
    _raycaster.setFromCamera(pointer.current, camera)
    if (_raycaster.ray.intersectPlane(_groundPlane, _hit)) {
      setTarget(_hit)
    }
  })

  return (
    <group>
      {/* 클릭(레이캐스트) 대상 바닥 — 우클릭 누름/홀드로 이동, 좌클릭은 인터랙션용 예약 */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        onPointerDown={(e) => {
          if (e.button !== 2) return
          e.stopPropagation()
          pointer.current.copy(e.pointer)
          holding.current = true
        }}
        onPointerMove={(e) => {
          pointer.current.copy(e.pointer)
        }}
      >
        <planeGeometry args={[GROUND_SIZE, GROUND_SIZE]} />
        <meshStandardMaterial color={TEMP_GROUND_COLOR} />
      </mesh>

      {/* 임시 격자 — 이동을 눈으로 확인하기 위한 테스트용 참조선(raycast 제외) */}
      <Grid
        cellSize={1}
        cellThickness={0.6}
        sectionSize={5}
        sectionThickness={1.2}
        cellColor={theme.scene.directional}
        sectionColor={theme.colors.accent}
        fadeDistance={60}
        fadeStrength={1.5}
        infiniteGrid
        position={[0, 0.01, 0]}
        raycast={() => null}
      />
    </group>
  )
}
