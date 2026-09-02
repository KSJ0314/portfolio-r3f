import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Text } from '@react-three/drei'
import { useLoader, useThree } from '@react-three/fiber'
import { Mesh, Raycaster, SRGBColorSpace, TextureLoader, Vector2, type Group } from 'three'
import { BODY_FONT } from '../../../../../content/fonts'
import type { TroikaTextMesh } from '../../../../types'
import { isAfterTouchDrag, registerTouchTarget } from '../../../../../scene/touchMove'
import { usePointerCursor } from '../../../../../scene/usePointerCursor'
import { INK } from '../AboutIntro.constants'
import {
  CONTACT_COPIED_MS,
  CONTACT_COPIED_TEXT,
  CONTACT_HIT_HEIGHT,
  CONTACT_HIT_LIFT,
  CONTACT_ICON_LIFT,
} from './IntroContact.constants'
import type { ContactLine, IntroContactProps } from './IntroContact.types'

const _raycaster = new Raycaster()
const _pointer = new Vector2()

/** 줄 앞에 놓는 아이콘. 판 크기는 세로를 기준으로 잡고 가로는 그림 비율에서 구한다. */
function ContactIcon({ icon, x, y, size }: { icon: string; x: number; y: number; size: number }) {
  const texture = useLoader(TextureLoader, icon)
  const image = texture.image as { width: number; height: number }
  const width = (size * image.width) / image.height

  return (
    <mesh position={[x + width / 2, y, CONTACT_ICON_LIFT]} raycast={() => null}>
      <planeGeometry args={[width, size]} />
      {/* 텍스처 색공간은 훅 반환값에 직접 대입하지 않고 하위 프로퍼티로 넘긴다. */}
      <meshBasicMaterial
        map={texture}
        map-colorSpace={SRGBColorSpace}
        transparent
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  )
}

/**
 * Intro 페이지의 연락처.
 *
 * 누르는 판은 늘 두되 **열려 있는 동안에만 레이캐스트 대상으로** 둔다. 닫힌 상태에서는 페이지 전체가
 * 클릭 판정 면이라, 판이 레이에 걸리면 그 자리에서 스테이션이 열리지 않는다.
 * 판을 걷지 않고 남겨 두는 것은 목록 보기가 그 자리를 찾아 이미지 위에 누를 자리를 덮기 때문이다.
 *
 * 누르기는 R3F 이벤트가 아니라 캔버스 `mousedown`을 직접 듣는다. 활성 상태에서도 이동이 열려 있어
 * 우클릭 홀드 중에는 `pointerdown`이 발생하지 않는다(LEARNING 2026-07-13).
 *
 * 이메일과 전화번호는 클립보드에 담고 그 줄의 글씨를 잠시 바꿔 알린다.
 * 클립보드는 권한이나 컨텍스트에 따라 막힐 수 있어, 실패하면 알리지 않고 그대로 둔다.
 */
export function IntroContact({
  lines,
  x,
  y,
  size,
  gap,
  lineHeight,
  interactive,
}: IntroContactProps) {
  const { camera, gl } = useThree()
  const group = useRef<Group>(null)
  const cursor = usePointerCursor(interactive)
  // 복사했다고 알리는 중인 줄. 한 번에 하나만 알린다.
  const [copied, setCopied] = useState<number | null>(null)
  const timer = useRef(0)
  // 판을 글씨 끝까지 덮으려면 글씨가 얼마나 넓은지 알아야 한다.
  // 글자 수와 글꼴에 따라 달라지므로 troika가 배치를 끝낸 뒤 알려주는 값을 받는다.
  const [textWidth, setTextWidth] = useState<number[]>([])
  const measure = useCallback((index: number, mesh: unknown) => {
    const bounds = (mesh as TroikaTextMesh).textRenderInfo?.blockBounds
    if (!bounds || bounds.length < 4) return
    const next = bounds[2] - bounds[0]
    setTextWidth((prev) => {
      if (Math.abs((prev[index] ?? 0) - next) < 1e-4) return prev
      const widths = [...prev]
      widths[index] = next
      return widths
    })
  }, [])

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const press = useCallback((line: ContactLine, index: number) => {
    if (line.open) {
      window.open(line.open, '_blank', 'noopener,noreferrer')
      return
    }
    if (!line.copy) return
    navigator.clipboard
      ?.writeText(line.copy)
      .then(() => {
        setCopied(index)
        window.clearTimeout(timer.current)
        timer.current = window.setTimeout(() => setCopied(null), CONTACT_COPIED_MS)
      })
      .catch(() => {
        // 클립보드가 막힌 환경이다. 복사되지 않았으므로 알리지 않는다.
      })
  }, [])

  // 탭으로 누를 수 있는 것으로 등록한다. 이동 쪽이 이것을 보고 탭과 홀드를 가른다.
  useEffect(() => {
    const object = group.current
    if (!object || !interactive) return
    return registerTouchTarget(object)
  }, [interactive])

  useEffect(() => {
    if (!interactive) return
    const canvas = gl.domElement

    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return
      // 손가락으로 끌어 이동한 직후에는 받지 않는다. 뗀 자리에서 흉내 낸 마우스 이벤트가 뒤따라온다.
      if (isAfterTouchDrag()) return
      const plates = group.current
      if (!plates) return

      const rect = canvas.getBoundingClientRect()
      _pointer.set(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1,
      )
      _raycaster.setFromCamera(_pointer, camera)

      const hit = _raycaster
        .intersectObjects(plates.children, true)
        .find((it) => typeof it.object.userData.contactIndex === 'number')
      if (!hit) return

      const index = hit.object.userData.contactIndex as number
      const line = lines[index]
      if (line) press(line, index)
    }

    canvas.addEventListener('mousedown', onMouseDown)
    return () => canvas.removeEventListener('mousedown', onMouseDown)
  }, [camera, gl, interactive, lines, press])

  const step = size * lineHeight
  // 아이콘 자리를 세로 크기로 잡아 두고 글씨는 그 오른쪽에서 시작한다.
  const textX = x + size + gap
  // 맨 위가 첫 줄이다. 아래로 쌓아 인용 막대 끝에서 이어지는 것으로 읽힌다.
  const lineY = useMemo(() => lines.map((_, index) => y - index * step), [lines, y, step])

  return (
    <>
      {lines.map((line, index) => (
        <group key={line.text}>
          <ContactIcon icon={line.icon} x={x} y={lineY[index]} size={size} />
          <Text
            onSync={(mesh) => measure(index, mesh)}
            font={BODY_FONT}
            position={[textX, lineY[index], CONTACT_ICON_LIFT]}
            anchorX="left"
            anchorY="middle"
            fontSize={size}
            color={INK}
            raycast={() => null}
          >
            {copied === index ? CONTACT_COPIED_TEXT : line.text}
          </Text>
        </group>
      ))}

      {/* 누르는 판은 한 그룹에 모아 둔다. 위 레이캐스트가 이 그룹만 훑는다.
          아이콘 왼쪽 끝부터 글씨 끝까지 덮어야 줄 어디를 눌러도 잡힌다.
          주소와 복사할 값을 판에 실어 두면 목록 보기가 그 자리를 찾아 그림 위에 덮는다. */}
      <group ref={group}>
        {lines.map((line, index) => {
          const width = size + gap + (textWidth[index] ?? 0)
          return (
            <mesh
              key={line.text}
              position={[x + width / 2, lineY[index], CONTACT_HIT_LIFT]}
              userData={{ contactIndex: index, linkUrl: line.open, copyText: line.copy }}
              // 닫혀 있는 동안에는 레이에 걸리지 않게 둔다. 판은 목록 보기를 위해 남긴다.
              // 켤 때 `undefined`를 주면 R3F가 무시해 꺼진 채로 남으므로 원래 메서드를 직접 준다.
              raycast={interactive ? Mesh.prototype.raycast : () => null}
              {...(interactive ? cursor : {})}
            >
              <planeGeometry args={[width, size * CONTACT_HIT_HEIGHT]} />
              <meshBasicMaterial transparent opacity={0} depthWrite={false} />
            </mesh>
          )
        })}
      </group>
    </>
  )
}
