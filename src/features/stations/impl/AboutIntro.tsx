import { Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Line, Text } from '@react-three/drei'
import { useLoader, useThree } from '@react-three/fiber'
import {
  CanvasTexture,
  Loader,
  Matrix4,
  Quaternion,
  SRGBColorSpace,
  type Texture,
  TextureLoader,
  Vector3,
} from 'three'
import gsap from 'gsap'
import { BODY_FONT, HAND_FONT } from '../../../content/fonts'
import { DEFAULT_CRAYON_PARAMS, drawCrayonStroke, type CrayonPoint } from '../../../lib/crayon'
import { useDoc, type DocBase } from '../../../lib/firebase'
import { useCameraStore } from '../../../state/useCameraStore'
import { useIntroPageStore } from '../../../state/useIntroPageStore'
import { useStationStore } from '../../../state/useStationStore'
import type { StationDetailProps, StationInactiveProps } from '../registry'
import { PROFILE_PHOTO_URL } from './aboutIntro.constants'

/** 정면뷰 카메라 높이. Orthographic이라 배율과는 무관하고 near/far 안에만 있으면 된다. */
const FOCUS_HEIGHT = 20

/** 항공뷰 ↔ 정면뷰 전환 시간(초). */
const TURN_SECONDS = 1.5

/**
 * 정면뷰에서 화면 위로 갈 방향.
 * 영역이 x·z 축에 맞춰 놓여 있으므로 -z를 위로 둬야 가로=화면 가로, 세로=화면 세로로 반듯하게 보인다.
 * 바닥에 눕힌 글씨(rotation `[-π/2, 0, 0]`)가 바로 읽히는 방향이기도 하다.
 */
const FRONT_UP = new Vector3(0, 0, -1)

/** 항공뷰의 up. CameraRig가 팔로우할 때 쓰는 기본값과 같아야 복귀가 매끄럽다. */
const WORLD_UP = new Vector3(0, 1, 0)

const _matrix = new Matrix4()
const _center = new Vector3()

/** 바닥과 겹쳐 깜빡이지 않도록 살짝 띄운다. 클릭 판정 면 < 테두리 < 내용 순으로 얹는다. */
const AREA_Y = 0.005
const OUTLINE_Y = 0.01
const CONTENT_Y = 0.02

/** 종이에 적힌 글씨 색. */
const INK = '#3a3a3a'

/** Intro가 쓰는 profile 필드. 나머지 필드(name·email 등)는 이 페이지에 싣지 않는다. */
interface ProfileDoc extends DocBase {
  tagline?: string
  intro?: string
}

/** Firestore에는 줄바꿈이 `\n` 두 글자로 들어 있다. 실제 개행으로 바꿔야 3D 텍스트가 줄을 나눈다. */
const withLineBreaks = (text: string) => text.replace(/\\n/g, '\n')

/** troika가 글자 배치를 끝내고 넘겨주는 정보 중 쓰는 것 — 글 덩어리의 경계 `[minX, minY, maxX, maxY]`. */
interface TroikaTextMesh {
  textRenderInfo?: { blockBounds?: ArrayLike<number> }
}

/**
 * 사진 로드 실패 시 재시도 간격(ms). 초기 시도 1회 + 이 배열만큼 재시도한다.
 * 일시적 실패(네트워크 순단 등)는 이 안에서 대개 회복되고, 경로 오류처럼 영구적인 실패는 소진 후 멈춘다.
 */
const PHOTO_RETRY_DELAYS = [500, 1500, 3000]

/**
 * 실패 시 재시도하는 TextureLoader.
 *
 * `useLoader`(Suspense)는 텍스처를 렌더 트리에 직접 주입해, mesh가 처음 마운트될 때부터 텍스처가 붙어 있다.
 * 상태로 뒤늦게 주입하는 방식은 한 프레임 늦게 반영돼 깜빡이지만, 이 방식은 그렇지 않다.
 * 재시도만 얹으려고 로더의 `load`를 감싼다 — 최종 실패는 그대로 던져 Suspense 경계(ErrorBoundary)가 받는다.
 */
class RetryingTextureLoader extends TextureLoader {
  load(
    url: string,
    onLoad?: (data: Texture<HTMLImageElement>) => void,
    onProgress?: (event: ProgressEvent) => void,
    onError?: (err: unknown) => void,
  ): Texture<HTMLImageElement> {
    let texture!: Texture<HTMLImageElement>
    const attempt = (retries: number) => {
      texture = super.load(url, onLoad, onProgress, (err) => {
        if (retries < PHOTO_RETRY_DELAYS.length) {
          setTimeout(() => attempt(retries + 1), PHOTO_RETRY_DELAYS[retries])
        } else {
          onError?.(err)
        }
      })
    }
    attempt(0)
    return texture
  }
}

/**
 * 하단 프로필 사진. 텍스처를 불러오는 동안 서스펜드되므로 호출부에서 Suspense로 감싼다.
 * 가로는 불러온 이미지의 실제 크기에서 계산한다 — 사진을 갈아끼워도 비율이 알아서 맞는다.
 */
function ProfilePhoto({ bottom, height }: { bottom: number; height: number }) {
  const gl = useThree((s) => s.gl)
  const texture = useLoader(RetryingTextureLoader, PROFILE_PHOTO_URL)

  // 텍스처를 GPU에 미리 올린다(drei useTexture와 같은 처리 — 첫 렌더의 업로드 지연 방지).
  useEffect(() => {
    gl.initTexture(texture)
  }, [gl, texture])

  const image = texture.image as { width: number; height: number }
  const width = height * (image.width / image.height)

  return (
    <mesh position={[0, bottom + height / 2, 0]} raycast={() => null}>
      <planeGeometry args={[width, height]} />
      {/* 텍스처 색공간은 훅 반환값에 직접 대입하지 않고 하위 프로퍼티로 넘긴다. */}
      <meshBasicMaterial map={texture} map-colorSpace={SRGBColorSpace} transparent toneMapped={false} />
    </mesh>
  )
}

/** 화살표 텍스처 한 변의 픽셀 수. 화면에 뜨는 크기보다 넉넉히 잡아 알갱이가 뭉개지지 않게 한다. */
const ARROW_TEXTURE_PIXELS = 512

/** 텍스처가 덮는 정사각 영역은 화살표 길이보다 조금 넓다(획이 잘리지 않도록). */
const ARROW_TEXTURE_MARGIN = 1.35

interface ExitArrowProps {
  x: number
  y: number
  size: number
  color: string
  stroke: number
  roughness: number
  opacity: number
}

/**
 * 크레파스로 그린 나가기 화살표를 캔버스에 굽는다.
 * 몸통 한 획 + 화살촉 두 획이고, 획마다 씨앗을 달리해 서로 다른 손놀림처럼 보이게 한다.
 */
function drawArrow(
  ctx: CanvasRenderingContext2D,
  pixels: number,
  params: { color: string; strokePixels: number; roughness: number; opacity: number },
): void {
  const at = (u: number, v: number): CrayonPoint => [u * pixels, v * pixels]
  const base = {
    ...DEFAULT_CRAYON_PARAMS,
    color: params.color,
    width: params.strokePixels,
    roughness: params.roughness,
    opacity: params.opacity,
    wobble: params.strokePixels * 0.18,
  }

  // 몸통. 끝을 조금 지나쳐 그어야 손으로 그은 느낌이 난다.
  drawCrayonStroke(ctx, [at(0.1, 0.5), at(0.84, 0.5)], { ...base, seed: 11 })
  // 화살촉 두 획.
  drawCrayonStroke(ctx, [at(0.58, 0.24), at(0.88, 0.5)], { ...base, seed: 29 })
  drawCrayonStroke(ctx, [at(0.58, 0.76), at(0.88, 0.5)], { ...base, seed: 47 })
}

/** 크레파스 화살표를 굽는 파라미터. useLoader의 캐시 키로 쓰려고 JSON으로 직렬화한다. */
interface ArrowTextureParams {
  color: string
  strokePixels: number
  roughness: number
  opacity: number
}

/**
 * 크레파스 화살표 텍스처를 캔버스에 구워 내주는 로더.
 *
 * 크레파스는 파일이 아니라 그때그때 굽는 것이지만, `useLoader`(Suspense)에 태우려고 로더로 감싼다.
 * 그래야 사진과 똑같이 **텍스처가 준비된 뒤 렌더 트리에 직접 주입**돼 깜빡이지 않는다.
 * 앞으로 다른 손그림 요소도 같은 틀(전용 로더 + useLoader)을 쓸 수 있다.
 * 입력(`key`)은 굽는 파라미터를 직렬화한 문자열이고, 이게 곧 useLoader의 캐시 키다.
 */
class CrayonArrowLoader extends Loader<CanvasTexture> {
  load(
    key: string,
    onLoad?: (data: CanvasTexture) => void,
    _onProgress?: (event: ProgressEvent) => void,
    onError?: (err: unknown) => void,
  ): void {
    try {
      const params = JSON.parse(key) as ArrowTextureParams
      const canvas = document.createElement('canvas')
      canvas.width = ARROW_TEXTURE_PIXELS
      canvas.height = ARROW_TEXTURE_PIXELS
      const ctx = canvas.getContext('2d')
      if (ctx) drawArrow(ctx, ARROW_TEXTURE_PIXELS, params)
      const texture = new CanvasTexture(canvas)
      texture.colorSpace = SRGBColorSpace
      onLoad?.(texture)
    } catch (err) {
      onError?.(err)
    }
  }
}

/**
 * 활성 상태에서 페이지 우측 아래에 놓이는 나가기 화살표.
 *
 * 크레파스는 매끈한 선이 아니라 종이 결에 걸린 왁스 알갱이라, 벡터 선 대신 캔버스에 구운 텍스처를 쓴다.
 * 누르면 스테이션을 닫는다. 텍스처를 불러오는 동안 서스펜드되므로 호출부에서 Suspense로 감싼다.
 */
function ExitArrow({ x, y, size, color, stroke, roughness, opacity }: ExitArrowProps) {
  const gl = useThree((s) => s.gl)
  const plane = size * ARROW_TEXTURE_MARGIN

  // 월드 단위 굵기를 텍스처 픽셀로 환산한 뒤, 굽는 파라미터를 캐시 키로 직렬화한다.
  const key = JSON.stringify({
    color,
    strokePixels: (stroke / plane) * ARROW_TEXTURE_PIXELS,
    roughness,
    opacity,
  } satisfies ArrowTextureParams)
  const texture = useLoader(CrayonArrowLoader, key)

  // 텍스처를 GPU에 미리 올린다(사진과 같은 처리).
  useEffect(() => {
    gl.initTexture(texture)
  }, [gl, texture])

  // 클릭하면 이 컴포넌트가 곧 사라지므로 커서를 되돌릴 기회가 없다. 언마운트될 때 되돌린다.
  useEffect(() => {
    return () => {
      document.body.style.cursor = ''
    }
  }, [])

  return (
    // 텍스처 판이 곧 클릭 판정 범위다.
    // 좌클릭만 종료로 받고, 우클릭(이동)은 막지 않아 뒤의 바닥으로 넘어간다.
    <mesh
      position={[x, y, 0]}
      onPointerDown={(e) => {
        if (e.button !== 0) return
        e.stopPropagation()
        useStationStore.getState().requestClose()
      }}
      onPointerOver={() => {
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        document.body.style.cursor = ''
      }}
    >
      <planeGeometry args={[plane, plane]} />
      <meshBasicMaterial map={texture} transparent toneMapped={false} />
    </mesh>
  )
}

/**
 * `about-intro` 비활성 상태 — 종이 위에 놓인 Intro 페이지.
 *
 * 이 영역이 곧 클릭 판정 범위다. 안쪽 어디를 눌러도 활성화된다.
 * 테두리는 범위를 눈으로 확인하는 개발용이라 HUD에서 켤 때만 그린다.
 *
 * 페이지 내용은 활성 여부와 무관하게 늘 그려져 있다 — 활성화는 카메라만 돌린다.
 */
export function AboutIntroInactive({ station }: StationInactiveProps) {
  const { width, height } = useIntroPageStore((s) => s.area)
  const layout = useIntroPageStore((s) => s.layout)
  const showOutline = useIntroPageStore((s) => s.showOutline)
  const { data: profile } = useDoc<ProfileDoc>('profile', 'main')

  // 인용 막대를 본문 높이에 맞추려면 줄이 몇 줄로 접혔는지 알아야 한다.
  // 글자 크기·폭·줄바꿈에 따라 달라지므로 troika가 배치를 끝낸 뒤 알려주는 값을 받는다.
  const [introHeight, setIntroHeight] = useState(0)
  const handleIntroSync = useCallback((mesh: unknown) => {
    const bounds = (mesh as TroikaTextMesh).textRenderInfo?.blockBounds
    if (!bounds || bounds.length < 4) return
    const next = bounds[3] - bounds[1]
    setIntroHeight((prev) => (Math.abs(prev - next) < 1e-4 ? prev : next))
  }, [])

  const halfWidth = width / 2
  const halfHeight = height / 2

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

  const {
    paddingX,
    paddingY,
    taglineTop,
    taglineSize,
    introTop,
    introLeft,
    introSize,
    introLineHeight,
    quoteBarWidth,
    quoteBarGap,
    photoBottom,
    photoHeight,
  } = layout
  // 여백 안쪽이 내용이 놓이는 상자다. 요소별 여백은 여기서 각자 더 들어간다.
  const innerWidth = width - paddingX * 2
  const taglineY = halfHeight - paddingY - taglineTop
  const introX = -halfWidth + paddingX + introLeft
  const introY = taglineY - taglineSize - introTop
  const photoY = -halfHeight + paddingY + photoBottom

  return (
    <>
      {/* 클릭 판정 면. 포인터 핸들러가 없어 R3F 이벤트에서는 무시되므로 우클릭 이동은 바닥으로 통과한다.
          좌클릭 활성화는 Stations가 직접 쏘는 레이캐스트가 잡는다. */}
      <mesh
        position={[0, AREA_Y, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        userData={{ stationId: station.id }}
      >
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* 영역 테두리 — 범위 확인용이라 개발용 HUD에서 켤 때만 그린다.
          우클릭 이동을 가로막지 않도록 레이캐스트에서 뺀다. */}
      {showOutline && <Line points={outline} color={INK} lineWidth={2} raycast={() => null} />}

      {/* 페이지 내용. 그룹을 눕혀두면 안쪽은 화면 좌표(x=가로, y=세로)로 쓸 수 있다.
          내용은 전부 레이캐스트에서 빼야 그 밑의 클릭 판정 면이 잡힌다. */}
      <group rotation={[-Math.PI / 2, 0, 0]} position={[0, CONTENT_Y, 0]}>
        {profile?.tagline && (
          <Text
            font={HAND_FONT}
            position={[0, taglineY, 0]}
            anchorX="center"
            anchorY="top"
            fontSize={taglineSize}
            maxWidth={innerWidth}
            textAlign="center"
            color={INK}
            raycast={() => null}
          >
            {profile.tagline}
          </Text>
        )}

        {/* 마크다운 인용구처럼 본문 왼쪽에 세로 막대를 세운다. 높이는 접힌 본문 높이를 따라간다. */}
        {profile?.intro && introHeight > 0 && (
          <mesh
            position={[introX - quoteBarGap - quoteBarWidth / 2, introY - introHeight / 2, 0]}
            raycast={() => null}
          >
            <planeGeometry args={[quoteBarWidth, introHeight]} />
            <meshBasicMaterial color={INK} toneMapped={false} />
          </mesh>
        )}

        {profile?.intro && (
          <Text
            onSync={handleIntroSync}
            font={BODY_FONT}
            position={[introX, introY, 0]}
            anchorX="left"
            anchorY="top"
            fontSize={introSize}
            lineHeight={introLineHeight}
            maxWidth={innerWidth - introLeft}
            textAlign="left"
            color={INK}
            raycast={() => null}
          >
            {withLineBreaks(profile.intro)}
          </Text>
        )}

        <Suspense fallback={null}>
          <ProfilePhoto bottom={photoY} height={photoHeight} />
        </Suspense>
      </group>
    </>
  )
}

/**
 * `about-intro` 활성 구현 — 카메라 각도 전환.
 *
 * Intro는 내용이 바닥에 그려져 있으므로 활성화해도 오브젝트는 그대로 두고 **카메라만 돌린다**.
 * 정면(수직)에서 내려다보면 종이에 적힌 내용이 웹페이지처럼 2D로 읽히고,
 * 닫으면 항공뷰로 돌아가 다시 3D 맵으로 보인다.
 *
 * 배율(zoom)은 건드리지 않는다. 정면에서 보이는 크기가 실제 크기와 같아야 영역 크기를 판단할 수 있다.
 */
export function AboutIntroScene({ station, phase }: StationDetailProps) {
  const camera = useThree((s) => s.camera)
  const { width, height } = useIntroPageStore((s) => s.area)
  const {
    exitArrowSize,
    exitArrowRight,
    exitArrowBottom,
    exitArrowColor,
    exitArrowStroke,
    exitArrowRoughness,
    exitArrowOpacity,
  } = useIntroPageStore((s) => s.layout)
  const aerialPosition = useRef(new Vector3())
  const aerialQuaternion = useRef(new Quaternion())
  const frontPosition = useRef(new Vector3())
  const frontQuaternion = useRef(new Quaternion())

  /** 두 자세를 섞어 카메라에 적용한다. 0이면 항공뷰, 1이면 정면뷰. */
  const applyPose = useCallback(
    (progress: number) => {
      // 돌아갈 항공뷰 자세는 팔로우 규칙(캐릭터 + 오프셋, 캐릭터를 바라봄)으로 매번 다시 계산한다.
      // 걸어서 나가는 동안에도 종료 애니메이션이 도니, 한 번 잡아두면 캐릭터가 이동한 만큼 마지막에 튄다.
      const { position, followOffset } = useCameraStore.getState()
      aerialPosition.current.copy(position).add(followOffset)
      _matrix.lookAt(aerialPosition.current, position, WORLD_UP)
      aerialQuaternion.current.setFromRotationMatrix(_matrix)

      camera.position.lerpVectors(aerialPosition.current, frontPosition.current, progress)
      camera.quaternion.slerpQuaternions(
        aerialQuaternion.current,
        frontQuaternion.current,
        progress,
      )
    },
    [camera],
  )

  // 정면뷰 자세는 페이지 한가운데 위에서 수직으로 내려다보는 고정 자세다.
  useLayoutEffect(() => {
    const [x, z] = station.position
    frontPosition.current.set(x, FOCUS_HEIGHT, z)
    _center.set(x, 0, z)
    // 수직으로 내려다보면 기본 up(+y)이 시선과 겹쳐 화면 방향이 정해지지 않으므로 직접 준다.
    _matrix.lookAt(frontPosition.current, _center, FRONT_UP)
    frontQuaternion.current.setFromRotationMatrix(_matrix)

    // 사이트 첫 화면은 active로 시작한다 — 전환할 이전 자세가 없으므로 바로 정면뷰에 놓는다.
    if (useStationStore.getState().phase === 'active') applyPose(1)
  }, [station, applyPose])

  useEffect(() => {
    if (phase !== 'entering' && phase !== 'exiting') return
    const entering = phase === 'entering'

    const state = { progress: entering ? 0 : 1 }
    const tween = gsap.to(state, {
      progress: entering ? 1 : 0,
      duration: TURN_SECONDS,
      ease: 'power2.inOut',
      onUpdate: () => applyPose(state.progress),
      onComplete: () => {
        const { enterComplete, exitComplete } = useStationStore.getState()
        if (entering) enterComplete()
        else exitComplete()
      },
    })
    return () => {
      tween.kill()
    }
  }, [phase, applyPose])

  // 나가기 화살표는 완전히 활성인 동안에만 둔다(진입·종료 애니메이션 중에는 안 보인다).
  if (phase !== 'active') return null

  const [x, z] = station.position
  return (
    <group position={[x, CONTENT_Y, z]} rotation={[-Math.PI / 2, 0, 0]}>
      <Suspense fallback={null}>
        <ExitArrow
          x={width / 2 - exitArrowRight - exitArrowSize / 2}
          y={-height / 2 + exitArrowBottom}
          size={exitArrowSize}
          color={exitArrowColor}
          stroke={exitArrowStroke}
          roughness={exitArrowRoughness}
          opacity={exitArrowOpacity}
        />
      </Suspense>
    </group>
  )
}
