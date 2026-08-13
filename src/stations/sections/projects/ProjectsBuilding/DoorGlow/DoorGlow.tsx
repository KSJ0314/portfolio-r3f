import { useEffect, useMemo } from 'react'
import { CanvasTexture, DoubleSide, MathUtils, SRGBColorSpace, Vector3 } from 'three'
import { useProjectsPageStore } from '../../../../../state/useProjectsPageStore'
import type { DoorGlowProps } from './DoorGlow.types'

/** 굽는 해상도. 한 방향으로만 변하는 띠라 나머지 한 변은 1이면 된다. */
const TEXTURE_SIZE = 256

/** 카펫과 빛 바닥이 겹쳐 깜빡이지 않도록 띄우는 높이. */
const LAYER_LIFT = 0.002

/** 사라지는 구간에 찍는 정지점 수. 많을수록 곡선이 매끄럽다. */
const FADE_STOPS = 12

/**
 * 꽉 찬 구간에서 투명까지 **부드럽게** 떨어지는 정지점들을 찍는다.
 *
 * 두 점을 직선으로 이으면 꽉 찬 구간과 만나는 자리에 각이 생겨 그 선이 눈에 띈다.
 * 시작과 끝에서 기울기가 0이 되는 곡선을 여러 점으로 근사해 그 각을 없앤다.
 * 두 방향 모두 위치 0이 꽉 찬 쪽이라 같은 함수를 쓴다.
 */
function addFadeStops(gradient: CanvasGradient, solid: number): void {
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
  gradient.addColorStop(solid, 'rgba(255, 255, 255, 1)')
  for (let step = 1; step <= FADE_STOPS; step++) {
    const t = step / FADE_STOPS
    const alpha = 1 - t * t * (3 - 2 * t)
    gradient.addColorStop(solid + (1 - solid) * t, `rgba(255, 255, 255, ${alpha.toFixed(3)})`)
  }
}

/** 색공간을 지정한다. 빠뜨리면 회색이 선형으로 읽혀 그러데이션이 눌린다. */
function toTexture(canvas: HTMLCanvasElement): CanvasTexture {
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  return texture
}

function createCanvas(
  width: number,
  height: number,
): [HTMLCanvasElement, CanvasRenderingContext2D | null] {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  return [canvas, canvas.getContext('2d')]
}

/**
 * 왼쪽이 꽉 차고 오른쪽으로 갈수록 투명해지는 띠 — 문쪽 면이 쓴다.
 * 가로(u)는 뒤집히지 않아 캔버스 왼쪽이 그대로 u=0이다.
 */
function bakeSideways(sharpness: number): CanvasTexture {
  const [canvas, context] = createCanvas(TEXTURE_SIZE, 1)
  if (context) {
    const gradient = context.createLinearGradient(0, 0, TEXTURE_SIZE, 0)
    addFadeStops(gradient, MathUtils.clamp(sharpness, 0, 0.99))
    context.fillStyle = gradient
    context.fillRect(0, 0, TEXTURE_SIZE, 1)
  }
  return toTexture(canvas)
}

/**
 * 문 쪽이 투명하고 안으로 갈수록 꽉 차는 띠 — 바닥 면이 쓴다.
 * 세로는 three가 뒤집어 읽으므로 캔버스 위쪽이 v=1이고, 눕히면 그쪽이 안쪽을 향한다.
 */
function bakeDepthwise(sharpness: number): CanvasTexture {
  const [canvas, context] = createCanvas(1, TEXTURE_SIZE)
  if (context) {
    const gradient = context.createLinearGradient(0, 0, 0, TEXTURE_SIZE)
    addFadeStops(gradient, MathUtils.clamp(sharpness, 0, 0.99))
    context.fillStyle = gradient
    context.fillRect(0, 0, 1, TEXTURE_SIZE)
  }
  return toTexture(canvas)
}

/** 안으로 들어갈수록 어두워지는 띠 — 카펫이 쓴다. 캔버스 위쪽(v=1)이 안쪽이다. */
function bakeCarpet(falloff: number): CanvasTexture {
  const [canvas, context] = createCanvas(1, TEXTURE_SIZE)
  if (context) {
    const dark = Math.round(255 * (1 - MathUtils.clamp(falloff, 0, 1)))
    const gradient = context.createLinearGradient(0, 0, 0, TEXTURE_SIZE)
    gradient.addColorStop(0, `rgb(${dark}, ${dark}, ${dark})`)
    gradient.addColorStop(1, 'rgb(255, 255, 255)')
    context.fillStyle = gradient
    context.fillRect(0, 0, 1, TEXTURE_SIZE)
  }
  return toTexture(canvas)
}

/**
 * 문간 안쪽을 채우는 빛.
 *
 * 면 넷으로 이루어진다.
 * - **문쪽 면** — 열린 문 앞을 덮는다. 왼쪽에서 오른쪽으로 갈수록 밝아진다.
 * - **카펫** — 실내 바닥. 문 평면에서 바로 시작하고 안으로 들어갈수록 어두워진다.
 * - **바닥 면** — 카펫 위에 겹친다. 안쪽으로 갈수록 밝아진다.
 * - **뒷면** — 안쪽을 막는다. 불투명이라 그 너머가 보이지 않는다.
 *
 * 빛을 내는 세 면은 같은 색이고 **안쪽 거리만큼 들어가 있다**. 카펫은 들이지 않는다.
 * 문쪽 면은 문보다 안쪽이라 닫혀 있는 동안에는 문에 가리고, 안으로 열리면 문이 그 뒤로 들어가 덮인다.
 */
export function DoorGlow({ box, hinge, base }: DoorGlowProps) {
  const glow = useProjectsPageStore((s) => s.glow)
  const swing = useProjectsPageStore((s) => s.swing)

  const sideways = useMemo(() => bakeSideways(glow.sharpness), [glow.sharpness])
  const depthwise = useMemo(() => bakeDepthwise(glow.sharpness), [glow.sharpness])
  const carpet = useMemo(() => bakeCarpet(glow.carpetFalloff), [glow.carpetFalloff])
  useEffect(
    () => () => {
      sideways.dispose()
      depthwise.dispose()
      carpet.dispose()
    },
    [sideways, depthwise, carpet],
  )

  const { size, center, floor } = useMemo(
    () => ({
      size: box.getSize(new Vector3()),
      center: box.getCenter(new Vector3()),
      floor: box.min.y,
    }),
    [box],
  )

  const width = size.x * glow.scale
  const height = size.y * glow.scale
  const depth = glow.depth
  // 문쪽 면과 바닥 면은 안쪽으로 더 길게 뺀다. 면이 짧으면 그러데이션이 그 안에서 다 끝나 급격해진다.
  // **둘은 같은 길이**다 — 기준을 달리 잡으면 같은 값이라도 한쪽만 급해진다.
  // 넘친 부분은 뒷면에 가려 보이지 않는다.
  const faceLength = glow.length
  // 경첩 쪽 모서리는 제자리에 두고 반대쪽(안쪽)으로만 늘어나야 한다.
  const hingeSide = Math.sign(center.x - hinge.x) || 1

  return (
    // 문 평면·문간 바닥 높이에 맞춰 두고, 안쪽(+z)으로 파고든다.
    <group
      position={[center.x + base[0], floor + base[1], center.z + base[2]]}
      raycast={() => null}
    >
      {/* 열린 문을 덮는 문쪽 면. **문이 다 열렸을 때의 자리에 고정**이라 문을 따라 돌지 않는다.
          경첩 자리에서 열린 각도만큼 돌린 그룹 안에 문짝과 같은 크기로 겹쳐 둔다. */}
      <group
        position={[hinge.x - center.x, 0, hinge.z - center.z]}
        rotation={[0, MathUtils.degToRad(swing.angle), 0]}
      >
        <mesh position={[(hingeSide * faceLength) / 2, height / 2, 0]}>
          {/* 문틀 위아래에 걸치지 않도록 세로만 살짝 줄인다. */}
          <planeGeometry args={[faceLength, height * 0.97]} />
          <meshBasicMaterial
            map={sideways}
            color={glow.color}
            transparent
            depthWrite={false}
            toneMapped={false}
            side={DoubleSide}
            // 문짝과 같은 평면이라 그대로 두면 어느 쪽이 앞인지 정해지지 않아 얼룩진다.
            polygonOffset
            polygonOffsetFactor={-1}
            polygonOffsetUnits={-1}
          />
        </mesh>
      </group>

      {/* 카펫. 문 평면에서 바로 시작하고, 가로만 따로 조절한다. */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, LAYER_LIFT, depth / 2]}>
        {/* 문틀 양옆으로 조금 더 나오게 둔다. */}
        <planeGeometry args={[width * 1.2, depth]} />
        <meshBasicMaterial
          map={carpet}
          color={glow.carpetColor}
          toneMapped={false}
          side={DoubleSide}
        />
      </mesh>

      {/* 카펫 위에 겹치는 빛 바닥. 안쪽으로 갈수록 꽉 찬다. */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, LAYER_LIFT * 2, faceLength / 2]}>
        <planeGeometry args={[width, faceLength]} />
        <meshBasicMaterial
          map={depthwise}
          color={glow.color}
          transparent
          depthWrite={false}
          toneMapped={false}
          side={DoubleSide}
        />
      </mesh>

      {/* 안쪽을 막는 뒷면. */}
      <mesh position={[0, height / 2, depth]}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial color={glow.color} toneMapped={false} side={DoubleSide} />
      </mesh>
    </group>
  )
}
