import { useEffect, useMemo } from 'react'
import { useTexture } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { RepeatWrapping, SRGBColorSpace } from 'three'
import { useThemeStore } from '../../../state/useThemeStore'
import { PAPER_DAY_TINT, PAPER_NIGHT_TINT, PAPER_TILE_SIZE } from './PaperGround.constants'
import { useGridPaperPreview } from './PaperGround.hooks'
import type { PaperGroundProps } from './PaperGround.types'

/**
 * 모눈종이 바닥.
 * 손그림 모눈 텍스처(scripts/generate-grid-paper.mjs로 생성한 심리스 이미지)를 바닥 전체에 타일링한다.
 *
 * 조명을 받지 않는 재질(basic)을 쓴다.
 * 조명을 받게 하면 종이색에 광량(1 미만)이 곱해져 흰 종이가 회색으로 찍힘.
 * 낮/밤은 조명 대신 종이에 색을 곱해 표현한다.
 * 이동 입력은 World가 처리하므로 여기서는 레이캐스트 대상인 mesh와 겉모습만 담당한다.
 */
export function PaperGround({ size, onPointerDown, onPointerMove }: PaperGroundProps) {
  const mode = useThemeStore((s) => s.mode)
  const maxAnisotropy = useThree((s) => s.gl.capabilities.getMaxAnisotropy())
  const [baked] = useTexture(['/textures/paper/grid-paper.png'])
  // 개발용 HUD로 값을 조절 중이면 그 값으로 즉석에서 구운 텍스처를 대신 쓴다.
  const preview = useGridPaperPreview(size, maxAnisotropy)
  const map = preview ?? baked

  // 구워둔 PNG의 타일링 설정. 미리보기 텍스처는 만들 때 같은 설정을 이미 받는다.
  useEffect(() => {
    const repeat = size / PAPER_TILE_SIZE
    // 훅 반환값(useTexture) 직접 대입은 eslint(react-hooks/immutability)가 막는다.
    // 배열에서 꺼낸 값은 추적하지 않으므로 이 우회가 필요하다(불필요한 반복이 아님).
    for (const texture of [baked]) {
      texture.wrapS = RepeatWrapping
      texture.wrapT = RepeatWrapping
      texture.repeat.set(repeat, repeat)
      texture.colorSpace = SRGBColorSpace
      // 바닥이 비스듬히 눕는 아이소메트릭 뷰라, 이방성 필터링이 없으면 밉맵이 모눈 선을 뭉갠다.
      texture.anisotropy = maxAnisotropy
      texture.needsUpdate = true
    }
  }, [baked, maxAnisotropy, size])

  const tint = useMemo(() => (mode === 'dark' ? PAPER_NIGHT_TINT : PAPER_DAY_TINT), [mode])

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} onPointerDown={onPointerDown} onPointerMove={onPointerMove}>
      <planeGeometry args={[size, size]} />
      {/* 톤 매핑을 거치면 흰 종이가 회색으로 눌린다. 이 바닥만 그 보정에서 제외. */}
      <meshBasicMaterial map={map} color={tint} toneMapped={false} />
    </mesh>
  )
}
