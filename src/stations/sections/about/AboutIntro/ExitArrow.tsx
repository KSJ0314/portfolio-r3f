import { useEffect } from 'react'
import { Crayon, type CrayonDrawing } from '../../../../lib/Crayon'
import { useStationStore } from '../../../../state/useStationStore'
import type { ExitArrowProps } from './AboutIntro.types'

/**
 * 나가기 화살표 획들(0~1 정규화). 곡선 몸통 한 획 + 화살촉 한 획이고, 획마다 씨앗을 달리해
 * 서로 다른 손놀림처럼 보이게 한다. 크레파스 스튜디오에서 그려 뽑은 좌표이며, 여백은 프레임으로 잡혀 있다.
 */
const ARROW_STROKES: CrayonDrawing = [
  { points: [[0.145, 0.161], [0.145, 0.183], [0.145, 0.204], [0.145, 0.232], [0.151, 0.275], [0.157, 0.316], [0.166, 0.342], [0.176, 0.376], [0.191, 0.413], [0.201, 0.439], [0.218, 0.475], [0.241, 0.512], [0.27, 0.544], [0.291, 0.566], [0.319, 0.594], [0.35, 0.615], [0.386, 0.632], [0.411, 0.641], [0.457, 0.649], [0.501, 0.654], [0.537, 0.654], [0.587, 0.654], [0.637, 0.649], [0.683, 0.639], [0.713, 0.634], [0.748, 0.628], [0.769, 0.626], [0.792, 0.626]], seed: 3092, color: '#55bcf0' },
  { points: [[0.631, 0.426], [0.646, 0.439], [0.66, 0.452], [0.675, 0.462], [0.7, 0.484], [0.725, 0.505], [0.742, 0.518], [0.757, 0.533], [0.788, 0.559], [0.811, 0.578], [0.839, 0.602], [0.864, 0.622], [0.883, 0.63], [0.872, 0.656], [0.853, 0.68], [0.839, 0.695], [0.816, 0.725], [0.79, 0.755], [0.767, 0.781], [0.746, 0.804], [0.721, 0.837], [0.706, 0.858], [0.692, 0.877]], seed: 3956, color: '#55bcf0' },
]

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
      drawing={ARROW_STROKES}
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
