import { useEffect } from 'react'
import { Crayon } from '../../../../../lib/Crayon'
import { useStationStore } from '../../../../../state/useStationStore'
import { EXIT_ARROW_STROKES } from './ExitArrow.constants'
import type { ExitArrowProps } from './ExitArrow.types'

/**
 * 활성 상태에서 페이지 우측 아래에 놓이는 나가기 화살표.
 *
 * 크레파스 렌더는 `<Crayon>`이 맡고, 여기서는 **획 좌표와 "누르면 닫는" 행동**만 갖는다.
 * 좌클릭만 종료로 받고, 우클릭(이동)은 막지 않아 뒤의 바닥으로 넘어간다.
 * 텍스처를 불러오는 동안 서스펜드되므로 호출부에서 Suspense로 감싼다.
 */
export function ExitArrow({ x, y, size, color, stroke, roughness, opacity }: ExitArrowProps) {
  // 클릭하면 이 컴포넌트가 곧 사라지므로 커서를 되돌릴 기회가 없다. 언마운트될 때 되돌린다.
  useEffect(() => {
    return () => {
      document.body.style.cursor = ''
    }
  }, [])

  return (
    <Crayon
      drawing={EXIT_ARROW_STROKES}
      position={[x, y, 0]}
      size={size}
      strokeWidth={stroke}
      color={color}
      roughness={roughness}
      opacity={opacity}
      // 그린 그대로를 고정한다 — 스튜디오에서 뽑은 값(Crayon 기본값이 바뀌어도 유지).
      margin={1}
      patchiness={0.35}
      wobbleRatio={0.13}
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
    />
  )
}
