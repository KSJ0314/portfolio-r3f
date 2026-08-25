import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import type { Group } from 'three'
import { useGalleryGeometryStore } from '../../../../../state/useGalleryGeometryStore'
import { applyInteriorOwnEnv } from '../../interior'
import {
  GALLERY_NAMEPLATE_ENV_INTENSITY,
  GALLERY_NAMEPLATE_LIFT,
  GALLERY_NAMEPLATE_TEXT_MATERIAL,
} from './GalleryNameplates.constants'
import { useGalleryNameplates } from './useGalleryNameplates'
import type { GalleryNameplatesProps } from './GalleryNameplates.types'

/**
 * 전시 칸의 이름판에 프로젝트 이름을 적는다.
 *
 * 이름판 재질에 글씨를 물리지 않고 **그 앞에 글씨만 있는 판을 한 장 세운다.** 이름판의 금색은
 * 재질 색이 아니라 텍스처에서 나오므로 갈아 끼우면 금색이 사라지고, 칸을 복제하면 재질까지
 * 공유돼 칸마다 다른 이름을 넣을 수도 없다. 로비·전시 공간의 트리거가 잰 값으로 판을 직접
 * 세우는 것과 같은 방식이다.
 *
 * 자리는 모델에서 잰 것이라(`useGalleryGeometryStore`) 방 배율을 바꿔도 이름판을 따라간다.
 * 이름이 없는 칸에는 판을 두지 않는다.
 *
 * **글씨에 자기 환경맵을 물려 방 밝기와 무관하게 밝힌다.** 금색 판도 같은 세기로 밝히므로
 * (`GALLERY_OWN_ENV`) 둘이 함께 올라와 금색 위 짙은 글씨로 읽힌다. 환경맵은
 * `InteriorEnvironment`가 씬에 걸어 둔 것이라 그것이 준비된 뒤(첫 프레임)에 건다.
 */
export function GalleryNameplates({ titles }: GalleryNameplatesProps) {
  const spots = useGalleryGeometryStore((s) => s.plates)
  const textures = useGalleryNameplates(spots, titles)
  const sceneRoot = useThree((s) => s.scene)
  const group = useRef<Group>(null)

  // 판이 새로 서면 그 재질에 다시 걸어야 한다.
  const ownEnvDone = useRef(false)
  useEffect(() => {
    ownEnvDone.current = false
  }, [textures])

  useFrame(() => {
    if (ownEnvDone.current) return
    const env = sceneRoot.environment
    const root = group.current
    if (!env || !root) return
    ownEnvDone.current = true
    applyInteriorOwnEnv(
      root,
      env,
      [GALLERY_NAMEPLATE_TEXT_MATERIAL],
      GALLERY_NAMEPLATE_ENV_INTENSITY,
    )
  })

  return (
    <group ref={group}>
      {spots.map((spot, index) =>
        titles[index] ? (
          <mesh key={index} position={[spot.x, spot.y, spot.z + GALLERY_NAMEPLATE_LIFT]}>
            <planeGeometry args={[spot.width, spot.height]} />
            {/* 글씨만 있는 판이라 투명하게 얹는다. 깊이는 쓰지 않아 뒤의 이름판과 다투지 않는다. */}
            <meshStandardMaterial
              name={GALLERY_NAMEPLATE_TEXT_MATERIAL}
              map={textures[index]}
              transparent
              depthWrite={false}
              roughness={1}
              metalness={0}
            />
          </mesh>
        ) : null,
      )}
    </group>
  )
}
